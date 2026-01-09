import React, { createContext, useContext, useEffect, useReducer, useState, useRef } from 'react';
import { api, handleApiError, attachAuthToken } from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import { productService } from '../services/productService';
import { useToast } from '../src/context/useToastHook';

const WishlistContext = createContext(null);

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.items.find(item => item.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'CLEAR_WISHLIST':
      return {
        items: []
      };

    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { showToast } = useToast();
  const lastFetchedTokenRef = useRef(null);

  useEffect(() => {
    const token = session?.access_token || session?.provider_token || null;
    attachAuthToken(token);
  }, [session]);

  useEffect(() => {
    let mounted = true;
    const lastToken = lastFetchedTokenRef.current;

    async function loadWishlist() {
      setLoading(true);
      try {
        const token = session?.access_token || session?.provider_token || null;
        attachAuthToken(token);

        const res = await api.get('/me/wishlist');

        let rows = res?.data?.data ?? res?.data?.items ?? res?.data ?? res ?? [];

        if (!Array.isArray(rows)) {
          if (rows && Array.isArray(rows.rows)) rows = rows.rows;
          else rows = [];
        }

        const uniqueIds = Array.from(new Set(rows.map(r => r?.product_id).filter(Boolean)));

        let products = [];
        if (uniqueIds.length > 0) {
          try {
            const resp = await productService.getProducts({ filters: { ids: uniqueIds } });
            products = resp?.products ?? [];
          } catch (batchErr) {
            products = await Promise.all(uniqueIds.map(id => productService.getProduct(id).catch(() => null)));
          }
        }

        const productMap = new Map();
        products.forEach(p => { if (p && p.id) productMap.set(p.id, p); });

        const joined = rows.map(row => {
          const prod = productMap.get(row.product_id) || { id: row.product_id };
          return { ...prod, _wishlistId: row.id, _wishlistRow: row };
        });

        if (!mounted) return;
        dispatch({ type: 'CLEAR_WISHLIST' });
        joined.forEach(p => dispatch({ type: 'ADD_TO_WISHLIST', payload: p }));
        lastFetchedTokenRef.current = token ?? null;
      } catch (err) {
        console.error('Failed to load wishlist', handleApiError(err));
        showToast?.('Failed to load wishlist', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const token = session?.access_token || session?.provider_token || null;
    if (!token) {
      if (lastToken != null) dispatch({ type: 'CLEAR_WISHLIST' });
      lastFetchedTokenRef.current = null;
      return () => { mounted = false };
    }

    if (token && lastFetchedTokenRef.current === token) return () => { mounted = false };

    loadWishlist();
    return () => { mounted = false };
  }, [session]);

  const toggleWishlist = async (productId) => {
    if (!productId) return false;
    const isInWishlist = state.items.find(item => item.id === productId);

    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
      try {
        await api.delete(`/me/wishlist/${productId}`);
        return true;
      } catch (err) {
        const status = err?.response?.status;
        dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });
        if (status === 401) showToast?.('Please sign in to remove wishlist items', { type: 'error' });
        else showToast?.('Failed to remove from wishlist', { type: 'error' });
        console.error('toggleWishlist.remove error', handleApiError(err));
        return false;
      }
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });
      try {
        const res = await api.post('/me/wishlist', { product_id: productId });
        if (res?.data?.product) {
          dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
          dispatch({ type: 'ADD_TO_WISHLIST', payload: res.data.product });
        }
        return true;
      } catch (err) {
        const status = err?.response?.status;
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
        if (status === 409) {
          showToast?.('Item already in wishlist', { type: 'info' });
          try {
            const prod = await productService.getProduct(productId);
            if (prod) dispatch({ type: 'ADD_TO_WISHLIST', payload: prod });
          } catch (e) {
          }
          return true;
        }
        if (status === 401) showToast?.('Please sign in to add wishlist items', { type: 'error' });
        else showToast?.('Failed to add to wishlist', { type: 'error' });
        console.error('toggleWishlist.add error', handleApiError(err));
        return false;
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ state, dispatch, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { api, handleApiError, attachAuthToken } from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import { productService } from '../services/productService';
import { useToast } from '../src/context/useToastHook';

// Create the context
const WishlistContext = createContext(null);

// Reducer function
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.items.find(item => item.id === action.payload.id)) {
        return state; // Item already in wishlist
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

// Provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  const [loading, setLoading] = useState(false);
  const { session } = useAuth(); // valid hook usage inside component
  const { showToast } = useToast();

  // Attach token to api client when session changes
  useEffect(() => {
    const token = session?.access_token || session?.provider_token || null;
    attachAuthToken(token);
  }, [session]);

  // Load wishlist rows and join with products
  useEffect(() => {
    let mounted = true;
    async function loadWishlist() {
      setLoading(true);
      try {
        const res = await api.get('/me/wishlist');
        const rows = res?.data?.items ?? res?.data ?? res ?? [];

        // rows expected shape: [{ id, user_id, product_id }, ...]
        const uniqueIds = Array.from(new Set(rows.map(r => r.product_id).filter(Boolean)));

        // Fetch product details in parallel (batch if backend supports it)
        const products = await Promise.all(uniqueIds.map(id => productService.getProduct(id).catch(() => null)));

        // Map product_id -> product
        const productMap = new Map();
        products.forEach(p => { if (p && p.id) productMap.set(p.id, p); });

        // Combine rows with product details
        const joined = rows.map(row => {
          const prod = productMap.get(row.product_id) || { id: row.product_id };
          return { ...prod, _wishlistId: row.id, _wishlistRow: row };
        });

        if (!mounted) return;
        dispatch({ type: 'CLEAR_WISHLIST' });
        // Add joined products to state
        joined.forEach(p => dispatch({ type: 'ADD_TO_WISHLIST', payload: p }));
      } catch (err) {
        console.error('Failed to load wishlist', handleApiError(err));
        // do not block UI; optional toast
        showToast?.('Failed to load wishlist', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadWishlist();
    return () => { mounted = false };
  }, [session]);

  // toggleWishlist expects a productId (string)
  const toggleWishlist = async (productId) => {
    if (!productId) return false;
    const isInWishlist = state.items.find(item => item.id === productId);

    if (isInWishlist) {
      // remove
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
      try {
        await api.delete(`/me/wishlist/${productId}`);
        return true;
      } catch (err) {
        const status = err?.response?.status;
        // Revert optimistic change
        dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });
        if (status === 401) showToast?.('Please sign in to remove wishlist items', { type: 'error' });
        else showToast?.('Failed to remove from wishlist', { type: 'error' });
        console.error('toggleWishlist.remove error', handleApiError(err));
        return false;
      }
    } else {
      // add
      dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });
      try {
        const res = await api.post('/me/wishlist', { product_id: productId });
        // Backend may return created wishlist row and/or full product. If product returned, replace
        if (res?.data?.product) {
          dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
          dispatch({ type: 'ADD_TO_WISHLIST', payload: res.data.product });
        }
        return true;
      } catch (err) {
        const status = err?.response?.status;
        // revert optimistic add
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
        if (status === 409) {
          // Already exists — treat as success but refresh entry
          showToast?.('Item already in wishlist', { type: 'info' });
          try {
            const prod = await productService.getProduct(productId);
            if (prod) dispatch({ type: 'ADD_TO_WISHLIST', payload: prod });
          } catch (e) {
            // ignore
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

// Custom hook to use wishlist
// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
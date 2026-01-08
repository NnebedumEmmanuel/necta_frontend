import React, { createContext, useContext, useEffect, useReducer, useState, useRef } from 'react';
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
  const lastFetchedTokenRef = useRef(null);

  // Attach token to api client when session changes
  useEffect(() => {
    const token = session?.access_token || session?.provider_token || null;
    attachAuthToken(token);
  }, [session]);

  // Load wishlist rows and join with products
  useEffect(() => {
    let mounted = true;
    const lastToken = lastFetchedTokenRef.current;

    async function loadWishlist() {
      setLoading(true);
      try {
        // Ensure auth token is attached before making request. This prevents an early 401
        const token = session?.access_token || session?.provider_token || null;
        attachAuthToken(token);

        const res = await api.get('/me/wishlist');

        // backend responses can be shaped in multiple ways: { data: [...] } or { data: { data: [...] } }
        let rows = res?.data?.data ?? res?.data?.items ?? res?.data ?? res ?? [];

        // normalize to array
        if (!Array.isArray(rows)) {
          if (rows && Array.isArray(rows.rows)) rows = rows.rows;
          else rows = [];
        }

        // rows expected shape: [{ id, user_id, product_id }, ...]
        const uniqueIds = Array.from(new Set(rows.map(r => r?.product_id).filter(Boolean)));

        // Prefer a single batched product fetch to avoid N+1 requests.
        // If the backend doesn't support fetching by ids, fall back to per-id requests.
        let products = [];
        if (uniqueIds.length > 0) {
          try {
            const resp = await productService.getProducts({ filters: { ids: uniqueIds } });
            products = resp?.products ?? [];
          } catch (batchErr) {
            // fallback to N+1 fetches if batch fails for any reason
            products = await Promise.all(uniqueIds.map(id => productService.getProduct(id).catch(() => null)));
          }
        }

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
        // remember the token we fetched for so duplicate effects do not refetch the same data
        lastFetchedTokenRef.current = token ?? null;
      } catch (err) {
        console.error('Failed to load wishlist', handleApiError(err));
        // do not block UI; optional toast
        showToast?.('Failed to load wishlist', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // If there's no authenticated session yet, do not attempt to fetch (prevents 401 on first load)
    const token = session?.access_token || session?.provider_token || null;
    if (!token) {
      // if we previously had wishlist data for another user, clear it
      if (lastToken != null) dispatch({ type: 'CLEAR_WISHLIST' });
      lastFetchedTokenRef.current = null;
      return () => { mounted = false };
    }

    // prevent duplicate fetches for the same token (React StrictMode or identity churn)
    if (token && lastFetchedTokenRef.current === token) return () => { mounted = false };

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
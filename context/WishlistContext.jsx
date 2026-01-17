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
            // request wishlist products page=1; ensure page-based pagination is explicit
            const resp = await productService.getProducts({ filters: { ids: uniqueIds }, page: 1, limit: Math.max(20, uniqueIds.length) });
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

    // Helper to resolve wishlist row id for a given product for this user
    const resolveWishlistRowId = async () => {
      try {
        const checkRes = await api.get(`/me/wishlist/check?product_id=${encodeURIComponent(productId)}`);
        const body = checkRes?.data ?? {};
        if (body?.success && body?.present && body?.id) return body.id;
      } catch (e) {
        // ignore - will return undefined
      }
      return undefined;
    };

    if (isInWishlist) {
      // Remove flow: prefer using stored wishlist row id (_wishlistId) when available
      const rowId = isInWishlist._wishlistId || isInWishlist._wishlistRow?.id;
      let resolvedId = rowId;
      if (!resolvedId) {
        resolvedId = await resolveWishlistRowId();
      }

      // Optimistically remove from UI
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });

      if (!resolvedId) {
        // nothing to delete on server; treat as removed
        try { setTimeout(() => window.dispatchEvent(new CustomEvent('necta_wishlist_updated')), 0) } catch {}
        return true;
      }

      try {
        const res = await api.delete(`/me/wishlist/${resolvedId}`);
        // success — ensure UI consistency (server returns deleted row(s))
        try { setTimeout(() => window.dispatchEvent(new CustomEvent('necta_wishlist_updated')), 0) } catch {}
        return true;
      } catch (err) {
        // revert optimistic removal
        dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });
        const status = err?.response?.status;
        if (status === 401) showToast?.('Please sign in to remove wishlist items', { type: 'error' });
        else showToast?.('Failed to remove from wishlist', { type: 'error' });
        console.error('toggleWishlist.remove error', handleApiError(err));
        return false;
      }
    } else {
      // Add flow: prevent duplicates locally
      if (state.items.some(i => i.id === productId)) return true;

      // Optimistically add a lightweight placeholder so UI updates immediately
      dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });

      try {
        const postRes = await api.post('/me/wishlist', { product_id: productId });
        const data = postRes?.data ?? {};

        // server returned inserted wishlist rows in data
        const inserted = Array.isArray(data) ? data[0] : (data?.data ? (Array.isArray(data.data) ? data.data[0] : data.data) : null);

        // attempt to hydrate product details from productService if available
        let productPayload = null;
        try {
          productPayload = await productService.getProduct(productId).catch(() => null);
        } catch (ignore) {}

        const finalPayload = productPayload ? { ...productPayload, _wishlistId: inserted?.id ?? null, _wishlistRow: inserted ?? null } : { id: productId, _wishlistId: inserted?.id ?? null, _wishlistRow: inserted ?? null };

        // replace placeholder with hydrated payload
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
        dispatch({ type: 'ADD_TO_WISHLIST', payload: finalPayload });
        try { setTimeout(() => window.dispatchEvent(new CustomEvent('necta_wishlist_updated')), 0) } catch {}
        return true;
      } catch (err) {
        // revert optimistic add
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
        const status = err?.response?.status;
        if (status === 409) {
          showToast?.('Item already in wishlist', { type: 'info' });
          // fetch the existing wishlist row and product to sync state
          try {
            const id = await resolveWishlistRowId();
            const prod = await productService.getProduct(productId).catch(() => null);
            if (id) dispatch({ type: 'ADD_TO_WISHLIST', payload: { ...(prod || { id: productId }), _wishlistId: id } });
          } catch (e) {}
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
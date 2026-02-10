import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, attachAuthToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// 1. Create Context
const WishlistContext = createContext();

// 2. Provider with ZERO external imports
export function WishlistProvider({ children }) {
  const { session } = useAuth() || {};

  // Initialize from localStorage synchronously so UI is instant
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist')) || []; }
    catch (e) { return []; }
  });

  // Persist to localStorage whenever wishlist changes
  useEffect(() => {
    try { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }
    catch (e) { /* ignore */ }
  }, [wishlist]);

  // Silent background sync: attempt to fetch server wishlist but don't override local on failure
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      try {
        const token = session?.access_token || session?.accessToken || null;
        if (token) attachAuthToken(token);
        const res = await api.get('/me/wishlist');
        const rows = res?.data?.data ?? res?.data ?? [];
        const normalized = (rows || []).map(r => {
          const product = r.product || {};
          return {
            id: product?.id ?? r.product_id,
            name: product?.name || product?.title || '',
            price: product?.price || product?.amount || 0,
            image: product?.image || product?.images?.[0] || product?.thumbnail || '',
            _wishlistId: r.id,
            __raw: r
          };
        });
        if (!mounted) return;
        // Only replace local wishlist if we received an array from the server
        if (Array.isArray(normalized) && normalized.length > 0) setWishlist(normalized);
      } catch (err) {
        // Fail silently: prefer local data and do not clear it
        console.warn('Related wishlist sync failed (ignoring):', err?.message || err);
      }
    };

    sync();
    return () => { mounted = false };
  }, [session]);

  // Optimistic add/remove with background API calls
  const addToWishlist = async (product) => {
    try {
      if (wishlist.some(item => item.id === product.id)) return;
      // Optimistic update
      setWishlist(prev => [...prev, product]);
      // Try to sync to server (best-effort)
      const token = session?.access_token || session?.accessToken || null;
      if (token) attachAuthToken(token);
      await api.post('/me/wishlist', { product_id: product.id }).catch(e => { throw e; });
    } catch (err) {
      console.warn('Failed to sync addToWishlist (ignoring):', err?.message || err);
      // don't revert optimistic update
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      // Optimistic update
      setWishlist(prev => prev.filter(item => item.id !== productId));
      // Try to sync to server (best-effort)
      const token = session?.access_token || session?.accessToken || null;
      if (token) attachAuthToken(token);
      // Try DELETE by id; if API expects body, servers should handle it — swallow failures
      await api.delete(`/me/wishlist/${productId}`).catch(async (e) => {
        // fallback: try POST to remove endpoint
        try { await api.post('/me/wishlist/remove', { product_id: productId }); } catch (e2) { throw e2; }
      });
    } catch (err) {
      console.warn('Failed to sync removeFromWishlist (ignoring):', err?.message || err);
      // don't revert optimistic removal
    }
  };

  // Toggle helper: adds if missing, removes if present
  const toggleWishlist = async (product) => {
    if (!product || !product.id) return;
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

// 3. The Hook
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    // Return a dummy object instead of crashing if context is missing
    return {
      wishlist: [],
      addToWishlist: () => console.log('Wishlist not ready'),
      removeFromWishlist: () => {},
      toggleWishlist: () => {},
      isInWishlist: () => false
    };
  }
  return context;
}

// Default export to allow default-import usage in other files
export default WishlistProvider;
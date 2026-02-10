import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create Context
const WishlistContext = createContext();

// 2. Provider with ZERO external imports
export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('necta_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('necta_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const addToWishlist = (product) => {
    if (wishlist.some(item => item.id === product.id)) return;
    setWishlist(prev => [...prev, product]);
    // Removed showToast to prevent circular crash
    console.log('Added to wishlist:', product.name); 
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
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
      isInWishlist: () => false 
    };
  }
  return context;
}

// Default export to allow default-import usage in other files
export default WishlistProvider;
import React, { createContext, useContext, useReducer } from 'react';
import { api, handleApiError } from '../src/lib/api';

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
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: []
  });

  // Add toggleWishlist function — optimistic update with backend sync
  const toggleWishlist = async (product) => {
    const isInWishlist = state.items.find(item => item.id === product.id);

    if (isInWishlist) {
      // Optimistically remove
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
      try {
        await api.delete(`/me/wishlist/${product.id}`);
      } catch (err) {
        // revert on failure
        dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
        throw handleApiError(err);
      }
    } else {
      // Optimistically add
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
      try {
        const res = await api.post('/me/wishlist', { productId: product.id });
        // Optionally replace stored item with server item if returned
        if (res?.data && res.data.product) {
          // replace the optimistic item with server-provided data
          dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
          dispatch({ type: 'ADD_TO_WISHLIST', payload: res.data.product });
        }
      } catch (err) {
        // revert on failure
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
        throw handleApiError(err);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ state, dispatch, toggleWishlist }}>
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
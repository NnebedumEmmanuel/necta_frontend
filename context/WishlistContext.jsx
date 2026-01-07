import React, { createContext, useContext, useReducer } from 'react';
import { api, handleApiError, attachAuthToken } from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';

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

  // Read auth session at top-level of the provider (valid hook usage)
  const { session } = useAuth();
  // If we have a Supabase session, attach its access token for this request.
  const token = session?.access_token || session?.provider_token || null
  if (token) attachAuthToken(token)

  // Add toggleWishlist function — optimistic update with backend sync
  // Accept productId (string). For optimistic UI we add a minimal item { id }
  const toggleWishlist = async (productId) => {
    const isInWishlist = state.items.find(item => item.id === productId);

    if (isInWishlist) {
      // Optimistically remove
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
      try {
        // If using cookies for auth, axios withCredentials=true will send them.
        await api.delete(`/me/wishlist/${productId}`);
        return true;
      } catch (err) {
        // revert on failure
        dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });
        // Network or server error: revert optimistic change and return false.
        console.error('toggleWishlist: failed to remove from wishlist', handleApiError(err));
        return false;
      }
    } else {
      // Optimistically add minimal item
      dispatch({ type: 'ADD_TO_WISHLIST', payload: { id: productId } });
      try {
        // Backend expects { product_id }
        const res = await api.post('/me/wishlist', { product_id: productId });
        // Optionally replace stored item with server item if returned
        if (res?.data && res.data.product) {
          // replace the optimistic item with server-provided data
          dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
          dispatch({ type: 'ADD_TO_WISHLIST', payload: res.data.product });
        }
        return true;
      } catch (err) {
        // revert on failure
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
        // Revert optimistic update and return false so UI can react gracefully.
        console.error('toggleWishlist: failed to add to wishlist', handleApiError(err));
        return false;
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
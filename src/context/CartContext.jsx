import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from '../../context/ToastProvider';

const CartContext = createContext(null);

// Reducer for cart state
function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD_ITEM': {
      const item = action.item;
      const existing = state.items.find(i => i.id === item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 0) + (item.quantity || 1) } : i)
        };
      }
      return { ...state, items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  // Defensive: try to get toast, fall back to console.log
  let showToast = (msg, type) => console.log('Toast fallback:', msg, type);
  try {
    const toastCtx = useToast && typeof useToast === 'function' ? useToast() : null;
    if (toastCtx && typeof toastCtx.showToast === 'function') showToast = toastCtx.showToast;
  } catch (e) {
    console.log('useToast not available in CartContext:', e?.message || e);
  }

  // Initialize from localStorage if available
  const initialItems = (() => {
    if (typeof window === 'undefined') return [];
    try {
      const a = localStorage.getItem('cartItems');
      if (a) return JSON.parse(a);
      const b = localStorage.getItem('necta_cart');
      if (b) return JSON.parse(b);
    } catch (e) {
      // ignore parse errors
    }
    return [];
  })();

  const [state, dispatch] = useReducer(cartReducer, { items: initialItems });

  // persist to localStorage whenever items change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('cartItems', JSON.stringify(state.items)); } catch (e) {}
  }, [state.items]);

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', item: { ...product, quantity } });
    showToast(`Added ${quantity} ${product.name || 'item'} to cart`, 'success');
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', id });
    showToast('Removed from cart', 'info');
  };

  const clearCart = () => dispatch({ type: 'CLEAR' });

  const value = { state, dispatch, cartItems: state.items, addToCart, removeFromCart, clearCart };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartProvider;
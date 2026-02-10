import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TAX_RATE, getShippingFee } from '@/lib/pricing';
import { useToast } from '../../context/ToastProvider';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Defensive: try to get toast, fall back to console.log
  let showToast = (msg, type) => console.log('Toast fallback:', msg, type);
  try {
    const toastCtx = useToast && typeof useToast === 'function' ? useToast() : null;
    if (toastCtx && typeof toastCtx.showToast === 'function') showToast = toastCtx.showToast;
  } catch (e) {
    // ignore
  }

  // 1) Lazy Initialization: read from localStorage immediately so it never flashes empty
  const [cartItems, setCartItems] = useState(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('necta-cart-storage');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [deliveryState, setDeliveryState] = useState('');

  // 2) Persistence Effect: save to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('necta-cart-storage', JSON.stringify(cartItems));
    } catch (e) {
      // ignore storage errors
    }
  }, [cartItems]);

  // 3) Keep existing functions: addToCart, removeFromCart, updateQuantity, clearCart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 0) + quantity } : item);
      }
      return [...prev, { ...product, quantity: quantity }];
    });
    try { showToast(`Added ${quantity} ${product.name || 'item'} to cart`, 'success'); } catch (e) {}
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    try { showToast('Removed from cart', 'info'); } catch (e) {}
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const clearCart = () => setCartItems([]);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const rawPrice = item.price;
      let price = 0;
      if (typeof rawPrice === 'number' && Number.isFinite(rawPrice)) {
        price = rawPrice;
      } else if (rawPrice != null) {
        const normalized = String(rawPrice).replace(/[^\d.-]/g, '');
        const p = parseFloat(normalized);
        price = Number.isFinite(p) ? p : 0;
      }

      const qty = Number(item.quantity ?? item.qty ?? 1) || 0;
      return total + (price * qty);
    }, 0);
  };

  const getTotalItems = () => cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

  // Derived pricing values
  const { subtotal, tax, shipping, total } = useMemo(() => {
    const subtotalVal = Number(getTotalPrice() || 0);
    const taxVal = Number(subtotalVal * Number(TAX_RATE || 0));
    const shippingVal = Number(getShippingFee(deliveryState, subtotalVal) || 0);
    const totalVal = subtotalVal + taxVal + shippingVal;
    return {
      subtotal: subtotalVal,
      tax: taxVal,
      shipping: shippingVal,
      total: totalVal,
    };
  }, [cartItems, deliveryState]);

  // Keep `state` shape for compatibility
  const state = { items: cartItems };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        // pricing
        subtotal,
        tax,
        shipping,
        total,
        deliveryState,
        setDeliveryState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartProvider;

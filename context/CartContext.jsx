import React, { useReducer, useEffect, useState, useMemo } from "react";
import { CartContext } from "./CartContextFile";
import { TAX_RATE, getShippingFee } from '@/lib/pricing';

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };
    }
    
    case "REMOVE_FROM_CART": {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    }
    
    case "UPDATE_QUANTITY": {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };
    }
    
    case "CLEAR_CART": {
      return {
        ...state,
        items: []
      };
    }
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: JSON.parse(localStorage.getItem('cart')) || []
  });

  const [deliveryState, setDeliveryState] = useState("");

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
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

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

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
  }, [state.items, deliveryState]);

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

export default CartProvider;
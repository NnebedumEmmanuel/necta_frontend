// main.jsx or App.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WishlistProvider } from '../context/WishlistContext';
import { CartProvider } from '../context/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
        <CartProvider>
    <WishlistProvider>
      <App />
    </WishlistProvider>
    </CartProvider>
  </React.StrictMode>
);
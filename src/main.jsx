import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ✅ CORRECT: Pointing to the real files with correct names
import ToastProvider from './context/ToastProvider'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import WishlistProvider from './context/WishlistContext' // Make sure this matches the file name!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
)
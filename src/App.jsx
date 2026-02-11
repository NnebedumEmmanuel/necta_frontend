import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// ✅ COMPONENTS
import Navbar from './components/Navbar'; // Using the fixed Navbar
import ProtectedRoute from './components/ProtectedRoute'; // The safe route guard

// ⚠️ Ensure Footer exists, or comment this out if you deleted layout folder
import Footer from './components/layout/Footer'; 

// ✅ PUBLIC PAGES
import HomePage from './pages/home/HomePage';
import ShopPage from './pages/shop/page';
import ProductPage from './pages/shop/products/[id]/page';
import CartPage from './pages/cart/CartPage';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import WishlistPage from './pages/wishlist/page';
import OrderDetailsPage from './pages/order/OrderDetailsPage';

// ✅ AUTH & CHECKOUT
import LoginPage from './pages/account/LoginPage';
import ResetPasswordPage from './pages/account/ResetPasswordPage';
import CheckoutPage from './pages/Checkout/Checkoutpage';
import PaymentCallback from './pages/PaymentCallback';

// ✅ ADMIN COMPONENTS
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './components/admin/AdminOverview';
import AdminProducts from './components/admin/AdminProducts';
import AdminOrders from './components/admin/AdminOrders';
import AdminUsers from './components/admin/AdminUsers';
import AdminSupport from './components/admin/AdminSupport';

// ✅ USER DASHBOARD (Check if file exists, if not, Route will error)
import UserDashboard from './pages/dashboard/UserDashboard'; 

// No DashboardRedirect: /dashboard will render UserDashboard for any logged-in user

function AppContent() {
  const location = useLocation();
  
  // Paths where Navbar/Footer should be HIDDEN
  const hideNavPaths = ['/login', '/signup', '/admin'];
  
  // Check if current path starts with any of the hidden paths
  const shouldShowNav = !hideNavPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowNav && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* --- PROTECTED USER ROUTES --- */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/callback" 
            element={
              <ProtectedRoute>
                <PaymentCallback />
              </ProtectedRoute>
            } 
          />

          {/* ✅ DASHBOARD ROUTE (now shows user dashboard for any logged-in user) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          {/* Order details (individual order view) */}
          <Route path="/order/:id" element={<OrderDetailsPage />} />
          
          {/* /account redirects to /dashboard */}
          <Route path="/account" element={<Navigate to="/dashboard" replace />} />


          {/* --- ADMIN ROUTES --- */}
          {/* We use 'ProtectedRoute' with adminOnly={true} instead of the old AdminProtectedRoute */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
             {/* Nested Admin Pages */}
             <Route index element={<AdminOverview />} />
             <Route path="dashboard" element={<AdminOverview />} />
             <Route path="products" element={<AdminProducts />} />
             <Route path="orders" element={<AdminOrders />} />
             <Route path="users" element={<AdminUsers />} />
             <Route path="support" element={<AdminSupport />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {shouldShowNav && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* NOTE: Providers (AuthProvider, CartProvider, etc.) are now in main.jsx 
         Do NOT add them here again, or the app will break!
      */}
      <AppContent />
    </BrowserRouter>
  );
}
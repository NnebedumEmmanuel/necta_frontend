// App.jsx - Updated with proper routing
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/shared/ScrollToTop';
import HomePage from './pages/home/HomePage';
import ShopPage from './pages/shop/page';
import ProductPage from './pages/shop/products/[id]/page';
import WishlistPage from './pages/wishlist/page';
import CartPage from './pages/cart/CartPage';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import LoginPage from './pages/account/LoginPage';
import SignUp from './components/auth/signup/Signup';
import { WishlistProvider } from '../context/WishlistContext';
import { CartProvider } from '../context/CartContext';
import ToastProvider from './context/ToastProvider';
import { AuthProvider } from '@/context/AuthContext';
import CheckoutPage from './pages/Checkout/Checkoutpage';
import PaymentCallback from './pages/PaymentCallback';
import UserDashboard from './pages/dashboard/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './components/admin/AdminPanel';
import AdminProtectedRoute from './components/auth/admin/AdminProtectedRoute';

function AppWrapper() {
  const location = useLocation();
  const hideHeaderFooterPaths = [
    '/login',
    '/signup', 
    '/admin', 
    '/admin/*',
    '/dashboard'
  ];
  
  const isAuthPage = hideHeaderFooterPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path.replace('/*', ''))
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-grow">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/products/:id" element={<ProductPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          {/* payment callback and confirmation routes removed during revert */}
          
          {/* Auth pages (public) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected User Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Account page */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Admin Panel */}
          <Route 
            path="/admin/*" 
            element={
              <AdminProtectedRoute>
                <AdminPanel />
              </AdminProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <AuthProvider>
              <AppWrapper />
              <ScrollToTopButton />
            </AuthProvider>
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import CheckoutPage from './pages/Checkout/Checkoutpage';

function AppWrapper() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/account' || location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}  {/* Only show header if not login/signup */}
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
          <Route path="/checkout" element={<CheckoutPage/>}/>
          

          {/* Auth pages without header/footer */}
          <Route path="/account" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}  {/* Only show footer if not login/signup */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <AppWrapper />
            <ScrollToTopButton />
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/layout/Header';
import HomePage from './pages/home/HomePage';
import ShopPage from './pages/shop/page';
import ProductPage from './pages/shop/products/[id]/page';
import WishlistPage from './pages/wishlist/page';
import CartPage from './pages/cart/CartPage';
import Footer from './components/layout/Footer';
import { WishlistProvider } from '../context/WishlistContext';
import { CartProvider } from '../context/CartContext';
import ScrollToTopButton from './components/shared/ScrollToTop';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/Contact/ContactPage';


function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/products/:id" element={<ProductPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<AboutPage/>} />
                <Route path="/contact" element={<ContactPage/>} />

                {/* Add more routes as needed */}
              </Routes>
            </main>
            <Footer />
          </div>
      <ScrollToTopButton />
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
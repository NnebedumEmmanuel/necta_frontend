import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/layout/Header';
import HomePage from './pages/home/HomePage';
import ShopPage from './pages/shop/page';
import ProductPage from './pages/shop/products/[id]/page';
import WishlistPage from './pages/wishlist/page';
import Footer from './components/layout/Footer';
import { WishlistProvider } from '../context/WishlistContext';


function App() {
  return (
    <Router>
      <WishlistProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/products/:id" element={<ProductPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </main>
          <Footer />
        </div>
      </WishlistProvider>
    </Router>
  );
}

export default App;
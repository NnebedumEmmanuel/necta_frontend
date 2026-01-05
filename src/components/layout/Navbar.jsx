// Header.jsx
import React, { useState } from "react";
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Menu,
  Smartphone,
  Speaker,
  Sun,
  Zap,
  Tv,
  Headphones
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/useCartHook";

const Logo = "/logo.png";

// Category configuration with Lucide icons
const categories = [
  { 
    label: "phones", 
    display: "Phones", 
    icon: <Smartphone size={18} />,
    available: false
  },
  { 
    label: "speakers", 
    display: "Speakers", 
    icon: <Speaker size={18} />,
    available: true
  },
  { 
    label: "solar", 
    display: "Solar", 
    icon: <Sun size={18} />,
    available: false
  },
  { 
    label: "inverter", 
    display: "Inverter", 
    icon: <Zap size={18} />,
    available: false
  },
  { 
    label: "tv", 
    display: "TV", 
    icon: <Tv size={18} />,
    available: false
  },
  { 
    label: "headphones", 
    display: "Headphones", 
    icon: <Headphones size={18} />,
    available: false
  },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state: wishlistState } = useWishlist();
  const { getTotalItems } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Function to check if a nav link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-full">
      {/* ===== Top Navbar ===== */}
      <div className="flex flex-col items-center justify-center py-5 bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-12 w-full max-w-6xl px-4 text-center relative">
          <div className="absolute top-1/2 left-4 -translate-y-1/2 md:hidden">
            <Link to="/">
              <img src={Logo} alt="Cyber Logo" width={85} height={85} />
            </Link>
          </div>

          <div className="absolute top-1/2 right-4 -translate-y-1/2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open menu"
              title="Open menu"
              className="text-gray-800 hover:text-black"
            >
              <Menu size={26} />
            </button>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <Link to="/">
              <img src={Logo} alt="Cyber Logo" width={85} height={85} />
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center w-72 bg-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <Search className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent outline-none text-sm text-gray-700"
            />
          </form>

          <nav className="hidden lg:flex items-center gap-8 text-sm">
            <Link 
              to="/" 
              className={`font-medium hover:text-gray-700 transition-colors ${
                isActive('/') ? 'text-black' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className={`font-medium hover:text-black transition-colors ${
                isActive('/shop') ? 'text-black' : 'text-gray-600'
              }`}
            >
              Shop
            </Link>
            <Link 
              to="/about" 
              className={`font-medium hover:text-black transition-colors ${
                isActive('/about') ? 'text-black' : 'text-gray-600'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium hover:text-black transition-colors ${
                isActive('/contact') ? 'text-black' : 'text-gray-600'
              }`}
            >
              Contact Us
            </Link>
            <Link 
              to="/blog" 
              className={`font-medium hover:text-black transition-colors ${
                isActive('/blog') ? 'text-black' : 'text-gray-600'
              }`}
            >
              Blog
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/wishlist" className="relative">
              <Heart size={22} className={`cursor-pointer hover:text-black transition ${
                isActive('/wishlist') ? 'text-black' : 'text-gray-800'
              }`} />
              {wishlistState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistState.items.length}
                </span>
              )}
            </Link>
            
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className={`cursor-pointer hover:text-black transition ${
                isActive('/cart') ? 'text-black' : 'text-gray-800'
              }`} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            <Link to="/account">
              <User size={22} className={`cursor-pointer hover:text-black transition ${
                isActive('/account') ? 'text-black' : 'text-gray-800'
              }`} />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Bottom Categories ===== */}
      <div className="hidden lg:flex items-center justify-center gap-8 bg-[#2E2E2E] text-white py-3 text-sm">
        {categories.map((category, index) => (
          <React.Fragment key={category.label}>
            <CategoryItem 
              icon={category.icon}
              label={category.label}
              display={category.display}
              available={category.available}
              isActive={location.pathname === '/shop' && 
                new URLSearchParams(location.search).get('category') === category.label}
            />
            {index < categories.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="flex flex-col p-4 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent outline-none text-sm text-gray-700"
              />
            </form>
            
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`py-2 transition-colors ${
                  isActive('/') 
                    ? 'font-medium text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className={`py-2 transition-colors ${
                  isActive('/shop') 
                    ? 'font-medium text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                className={`py-2 transition-colors ${
                  isActive('/about') 
                    ? 'font-medium text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`py-2 transition-colors ${
                  isActive('/contact') 
                    ? 'font-medium text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <Link 
                to="/blog" 
                className={`py-2 transition-colors ${
                  isActive('/blog') 
                    ? 'font-medium text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </nav>
            
            {/* Mobile Categories */}
            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const isCategoryActive = location.pathname === '/shop' && 
                    new URLSearchParams(location.search).get('category') === category.label;
                  
                  return (
                    <Link
                      key={category.label}
                      to={`/shop?category=${encodeURIComponent(category.label)}`}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        category.available 
                          ? isCategoryActive
                            ? 'bg-gray-200'
                            : 'hover:bg-gray-100'
                          : 'opacity-60'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="text-gray-600">
                        {category.icon}
                      </div>
                      <span className={`text-sm ${
                        isCategoryActive ? 'text-black font-medium' : 'text-gray-700'
                      }`}>
                        {category.display}
                      </span>
                      {!category.available && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-auto">
                          Soon
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-around pt-4 border-t">
              <Link 
                to="/wishlist" 
                className="flex flex-col items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart size={22} className={isActive('/wishlist') ? 'text-black' : 'text-gray-800'} />
                <span className={`text-xs mt-1 ${isActive('/wishlist') ? 'text-black font-medium' : 'text-gray-600'}`}>
                  Wishlist
                </span>
              </Link>
              <Link 
                to="/cart" 
                className="flex flex-col items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart size={22} className={isActive('/cart') ? 'text-black' : 'text-gray-800'} />
                <span className={`text-xs mt-1 ${isActive('/cart') ? 'text-black font-medium' : 'text-gray-600'}`}>
                  Cart
                </span>
              </Link>
              <Link 
                to="/account" 
                className="flex flex-col items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={22} className={isActive('/account') ? 'text-black' : 'text-gray-800'} />
                <span className={`text-xs mt-1 ${isActive('/account') ? 'text-black font-medium' : 'text-gray-600'}`}>
                  Account
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryItem({ icon, label, display, available, isActive }) {
  return (
    <Link 
      to={`/shop?category=${encodeURIComponent(label)}`}
      className={`flex items-center gap-2 cursor-pointer transition group ${
        available 
          ? isActive
            ? "text-white font-medium"
            : "hover:text-gray-300 text-white"
          : "text-gray-500 opacity-70 cursor-not-allowed"
      }`}
      aria-label={`Browse ${display}`}
    >
      <div className={`transition-transform group-hover:scale-110 ${
        isActive ? 'scale-110' : ''
      }`}>
        {icon}
      </div>
      <span>{display}</span>
    </Link>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-gray-500" />;
}
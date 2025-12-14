// Sidebar.jsx
import React from "react";
import { 
  X, 
  Home, 
  Info, 
  Phone, 
  Newspaper, 
  Layers, 
  Heart, 
  ShoppingCart, 
  User,
  Smartphone,
  Speaker,
  Sun,
  Zap,
  Tv,
  Headphones
} from "lucide-react";
import { useLocation } from "react-router-dom";

const Logo = "/icons/Logo.png";

// Category icons configuration
const categories = [
  { 
    name: "Phones", 
    label: "phones",
    icon: <Smartphone size={16} className="text-gray-600" />, 
    available: false 
  },
  { 
    name: "Speakers", 
    label: "speakers",
    icon: <Speaker size={16} className="text-gray-600" />, 
    available: true 
  },
  { 
    name: "Solar", 
    label: "solar",
    icon: <Sun size={16} className="text-gray-600" />, 
    available: false 
  },
  { 
    name: "Inverter", 
    label: "inverter",
    icon: <Zap size={16} className="text-gray-600" />, 
    available: false 
  },
  { 
    name: "TV", 
    label: "tv",
    icon: <Tv size={16} className="text-gray-600" />, 
    available: false 
  },
  { 
    name: "Headphones", 
    label: "headphones",
    icon: <Headphones size={16} className="text-gray-600" />, 
    available: false 
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const cartState = { itemCount: 0 };
  const wishlistState = { items: [] };

  // Function to check if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Function to check if a category is active
  const isCategoryActive = (categoryLabel) => {
    const searchParams = new URLSearchParams(location.search);
    const currentCategory = searchParams.get('category');
    return location.pathname === '/shop' && currentCategory === categoryLabel;
  };

  return (
    <>
      {/* ===== Full width overlay ===== */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 w-full"
          onClick={onClose}
        />
      )}

      {/* ===== Sidebar Drawer ===== */}
      <div
        className="fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-xl shadow-2xl z-50 border-r border-gray-200"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <a href="/" onClick={onClose}>
              <img src={Logo} alt="Cyber Logo" width={90} height={90} />
            </a>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            title="Close menu"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={22} className="text-gray-700" />
          </button>
        </div>

        {/* ===== Quick Actions ===== */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="space-y-2">
            <a 
              href="/wishlist" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200 relative ${
                isActive('/wishlist') ? 'bg-gray-100 text-black font-medium' : ''
              }`}
              onClick={onClose}
            >
              <Heart size={18} className={isActive('/wishlist') ? 'text-black' : 'text-gray-600'} />
              <span className="text-sm">Wishlist</span>
              {wishlistState.items.length > 0 && (
                <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistState.items.length}
                </span>
              )}
            </a>
            
            <a 
              href="/cart" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200 relative ${
                isActive('/cart') ? 'bg-gray-100 text-black font-medium' : ''
              }`}
              onClick={onClose}
            >
              <ShoppingCart size={18} className={isActive('/cart') ? 'text-black' : 'text-gray-600'} />
              <span className="text-sm">Cart</span>
              {cartState.itemCount > 0 && (
                <span className="absolute right-3 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </a>
            
            <a 
              href="/account" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200 ${
                isActive('/account') ? 'bg-gray-100 text-black font-medium' : ''
              }`}
              onClick={onClose}
            >
              <User size={18} className={isActive('/account') ? 'text-black' : 'text-gray-600'} />
              <span className="text-sm">Account</span>
            </a>
          </div>
        </div>

        {/* ===== Nav Links ===== */}
        <nav className="flex flex-col gap-3 mt-6 px-6 text-gray-800">
          <a
            href="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/') 
                ? 'bg-gray-100 text-black font-medium' 
                : 'hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Home size={18} className={isActive('/') ? 'text-black' : 'text-gray-600'} />
            <span className="text-sm">Home</span>
          </a>
          
          <a
            href="/shop"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/shop') 
                ? 'bg-gray-100 text-black font-medium' 
                : 'hover:bg-gray-100 hover:text-black'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={isActive('/shop') ? 'text-black' : 'text-gray-600'}
            >
              <path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <span className="text-sm">Shop</span>
          </a>
          
          <a
            href="/about"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/about') 
                ? 'bg-gray-100 text-black font-medium' 
                : 'hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Info size={18} className={isActive('/about') ? 'text-black' : 'text-gray-600'} />
            <span className="text-sm">About</span>
          </a>
          
          <a
            href="/contact"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/contact') 
                ? 'bg-gray-100 text-black font-medium' 
                : 'hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Phone size={18} className={isActive('/contact') ? 'text-black' : 'text-gray-600'} />
            <span className="text-sm">Contact Us</span>
          </a>
          
          <a
            href="/blog"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/blog') 
                ? 'bg-gray-100 text-black font-medium' 
                : 'hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Newspaper size={18} className={isActive('/blog') ? 'text-black' : 'text-gray-600'} />
            <span className="text-sm">Blog</span>
          </a>
        </nav>

        {/* ===== Categories ===== */}
        <div className="mt-10 border-t border-gray-200 pt-5 px-6 text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium">
            <Layers size={16} />
            <p>Browse Categories</p>
          </div>

          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.name}>
                <a
                  href={`/shop?category=${encodeURIComponent(category.label)}`}
                  onClick={onClose}
                  className={`flex items-center justify-between py-2 cursor-pointer transition-colors duration-200 ${
                    isCategoryActive(category.label)
                      ? 'text-black font-medium'
                      : 'hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isCategoryActive(category.label) ? 'text-black' : ''}>
                      {category.icon}
                    </span>
                    <span>{category.name}</span>
                  </div>
                  {!category.available && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Footer ===== */}
        <div className="absolute bottom-4 left-0 w-full px-6 text-xs text-gray-500">
          <p>© 2025 CyberStore. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
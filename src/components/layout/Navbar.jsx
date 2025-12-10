import React, { useState } from "react";
import { Search, Heart, ShoppingCart, User, Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/useCartHook";

const Logo = "/logo.png"; // Adjust this path
const categoryIcons = {
  phones: "/icons/Phones.png",
  computers: "/icons/Computers.png",
  smartWatches: "/icons/Gaming.png",
  cameras: "/icons/Cameras.png",
  headphones: "/icons/Headphones.png",
  gaming: "/icons/Gaming.png",
};

export default function Header() {
  const navigate = useNavigate();
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
            <Link to="/" className="font-medium text-black hover:text-gray-700">
              Home
            </Link>
            <Link to="/shop" className="text-gray-600 hover:text-black">
              Shop
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-black">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-black">
              Contact Us
            </Link>
            <Link to="/blog" className="text-gray-600 hover:text-black">
              Blog
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/wishlist" className="relative">
              <Heart size={22} className="cursor-pointer text-gray-800 hover:text-black transition" />
              {wishlistState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistState.items.length}
                </span>
              )}
            </Link>
            
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className="cursor-pointer text-gray-800 hover:text-black transition" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            <Link to="/account">
              <User size={22} className="cursor-pointer text-gray-800 hover:text-black transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Bottom Categories ===== */}
      <div className="hidden lg:flex items-center justify-center gap-8 bg-[#2E2E2E] text-white py-2 text-sm">
        <CategoryItem icon={categoryIcons.phones} label="phones" />
        <Divider />
        <CategoryItem icon={categoryIcons.computers} label="computers" />
        <Divider />
        <CategoryItem icon={categoryIcons.smartWatches} label="smartWatches" />
        <Divider />
        <CategoryItem icon={categoryIcons.cameras} label="cameras" />
        <Divider />
        <CategoryItem icon={categoryIcons.headphones} label="headphones" />
        <Divider />
        <CategoryItem icon={categoryIcons.gaming} label="gaming" />
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
              <Link to="/" className="font-medium text-black hover:text-gray-700 py-2">
                Home
              </Link>
              <Link to="/shop" className="text-gray-600 hover:text-black py-2">
                Shop
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-black py-2">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-black py-2">
                Contact Us
              </Link>
              <Link to="/blog" className="text-gray-600 hover:text-black py-2">
                Blog
              </Link>
            </nav>
            
            <div className="flex items-center justify-around pt-4 border-t">
              <Link to="/wishlist" className="flex flex-col items-center">
                <Heart size={22} className="text-gray-800" />
                <span className="text-xs mt-1">Wishlist</span>
              </Link>
              <Link to="/cart" className="flex flex-col items-center">
                <ShoppingCart size={22} className="text-gray-800" />
                <span className="text-xs mt-1">Cart</span>
              </Link>
              <Link to="/account" className="flex flex-col items-center">
                <User size={22} className="text-gray-800" />
                <span className="text-xs mt-1">Account</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Update CategoryItem to use Link for proper navigation
function CategoryItem({ icon, label }) {
  const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
  
  return (
    <Link 
      to={`/shop?category=${encodeURIComponent(label)}`}
      className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition"
      aria-label={`Browse ${formattedLabel}`}
    >
      <img src={icon} alt={formattedLabel} width={18} height={18} />
      <span>{formattedLabel}</span>
    </Link>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-gray-500" />;
}
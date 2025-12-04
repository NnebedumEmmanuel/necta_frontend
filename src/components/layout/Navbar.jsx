import React, { useState } from "react";
import { Search, Heart, ShoppingCart, User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";


const Logo = "../../../public/img6.png"; // Adjust this path
const categoryIcons = {
  phones: "/icons/Phones.png",
  computers: "/icons/Computers.png",
  smartWatches: "/icons/Gaming.png", // Note: Using Gaming icon for smartWatches
  cameras: "/icons/Cameras.png",
  headphones: "/icons/Headphones.png",
  gaming: "/icons/Gaming.png",
};

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock context data - replace with your actual React context
  const cartState = { itemCount: 0 }; // Replace with useCart() hook
  const wishlistState = { items: [] }; // Replace with useWishlist() hook

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In React Router, we use navigate with search params
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
            <a href="/">
              <img src={Logo} alt="Cyber Logo" width={85} height={85} />
            </a>
          </div>

          <div className="absolute top-1/2 right-4 -translate-y-1/2 md:hidden">
            <button
              onClick={onMenuClick}
              aria-label="Open menu"
              title="Open menu"
              className="text-gray-800 hover:text-black"
            >
              <Menu size={26} />
            </button>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <a href="/">
              <img src={Logo} alt="Cyber Logo" width={85} height={85} />
            </a>
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
            <a href="/" className="font-medium text-black hover:text-gray-700">
              Home
            </a>
            <a href="/about" className="text-gray-600 hover:text-black">
              About
            </a>
            <a href="/contact" className="text-gray-600 hover:text-black">
              Contact Us
            </a>
            <a href="/blog" className="text-gray-600 hover:text-black">
              Blog
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <a href="/wishlist" className="relative">
              <Heart size={22} className="cursor-pointer text-gray-800 hover:text-black transition" />
              {wishlistState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistState.items.length}
                </span>
              )}
            </a>
            
            <a href="/cart" className="relative">
              <ShoppingCart size={22} className="cursor-pointer text-gray-800 hover:text-black transition" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </a>
            
            <User size={22} className="cursor-pointer text-gray-800 hover:text-black transition" />
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
    </div>
  );
}

function CategoryItem({ icon, label }) {
  return (
    <a
      href={`/shop?category=${encodeURIComponent(label)}`}
      className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition"
      aria-label={`Browse ${label}`}
    >
      <img src={icon} alt={label} width={18} height={18} />
      <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
    </a>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-gray-500" />;
}
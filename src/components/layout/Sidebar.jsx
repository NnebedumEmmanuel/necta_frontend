import React from "react";
import { X, Home, Info, Phone, Newspaper, Layers, Heart, ShoppingCart, User } from "lucide-react";

const Logo = "/icons/Logo.png";

export default function Sidebar({ isOpen, onClose }) {
  const cartState = { itemCount: 0 };
  const wishlistState = { items: [] };

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200 relative"
              onClick={onClose}
            >
              <Heart size={18} />
              <span className="text-sm font-medium">Wishlist</span>
              {wishlistState.items.length > 0 && (
                <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistState.items.length}
                </span>
              )}
            </a>
            
            <a 
              href="/cart" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200 relative"
              onClick={onClose}
            >
              <ShoppingCart size={18} />
              <span className="text-sm font-medium">Cart</span>
              {cartState.itemCount > 0 && (
                <span className="absolute right-3 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </a>
            
            <a 
              href="/account" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200"
              onClick={onClose}
            >
              <User size={18} />
              <span className="text-sm font-medium">Account</span>
            </a>
          </div>
        </div>

        {/* ===== Nav Links ===== */}
        <nav className="flex flex-col gap-3 mt-6 px-6 text-gray-800">
          <SidebarLink href="/" icon={<Home size={18} />} label="Home" onClick={onClose} />
          <SidebarLink href="/about" icon={<Info size={18} />} label="About" onClick={onClose} />
          <SidebarLink href="/contact" icon={<Phone size={18} />} label="Contact Us" onClick={onClose} />
          <SidebarLink href="/blog" icon={<Newspaper size={18} />} label="Blog" onClick={onClose} />
        </nav>

        {/* ===== Categories ===== */}
        <div className="mt-10 border-t border-gray-200 pt-5 px-6 text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium">
            <Layers size={16} />
            <p>Browse Categories</p>
          </div>

          <ul className="space-y-2">
            {["Phones", "Computers", "Smart Watches", "Cameras", "Headphones", "Gaming"].map((cat) => (
              <li key={cat}>
                <a
                  href={`/shop?category=${encodeURIComponent(cat.toLowerCase())}`}
                  onClick={onClose}
                  className="block cursor-pointer hover:text-black transition-colors duration-200"
                >
                  {cat}
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

function SidebarLink({ href, label, icon, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}
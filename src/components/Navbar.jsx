import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Menu, X, Heart, ShoppingCart, Search, Activity, User } from 'lucide-react';

export default function Navbar() {
  const { user, session } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const accountPath = user?.role === 'admin' ? '/admin' : '/dashboard';
  const displayName = String(user?.name || user?.firstName || user?.email || '').trim();
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  const [searchQuery, setSearchQuery] = useState('');

  // Cart may expose different shapes; prefer cartItems but fall back to state.items
  const { cartItems, state } = useCart() || {};
  const realItems = Array.isArray(cartItems) && cartItems.length > 0 ? cartItems : (Array.isArray(state?.items) ? state.items : []);
  const cartCount = Array.isArray(realItems) ? realItems.reduce((acc, item) => acc + (Number(item?.quantity || item?.qty) || 0), 0) : 0;

  const { wishlist } = useWishlist() || { wishlist: [] };
  const wishlistCount = (wishlist && Array.isArray(wishlist)) ? wishlist.length : 0;

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('search')) {
      setSearchQuery(params.get('search') || '');
    } else if (location.pathname === '/shop') {
      setSearchQuery('');
    }
  }, [location.pathname, location.search]);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    const query = String(searchQuery || '').trim();
    setMobileOpen(false);

    if (!query) {
      navigate('/shop');
      return;
    }

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LEFT: Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Activity size={28} className="text-orange-500" />
              <span className="text-orange-500 text-3xl font-extrabold tracking-tighter">necta</span>
            </Link>
          </div>

          {/* CENTER: Search (hidden on small screens) */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <form onSubmit={handleGlobalSearch} className="w-full max-w-md relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
              >
                Search
              </button>
            </form>
          </div>

          {/* RIGHT: Links and icons */}
          <div className="flex items-center gap-6">
            {/* Navigation links (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-black">Home</Link>
              <Link to="/shop" className="text-gray-600 hover:text-black">Shop</Link>
              <Link to="/about" className="text-gray-600 hover:text-black">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-black">Contact Us</Link>
              <Link to="/blog" className="text-gray-600 hover:text-black">Blog</Link>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <Link to="/wishlist" className="relative text-gray-700 hover:text-black">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{wishlistCount}</span>
                )}
              </Link>

              <Link to="/cart" className="relative text-gray-700 hover:text-black">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>
                )}
              </Link>

              {/* User avatar/icon only (no email). Clicking goes to the account area when logged in, otherwise to /login */}
              {session ? (
                <Link to={accountPath} className="ml-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 to-orange-500 text-white ring-2 ring-white shadow-sm">
                    {(user?.avatar_url || user?.avatar || user?.user_metadata?.avatar_url) ? (
                      <img
                        src={user.avatar_url || user.avatar || user.user_metadata?.avatar_url}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">{displayInitial}</span>
                    )}
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="ml-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={18} className="text-gray-700" />
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={handleGlobalSearch} className="w-full flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 border border-transparent"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Search
              </button>
            </form>
            <Link to="/" className="block text-gray-700">Home</Link>
            <Link to="/shop" className="block text-gray-700">Shop</Link>
            <Link to="/about" className="block text-gray-700">About</Link>
            <Link to="/contact" className="block text-gray-700">Contact Us</Link>
            <Link to="/blog" className="block text-gray-700">Blog</Link>

            <div className="flex items-center justify-between">
              <Link to="/wishlist" className="flex items-center gap-2 text-gray-700">
                <Heart size={16} /> Wishlist ({wishlistCount})
              </Link>
              <Link to="/cart" className="flex items-center gap-2 text-gray-700">
                <ShoppingCart size={16} /> Cart ({cartCount})
              </Link>
            </div>

            {session ? (
              <Link to={accountPath} className="block px-3 py-2 bg-gray-100 rounded text-center">Account</Link>
            ) : (
              <Link to="/login" className="block px-3 py-2 bg-black text-white rounded text-center">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

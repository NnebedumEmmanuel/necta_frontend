import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Package, 
  Heart, 
  ShoppingCart, 
  Settings, 
  User, 
  MapPin, 
  Calendar, 
  LogOut,
  ShoppingBag,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
  Star,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
// orderService not used here; use api directly for per-tab requests
import { useWishlist } from '../../../context/WishlistContext';
import { api, attachAuthToken, handleApiError } from '../../../src/lib/api';
import { useToast } from "../../context/useToastHook";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const { showToast } = useToast();
  const { user: authUser, session, loading: authLoading, signOut } = useAuth();
  const { state: wishlistState } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const paystatus = params.get('paystatus');

    const validTabs = ['overview', 'orders', 'wishlist', 'profile', 'security'];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }

    if (paystatus === 'success') {
      showToast?.('Payment successful. Thank you!', 'success');
    }
  }, [location.search, showToast]);

  // Fetch per-tab: each tab independently requests the server for its data.
  useEffect(() => {
    let mounted = true;

    async function fetchOrdersForTab(page = 1, limit = 100) {
      setLoading(true);
      try {
        const token = session?.access_token || session?.accessToken || null;
        attachAuthToken(token);
        const url = `/me/orders?page=${page}&limit=${limit}`;
        const res = await api.get(url);
        const list = res?.data?.data ?? res?.data ?? [];
        const normalized = (Array.isArray(list) ? list : []).map((order) => ({
          id: order.id || order.order_number || order.orderNumber || null,
          orderNumber: order.order_number || order.orderNumber || order.id || null,
          createdAt: order.created_at || order.createdAt || null,
          status: order.payment_status || order.status || 'pending',
          items: order.items || [],
          total: order.total || order.subtotal || 0,
          shippingAddress: order.shipping_address || order.shippingAddress || '',
          __raw: order,
        }));
        const sorted = normalized.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        if (!mounted) return;
        setOrders(sorted);
      } catch (err) {
        console.error('Failed to fetch orders for tab:', err);
        showToast?.('Failed to load orders', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function fetchWishlistForTab() {
      setLoading(true);
      try {
        const token = session?.access_token || session?.accessToken || null;
        attachAuthToken(token);
        const res = await api.get('/me/wishlist');
        const rows = res?.data?.data ?? res?.data ?? [];
        const normalized = (rows || []).map((r) => {
          const product = r.product || null;
          return {
            id: product?.id ?? r.product_id,
            name: product?.name || product?.title || product?.product_name || '',
            price: product?.price || product?.variants?.[0]?.price || product?.amount || 0,
            image: product?.image || product?.images?.[0] || product?.thumbnail || '',
            _wishlistId: r.id,
            __raw: r,
          };
        });
        if (!mounted) return;
        setWishlist(normalized);
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
        showToast?.('Failed to load wishlist', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function fetchProfileForTab() {
      setLoading(true);
      try {
        const token = session?.access_token || session?.accessToken || null;
        attachAuthToken(token);
        const res = await api.get('/me');
        const payload = res?.data?.data ?? res?.data ?? {};
        if (!mounted) return;
        setUser(payload.user || authUser || null);
        // profile may be null if profile row missing
        const prof = payload.profile || null;
        setProfile(prof);
        setProfileForm({
          first_name: prof?.first_name ?? prof?.firstName ?? payload.user?.user_metadata?.first_name ?? payload.user?.firstName ?? '',
          last_name: prof?.last_name ?? prof?.lastName ?? payload.user?.user_metadata?.last_name ?? payload.user?.lastName ?? '',
          email: payload.user?.email ?? prof?.email ?? '',
          phone: prof?.phone ?? prof?.phone_number ?? payload.user?.phone ?? ''
        });
      } catch (err) {
        console.error('Failed to fetch profile:', handleApiError(err));
        showToast?.('Failed to load profile', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function fetchSecurityForTab() {
      setLoading(true);
      try {
        const token = session?.access_token || session?.accessToken || null;
        attachAuthToken(token);
        const res = await api.get('/me');
        const payload = res?.data?.data ?? res?.data ?? {};
        if (!mounted) return;
        setUser(payload.user || authUser || null);
      } catch (err) {
        console.error('Failed to fetch security info:', err);
        showToast?.('Failed to load security info', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!authLoading && !authUser) {
      setUser(null);
      setOrders([]);
      setWishlist([]);
      setLoading(false);
      return () => { mounted = false };
    }

    // Decide which tab to fetch
    if (!authLoading && authUser) {
      setUser(authUser);
      if (activeTab === 'orders') fetchOrdersForTab(1, 100);
      else if (activeTab === 'wishlist') fetchWishlistForTab();
      else if (activeTab === 'profile') fetchProfileForTab();
      else if (activeTab === 'security') fetchSecurityForTab();
      else if (activeTab === 'overview') {
        // load a small recent orders set for overview
        fetchOrdersForTab(1, 5);
        // wishlist count: prefer wishlist context if available
        if (wishlistState?.items && wishlistState.items.length > 0) setWishlist(wishlistState.items);
      }
    }

    return () => { mounted = false };
  }, [activeTab, authLoading, authUser, session, showToast, wishlistState]);

  async function saveProfile() {
    setLoading(true);
    try {
      const token = session?.access_token || session?.accessToken || null;
      attachAuthToken(token);
      const payload = { ...profileForm };
      const res = await api.patch('/me', payload);
      const data = res?.data?.data ?? res?.data ?? res;
      setProfile(data?.[0] || data || profile);
      showToast?.('Profile updated', 'success');
    } catch (err) {
      console.error('Failed to save profile:', handleApiError(err));
      showToast?.('Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome back, {user?.firstName || user?.username}!
                </h1>
                <p className="text-indigo-200 mt-1">
                  Member since {new Date().getFullYear()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition backdrop-blur-sm flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition backdrop-blur-sm flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 mb-8 shadow-sm">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "orders", label: "Orders", icon: Package },
            { id: "wishlist", label: "Wishlist", icon: Heart },
            { id: "profile", label: "Profile", icon: User },
            { id: "security", label: "Security", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {}
        <div className="space-y-8">
          {activeTab === "overview" && (
            <>
              {}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Wishlist Items</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{wishlist.length}</p>
                    </div>
                    <div className="p-3 bg-pink-100 rounded-xl">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        ₦{orders.reduce((total, order) => total + (order.total || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Member Since</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {new Date().getFullYear()}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    to="/shop"
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">Continue Shopping</span>
                    </div>
                  </Link>

                  <Link
                    to="/wishlist"
                    className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl hover:shadow-md transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <span className="font-medium text-gray-800">View Wishlist</span>
                    </div>
                  </Link>

                  <Link
                    to="/cart"
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-800">View Cart</span>
                    </div>
                  </Link>

                  {( (authUser?.role === 'admin') || (authUser?.user_metadata?.role === 'admin') || (localStorage.getItem('is_admin') === 'true') ) && (
                    <Link
                      to="/admin"
                      className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:shadow-md transition group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-800">Admin Panel</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                </div>
                {orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-700">No orders yet</p>
                    <p className="text-sm text-gray-500 mt-2">Start shopping to see your orders here</p>
                    <Link
                      to="/shop"
                      className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                              <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-3">
                              <p className="text-sm text-gray-700">
                                Items: {order.items?.length || 0} • Total: ₦{(order.total || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Link
                              to={`/order-details/${order.orderNumber}`}
                              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length > 5 && (
                      <div className="p-4 text-center">
                        <Link
                          to="/dashboard?tab=orders"
                          className="text-orange-600 hover:text-orange-800 font-medium"
                          onClick={() => setActiveTab("orders")}
                        >
                          View All Orders ({orders.length})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Order History</h2>
                  <div className="text-sm text-gray-600">
                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                  </div>
                </div>
              </div>
              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-700">No orders yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start shopping to see your orders here</p>
                  <Link
                    to="/shop"
                    className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900 text-lg">Order #{order.orderNumber}</p>
                            <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              <span>{order.items?.length || 0} items</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{order.shippingAddress?.substring(0, 30)}...</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {order.items?.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                                  <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                                  <span className="text-sm">{item.name} × {item.quantity}</span>
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">₦{(order.total || 0).toLocaleString()}</p>
                          <Link
                            to={`/order-details/${order.orderNumber}`}
                            className="inline-block mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">My Wishlist</h2>
                  <div className="text-sm text-gray-600">
                    {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
                  </div>
                </div>
              </div>
              {wishlist.length === 0 ? (
                <div className="p-12 text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-700">Your wishlist is empty</p>
                  <p className="text-sm text-gray-500 mt-2">Add items you like to your wishlist</p>
                  <Link
                    to="/shop"
                    className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {wishlist.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-contain rounded-lg bg-gray-50"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.brand || "Brand"}</p>
                            <p className="font-bold text-gray-900 mt-2">{item.price}</p>
                            <div className="flex gap-2 mt-3">
                              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                Add to Cart
                              </button>
                              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileForm.first_name ?? ''}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.last_name ?? ''}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email ?? ''}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone ?? ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <button onClick={saveProfile} disabled={loading} className="px-6 py-3 bg-orange-600 disabled:opacity-50 text-white rounded-lg hover:bg-orange-700 font-semibold">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Authentication Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium mt-1">{user?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="font-medium mt-1">{user?.created_at ? new Date(user.created_at).toLocaleString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Sign In</p>
                      <p className="font-medium mt-1">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="font-mono text-sm mt-1 text-gray-800">{user?.id || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Need help?</p>
                <p className="text-sm text-gray-600">Contact our customer support</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Package, 
  Heart, 
  ShoppingCart, 
  Settings, 
  User, 
  Truck,
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
import { useAuth } from '../../../context/AuthContext';
// orderService not used here; use api directly for per-tab requests
import { useWishlist } from '@/context/WishlistContext';
import { api, attachAuthToken, handleApiError } from '../../../src/lib/api';
import supabase from '../../lib/supabaseClient'
import { useToast } from '../../../context/ToastProvider';
import SupportTab from '../../components/dashboard/tabs/SupportTab'
import OrdersTab from '../../components/dashboard/tabs/OrdersTab'
import ProfileTab from '../../components/dashboard/tabs/ProfileTab'
import SecurityTab from '../../components/dashboard/tabs/SecurityTab'
import ProductGrid from '../../components/home/home-products/ProductsGrid'

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  // wishlist is provided by context (local-storage first). Do not fetch here.
  const { wishlist } = useWishlist();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({});
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, session, loading: authLoading, signOut } = useAuth();
  // no local wishlistState needed; context provides `wishlist` directly
  const [activeTab, setActiveTab] = useState(() => (location?.state && location.state.activeTab) ? location.state.activeTab : "overview");

  // Make a reusable loader for profile/user data so child tabs can refresh it
  async function loadUserData() {
    setLoading(true);
    try {
      // Prefer reading directly from Supabase (auth + profiles table)
      let supUser = null
      try {
        const supRes = await supabase.auth.getUser();
        supUser = supRes?.data?.user ?? null;
      } catch (supErr) {
        console.warn('supabase.auth.getUser() failed, falling back to API', supErr)
        supUser = null
      }

      if (supUser) {
        const { data: profRow, error: profErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', supUser.id)
          .limit(1)
          .maybeSingle?.() ?? await (async () => {
            const r = await supabase.from('users').select('*').eq('id', supUser.id).single().catch(e => ({ data: null, error: e }));
            return r;
          })();

        // Merge auth user and db profile so components receive the full shape
        setUser({ ...(supUser || {}), ...(profRow || {}) });
        setProfile(profRow || null);
        const fullName = profRow?.name ?? '';
        const nameParts = fullName ? String(fullName).trim().split(/\s+/) : [];
        const first = nameParts.length > 0 ? nameParts[0] : '';
        const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        setProfileForm({
          first_name: first,
          last_name: last,
          email: supUser?.email ?? profRow?.email ?? '',
          phone: profRow?.phone ?? profRow?.phone_number ?? supUser?.phone ?? ''
        });
        setLoading(false);
        return;
      }

      // Fallback to API
      const token = session?.access_token || session?.accessToken || null;
      attachAuthToken(token);
      const res = await api.get('/me');
      const payload = res?.data?.data ?? res?.data ?? {};
  // Merge API user and profile so components receive the full shape
  setUser({ ...(payload.user || {}), ...(payload.profile || {}) || authUser || null });
  const prof = payload.profile || null;
      setProfile(prof);
      setProfileForm({
        first_name: prof?.first_name ?? prof?.firstName ?? payload.user?.user_metadata?.first_name ?? payload.user?.firstName ?? '',
        last_name: prof?.last_name ?? prof?.lastName ?? payload.user?.user_metadata?.last_name ?? payload.user?.lastName ?? '',
        email: payload.user?.email ?? prof?.email ?? '',
        phone: prof?.phone ?? prof?.phone_number ?? payload.user?.phone ?? ''
      });
    } catch (err) {
      console.error('Failed to load user data:', err);
      showToast?.('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }

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
          // prefer fulfillment/order status, fall back to payment status
          status: order.status || order.fulfillment_status || order.payment_status || order.paymentStatus || 'pending',
          fulfillmentStatus: (order.status || order.fulfillment_status || '').toString().toLowerCase(),
          // include tracking and shipment timestamps when available
          tracking_number: order.tracking_number || order.trackingNumber || order.__raw?.tracking_number || null,
          shipped_at: order.shipped_at || order.shippedAt || order.__raw?.shipped_at || null,
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

    // Wishlist is handled by context (local-first). Do not fetch here.

    async function fetchProfileForTab() {
      setLoading(true);
      try {
        // Prefer reading directly from Supabase (auth + profiles table)
        let supUser = null
        try {
          const supRes = await supabase.auth.getUser();
          supUser = supRes?.data?.user ?? null;
        } catch (supErr) {
          console.warn('supabase.auth.getUser() failed, falling back to API', supErr)
          supUser = null
        }

        if (supUser) {
          // try to fetch profile row by user id
          const { data: profRow, error: profErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', supUser.id)
            .limit(1)
            .maybeSingle?.() ?? await (async () => {
              // some supabase versions may not have maybeSingle; fall back to single and handle not found
              const r = await supabase.from('users').select('*').eq('id', supUser.id).single().catch(e => ({ data: null, error: e }));
              return r;
            })();

          if (!mounted) return;
          // Merge auth user and db profile so ProfileTab receives full data (email + shipping_address etc.)
          setUser({ ...(supUser || authUser || {}), ...(profRow || {}) });
          setProfile(profRow || null);
          // users table has a single `name` column; split it into first/last for the form
          const fullName = profRow?.name ?? '';
          const nameParts = fullName ? String(fullName).trim().split(/\s+/) : [];
          const first = nameParts.length > 0 ? nameParts[0] : '';
          const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          setProfileForm({
            first_name: first,
            last_name: last,
            email: supUser?.email ?? profRow?.email ?? '',
            phone: profRow?.phone ?? profRow?.phone_number ?? supUser?.phone ?? ''
          });
          setLoading(false);
          return;
        }

        // Fallback to existing API endpoint if supabase auth/profile is unavailable
        const token = session?.access_token || session?.accessToken || null;
        attachAuthToken(token);
        const res = await api.get('/me');
        const payload = res?.data?.data ?? res?.data ?? {};
  if (!mounted) return;
  // Merge API user and profile so components receive the full shape
  setUser({ ...(payload.user || {}), ...(payload.profile || {}) || authUser || null });
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

    // Only re-run when the active tab or the authenticated user's id changes.
    // If there's no authenticated user id, clear data and stop.
    if (!authUser?.id) {
      setUser(null);
      setOrders([]);
      // wishlist is local-first and provided by context; don't mutate it here
      setLoading(false);
      return () => { mounted = false };
    }

    // Decide which tab to fetch
    if (authUser?.id) {
      // Fetch DB profile to ensure header name is always correct
      supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .then(({ data: dbProfile, error }) => {
          if (error) {
            // fallback to authUser only
            setUser(authUser);
          } else {
            // Merge Auth User (email/ids) + DB profile (name, shipping_address, etc.)
            setUser({ ...authUser, ...(dbProfile || {}) });
          }
        })
        .catch(() => setUser(authUser));
      if (activeTab === 'orders') fetchOrdersForTab(1, 100);
      else if (activeTab === 'profile') fetchProfileForTab();
      else if (activeTab === 'security') fetchSecurityForTab();
      else if (activeTab === 'overview') {
        // load a small recent orders set for overview
        fetchOrdersForTab(1, 5);
      }
    }

    return () => { mounted = false };
  }, [activeTab, authUser?.id]);

  async function saveProfile() {
    setLoading(true);
    try {
      // Prefer updating the Supabase profiles table directly
      try {
        const supRes = await supabase.auth.getUser();
        const supUser = supRes?.data?.user ?? null;
        if (supUser) {
          // users table stores a single `name` column; combine first + last
          const combinedName = [profileForm.first_name, profileForm.last_name].filter(Boolean).join(' ').trim() || null;
          const updPayload = {
            name: combinedName,
            phone: profileForm.phone ?? null,
            email: profileForm.email ?? null,
            updated_at: new Date().toISOString()
          };

          const { data: updData, error: updErr } = await supabase.from('users').update(updPayload).eq('id', supUser.id).select();
          if (updErr) throw updErr;
          const newProfile = Array.isArray(updData) ? updData[0] : updData;
          setProfile(newProfile || profile);
          showToast?.('Profile updated', 'success');
          setLoading(false);
          return;
        }
      } catch (supErr) {
        console.warn('Supabase profile update failed, falling back to API', supErr);
      }

      // Fallback to existing API
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
    // Normalize to lower-case and map to the requested color scheme
    switch (status?.toLowerCase()) {
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => {
    const n = Number(value || 0);
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  }

  // derive a safe first name for the welcome header
  const displayName = user?.name || user?.full_name || user?.firstName || user?.first_name || user?.username || 'Member';
  const firstName = displayName ? String(displayName).trim().split(/\s+/)[0] : 'Member';

  // Normalize wishlist items for UI components (images, rating, reviews)
  const normalizedWishlist = (Array.isArray(wishlist) ? wishlist : []).map(item => {
    // images may come as an array, a JSON string, a comma-separated string, or a single path
    const raw = item.images ?? item.image ?? '';
    let validImages = [];
    try {
      if (Array.isArray(raw)) {
        validImages = raw.filter(Boolean);
      } else if (typeof raw === 'string') {
        const s = raw.trim();
        if (!s) {
          validImages = [];
        } else if (s.startsWith('[') || s.startsWith('{')) {
          // try parse JSON
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) validImages = parsed.filter(Boolean);
          else if (typeof parsed === 'string') validImages = [parsed];
        } else if (s.includes(',')) {
          validImages = s.split(',').map(x => x.trim()).filter(Boolean);
        } else {
          validImages = [s];
        }
      }
    } catch (e) {
      // fallback to best-effort single value
      validImages = typeof raw === 'string' && raw ? [raw] : [];
    }

    // 2. Determine Main Image (Allow local paths like /images/...)
    const mainImage = item.image || (validImages.length > 0 ? validImages[0] : null) || 'https://placehold.co/400?text=No+Image';

    return {
      ...item,
      // Pass the parsed array so ProductGrid can use it
      images: validImages,
      // Pass the resolved main image
      image: mainImage,
      // Ensure numbers
      priceValue: Number(item.price) || Number(item.priceValue) || 0,
      rating: Number(item.rating) || Number(item.average_rating) || 0,
      reviews: Array.isArray(item.reviews) ? item.reviews : []
    };
  });

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
                  Welcome back, {(user?.name || user?.full_name || user?.firstName || 'Member').split(' ')[0]}!
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
              { id: "support", label: "Support", icon: HelpCircle },
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
                        {formatCurrency(orders.reduce((total, order) => total + (order.total || 0), 0))}
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                                {order.status === 'shipped' && <Truck className="w-3 h-3 inline mr-1" />}
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {formatDate(order.createdAt)}
                            </p>
                            <div className="mt-3">
                              <p className="text-sm text-gray-700">
                                Items: {order.items?.length || 0} • Total: {formatCurrency(order.total)}
                              </p>
                              {((order.tracking_number || order.trackingNumber || order.__raw?.tracking_number) && (order.status === 'shipped' || order.status === 'delivered')) && (
                                <div className="mt-2 text-sm flex items-center gap-3">
                                  <div className="text-slate-600">Tracking #: <span className="font-medium">{order.tracking_number || order.trackingNumber || order.__raw?.tracking_number}</span></div>
                                  <a href={`https://giglogistics.com/track?id=${encodeURIComponent(order.tracking_number || order.trackingNumber || order.__raw?.tracking_number)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">Track Order</a>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderId(order.id)
                                setActiveTab('orders')
                              }}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                            >
                              View Details
                            </button>
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
            <div>
              <OrdersTab orders={orders} initialOrderId={selectedOrderId} />
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
                <div className="p-6">
                  <ProductGrid products={normalizedWishlist} />
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <ProfileTab user={user} onProfileUpdate={loadUserData} />
            </div>
          )}

          {activeTab === "support" && (
            <div>
              <SupportTab />
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <SecurityTab user={user} />
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
            <button 
              onClick={() => { setActiveTab('support'); window.scrollTo(0,0); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
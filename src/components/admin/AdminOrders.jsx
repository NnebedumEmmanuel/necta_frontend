import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign, 
  User, 
  MapPin, 
  Calendar, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye
} from "lucide-react";
import { useToast } from "../../context/useToastHook";
import { useEffect, useState } from "react";
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/orders');
      const data = res?.data?.orders ?? res?.data ?? [];

      const normalized = (Array.isArray(data) ? data : []).map((order) => ({
        id: order.id,
        orderNumber: order.order_number || order.orderNumber || order.id,
        customer: order.customer || order.customer_info || { name: order.email || 'Customer' },
        createdAt: order.created_at || order.createdAt || null,
        status: order.payment_status || order.status || 'pending',
        items: order.items || order.line_items || [],
        subtotal: order.subtotal || order.total || 0,
        total: order.total || order.subtotal || 0,
        shippingAddress: order.shipping_address || order.shippingAddress || '',
        __raw: order,
      }));

      const sortedOrders = normalized.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (err) {
      const status = err?.response?.status;
        if (status === 401) {
          showToast('Unauthorized. Please login.', 'error');
          navigate('/login');
          return;
        }
        if (status === 403) {
          showToast('Access denied: Admins only', 'error');
          navigate('/');
          return;
        }
      console.error('Error loading orders:', err);
      setError(err?.message || 'Failed to load orders');
      showToast('Error loading orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  // No client-side editing of orders yet; read-only view only.


  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { icon: Clock, color: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-50" };
      case "processing":
        return { icon: Package, color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" };
      case "shipped":
        return { icon: Truck, color: "bg-purple-500", textColor: "text-purple-700", bgColor: "bg-purple-50" };
      case "delivered":
        return { icon: CheckCircle, color: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-50" };
      case "cancelled":
        return { icon: XCircle, color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" };
      default:
        return { icon: Clock, color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50" };
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const calculateRevenue = () => {
    return orders.reduce((total, order) => total + (order.total || 0), 0);
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      revenue: calculateRevenue()
    };
    return stats;
  };

  const stats = getOrderStats();

  const MobileOrderCard = ({ order }) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    const isExpanded = expandedOrderId === order.id;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-900">{order.orderNumber}</span>
            </div>
            <div className="text-sm text-slate-600">{formatDate(order.createdAt)}</div>
          </div>
          <button
            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium">{order.customer?.name}</span>
          </div>
          <div className={`px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} text-xs font-medium flex items-center gap-1`}>
            <StatusIcon size={12} />
            {order.status && order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-slate-600">
            {order.items?.length || 0} items
          </div>
          <div className="flex items-center gap-1 font-bold text-slate-900">
            <DollarSign size={14} />
            ${order.total?.toFixed(2) || "0.00"}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="text-sm">
              <div className="font-medium text-slate-700 mb-1">Customer Email</div>
              <div className="text-slate-600">{order.customer?.email}</div>
            </div>
            
            <div className="text-sm">
              <div className="font-medium text-slate-700 mb-1">Items</div>
              <div className="space-y-1">
                {(order.items || []).slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-slate-600">{item.name} × {item.quantity}</span>
                    <span className="font-medium">${item.total?.toFixed(2)}</span>
                  </div>
                ))}
                {(order.items || []).length > 3 && (
                  <div className="text-slate-500 text-xs">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div className="text-sm">
                <div className="font-medium text-slate-700 mb-1">Payment Status</div>
                <div className="text-slate-600">{order.status}</div>
              </div>

              <div className="text-sm">
                <div className="font-medium text-slate-700 mb-1">Customer Email</div>
                <div className="text-slate-600">{order.customer?.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Manage customer orders and track fulfillment
            </p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Total Orders</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          {}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Pending</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">{stats.pending}</p>
              </div>
              <div className="p-2 sm:p-3 bg-amber-500/10 rounded-lg sm:rounded-xl">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          {}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Processing</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">{stats.processing}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          {}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Delivered</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">{stats.delivered}</p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg sm:rounded-xl">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          {}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Total Revenue</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
                  ${stats.revenue.toFixed(2)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg sm:rounded-xl">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            />
          </div>
          
          <div className="w-full sm:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {}
        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">Error loading orders</p>
            <p className="text-sm text-slate-500 mt-2">{String(error)}</p>
            <div className="mt-4">
              <button onClick={loadOrders} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Retry</button>
            </div>
          </div>
        ) : (
          <>
            {}
            <div className="lg:hidden">
              {filteredOrders.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-semibold text-slate-700">No orders found</p>
                  <p className="text-sm text-slate-500 mt-2">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div>
                  {filteredOrders.map((order) => (
                    <MobileOrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>

            {}
            <div className="hidden lg:block">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-indigo-50">
                        <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Order #</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Customer Email</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Total</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Payment Status</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-500">
                            <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                            <p className="text-lg font-semibold">No orders found</p>
                            <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const statusInfo = getStatusInfo(order.status);
                          const StatusIcon = statusInfo.icon;
                          
                          return (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900">{order.orderNumber}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-slate-700">{order.customer?.email || order.customer?.name || '—'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-bold text-slate-900">${order.total?.toFixed(2) || "0.00"}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm font-medium text-slate-900">{order.status}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2 text-slate-700 text-sm">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(order.createdAt)}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Order Details</h2>
                  <p className="text-slate-600 text-sm mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                </button>
              </div>

              {}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">{selectedOrder.customer?.name}</p>
                        <p className="text-xs sm:text-sm text-slate-600">{selectedOrder.customer?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">Shipping Address</p>
                        <p className="text-xs sm:text-sm text-slate-600">{selectedOrder.shippingAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Order Items</h3>
                <div className="space-y-2 sm:space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900 text-sm sm:text-base">{item.name}</p>
                        <p className="text-xs sm:text-sm text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-sm sm:text-base">${item.total?.toFixed(2)}</p>
                        <p className="text-xs text-slate-600">${(item.total / item.quantity).toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium">${selectedOrder.tax?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-purple-200 pt-2">
                    <div className="flex justify-between pt-2">
                      <span className="text-base sm:text-lg font-semibold">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-slate-900">
                        {selectedOrder.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
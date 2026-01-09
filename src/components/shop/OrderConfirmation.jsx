import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrders } from "../../../services/authServices";
import { CheckCircle, ShoppingBag, Home, Package } from "lucide-react";

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = () => {
      setLoading(true);
      const orders = getOrders();
      const foundOrder = orders.find(o => o.orderNumber === orderNumber);
      setOrder(foundOrder);
      setLoading(false);
    };

    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link
            to="/shop"
            className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
          >
            <ShoppingBag className="mr-2" size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-green-100">Thank you for your purchase</p>
          </div>

          {}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{order.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{order.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{order.customer?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="font-semibold">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 grid grid-cols-4 text-sm font-semibold text-gray-700">
                <div>Product</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Price</div>
                <div className="text-right">Total</div>
              </div>
              <div className="divide-y">
                {order.items?.map((item, index) => (
                  <div key={index} className="px-6 py-4 grid grid-cols-4 items-center">
                    <div className="flex items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-contain mr-4" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.brand}</p>
                      </div>
                    </div>
                    <div className="text-center">{item.quantity}</div>
                    <div className="text-center">₦{item.price?.toFixed(2)}</div>
                    <div className="text-right font-semibold">₦{item.total?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₦{order.total?.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-semibold">₦{order.subtotal?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tax (8%)</p>
                  <p className="font-semibold">₦{order.tax?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-semibold text-green-600">₦1,500.00</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-semibold">Cash on Delivery</p>
                </div>
              </div>
            </div>

            {}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
              >
                <ShoppingBag size={20} />
                View in Dashboard
              </Link>
              <Link
                to="/shop"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold"
              >
                <Home size={20} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
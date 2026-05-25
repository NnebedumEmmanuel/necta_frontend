import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '@/context/CartContext';
import { STATE_LGA_MAP } from '@/lib/pricing';
import { orderService } from "../../../services/orderService";
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastProvider';

const CheckoutPage = () => {
  const { cartItems: ctxCartItems, state, deliveryState, setDeliveryState, clearCart } = useCart() || {};

  const cartItems = (Array.isArray(ctxCartItems) && ctxCartItems.length > 0)
    ? ctxCartItems
    : (Array.isArray(state?.items) ? state.items : []);

  const realItems = Array.isArray(cartItems) ? cartItems : [];

  const subtotal = cartItems.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.-]+/g, '')) || 0;
    const qty = Number(item.quantity || item.qty || 1) || 0;
    return acc + (price * qty);
  }, 0);

  const SHIPPING_RATES = {
    Lagos: 2500,
    Default: 4500,
    FreeThreshold: 5000000,
  };

  const shippingCost = React.useMemo(() => {
    const stateSelected = deliveryState || '';
    if (!stateSelected) return 0;
    if (subtotal > (SHIPPING_RATES.FreeThreshold / 100)) return 0;
    if (String(stateSelected).toLowerCase() === 'lagos') return SHIPPING_RATES.Lagos;
    return SHIPPING_RATES.Default;
  }, [deliveryState, subtotal]);

  const tax = subtotal * 0.075;
  const grandTotal = subtotal + tax + shippingCost;

  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🚨 NEW: Added processing state to prevent double clicks!
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: deliveryState || "",
    lga: "",
    houseDescription: "",
    landmark: "",
    coordinates: null,
  });

  const currentLgas = React.useMemo(() => {
    return (STATE_LGA_MAP[formData.state] || []);
  }, [formData.state]);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, lga: '' }));
  }, [formData.state]);

  React.useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      fullName: prev.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user?.name || "")),
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || user?.user_metadata?.phone || "",
      address: prev.address || user?.address || "",
      city: prev.city || user?.city || "",
      state: prev.state || deliveryState || user?.state || "",
      lga: prev.lga || user?.lga || "",
      houseDescription: prev.houseDescription || "",
      landmark: prev.landmark || "",
      coordinates: prev.coordinates || null,
    }));
  }, [user]);

  React.useEffect(() => {
    if (deliveryState && deliveryState !== formData.state) {
      setFormData(prev => ({ ...prev, state: deliveryState }));
    }
  }, [deliveryState]);

  React.useEffect(() => {
    if (formData.state !== deliveryState) {
      setDeliveryState(formData.state || "");
    }
  }, [formData.state]);

  const handlePayment = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.lga) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!user?.id) {
      showToast("Please log in to place an order.", "error");
      return;
    }

    if (!Array.isArray(realItems) || realItems.length === 0) {
      showToast('Cart is empty!', 'error');
      return;
    }

    // 🚨 Prevent double-clicks!
    setIsProcessing(true);

    const orderItems = realItems.map(item => ({
      product_id: item.id,
      quantity: Number(item.quantity || item.qty || 1) || 1,
      price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.-]+/g, '')) || 0,
      name: item.name || item.title || ''
    }));

    const orderData = {
      email: formData.email, 
      shipping_address: `${formData.address}${formData.houseDescription ? ', ' + formData.houseDescription : ''}${formData.landmark ? ', near ' + formData.landmark : ''}, ${formData.lga || ''}, ${formData.state || ''}`,
      total_amount: Number(grandTotal), 
      total: Number(grandTotal), 
      items: orderItems,
      customer: {
        userId: user?.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}${formData.houseDescription ? ', ' + formData.houseDescription : ''}${formData.landmark ? ', ' + formData.landmark : ''}`,
        city: formData.city,
        state: formData.state,
        lga: formData.lga,
        houseDescription: formData.houseDescription,
        landmark: formData.landmark,
        coordinates: formData.coordinates
      },
      subtotal: Number(subtotal).toFixed(2),
      tax: Number(tax).toFixed(2),
      amountKobo: Math.round(Number(grandTotal) * 100),
      status: 'pending'
    };

    try {
      const res = await orderService.addOrder(orderData);
      console.log("Raw Service Response:", res); // Debug log just in case

      if (res?.success || res?.data?.success) {
        
        // 🚨 Aggressive URL hunting! Checks every possible nested location
        const authorizationUrl = 
          res?.paystack_auth_url || 
          res?.data?.paystack_auth_url || 
          res?.data?.data?.paystack_auth_url || 
          res?.paystack?.authorization_url;

        const orderId = res?.order_id || res?.data?.order_id;

        // 1. If we found the Paystack URL, redirect!
        if (authorizationUrl) {
          clearCart();
          window.location.replace(authorizationUrl); // replace() is smoother for payment redirects
          return;
        }

        // 2. Fallback
        if (orderId) {
          clearCart();
          showToast(`Order placed! Order Number: ${orderId}`, "success");
          navigate(`/order-confirmation/${orderId}`);
          return;
        }
      }

      // UX FIX: Catch backend errors (like stock issues) properly
      if (!res?.success && res?.error) {
        showToast(res.error, "error");
        return;
      }
      if (res?.data && !res.data.success && res.data.error) {
        showToast(res.data.error, "error");
        return;
      }

      showToast("Order processing issue. Please check your admin panel.", "error");
    } catch (error) {
      console.error("Error placing order:", error);
      
      const errorMessage = error.response?.data?.error || error.message || "Failed to place order.";
      const cleanMessage = errorMessage.replace(/^Error:\s*/, '');
      
      showToast(cleanMessage, "error");
    } finally {
      // 🚨 Turn off loading state no matter what happens
      setIsProcessing(false);
    }
  };

  const needsState = Number(shippingCost) === 0 && !formData.state;
  const isFormValid = Boolean(
    formData.fullName && formData.email && formData.phone && formData.address && formData.state && formData.lga && !needsState
  );

  return (
    <main key={user?.id || 'guest'} className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <section className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium mb-4">Shipping Details</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full name</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Recipient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={formData.state}
                    onChange={(e) => {
                      const s = e.target.value;
                      setFormData(prev => ({ ...prev, state: s, lga: '' }));
                      setDeliveryState(s);
                    }}
                  >
                    <option value="">Select state</option>
                      {Object.keys(STATE_LGA_MAP).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">LGA</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={formData.lga}
                    disabled={!formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
                  >
                    <option value="">Select LGA</option>
                    {(currentLgas || []).map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">House Description (optional)</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.houseDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseDescription: e.target.value }))}
                  placeholder="e.g., Yellow gate, Flat 2B"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Landmark (optional)</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.landmark}
                  onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  placeholder="e.g., Near the transformer"
                />
              </div>

            </div>
          </div>
        </section>

        <aside className="bg-gray-50 p-6 rounded-lg shadow-sm h-fit sticky top-20">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-gray-700">
              {(Array.isArray(realItems) ? realItems : []).map(item => {
              const rawPrice = item?.price;
              const price = typeof rawPrice === 'number' ? Number(rawPrice || 0) : parseFloat(String(item.price || '').replace(/[^\d.-]/g, '')) || 0;
              const qty = Number(item.quantity || item.qty || 1) || 0;
              return (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} × <span className="font-medium">{qty}</span></span>
                  <span className="font-medium">{(price * qty).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
                </div>
              );
            })}

            <hr className="my-4 border-gray-200" />

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{Number(subtotal || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>{Number(tax || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium">{Number(shippingCost) === 0 ? 'Free' : Number(shippingCost).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
              <span>Grand Total</span>
              <span className="text-yellow-500">{Number(grandTotal || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="mt-6">
            {needsState ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold cursor-not-allowed"
              >
                Please select a delivery state
              </button>
            ) : (
              <div key={`${(cartItems || []).length}-${user?.id || 'guest'}`} className="w-full">
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={!isFormValid || isProcessing}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    isFormValid && !isProcessing 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? 'Processing... please wait' : 'Pay with Paystack'}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;
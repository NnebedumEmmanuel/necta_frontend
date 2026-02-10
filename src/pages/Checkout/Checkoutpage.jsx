import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '@/context/CartContext';
import { NIGERIAN_STATES } from '@/lib/pricing';
import { orderService } from "../../../services/orderService";
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastProvider';

const CheckoutPage = () => {
  // Use the cart context with the required destructured names for UI contract
  const { cartItems, state, deliveryState, setDeliveryState, clearCart } = useCart() || {};

  // Safe cart extraction (keep this logic to prevent "Cart is empty" errors)
  const realItems = (Array.isArray(cartItems) && cartItems.length > 0) ? cartItems : (Array.isArray(state?.items) ? state.items : []);
  // Debug: inspect what the cart context provides
  console.log('Checkout Cart:', { cartItems, state, realItems, deliveryState });

  // Force-local calculations to avoid stale context values and ensure UI + Paystack stay in sync
  const subtotal = (Array.isArray(realItems) ? realItems : []).reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.-]+/g, '')) || 0;
    const qty = Number(item.quantity || item.qty || 1) || 0;
    return acc + (price * qty);
  }, 0);

  // Shipping rates and free-threshold (FreeThreshold is in kobo: 5,000,000 kobo => ₦50,000)
  const SHIPPING_RATES = {
    Lagos: 2500,
    Default: 4500,
    FreeThreshold: 5000000,
  }

  // Compute shipping cost based on selected state and subtotal. We watch formData.state
  // Free threshold comparison: subtotal (NGN) > FreeThreshold/100 (because FreeThreshold is in kobo)
  const shippingCost = React.useMemo(() => {
    const stateSelected = formData?.state || ''
    if (!stateSelected) return 0
    // Free if subtotal exceeds the threshold
    if (subtotal > (SHIPPING_RATES.FreeThreshold / 100)) return 0
    if (String(stateSelected).toLowerCase() === 'lagos') return SHIPPING_RATES.Lagos
    return SHIPPING_RATES.Default
  }, [formData?.state, subtotal])

  const tax = subtotal * 0.075;

  const grandTotal = subtotal + tax + shippingCost;

  // Paystack config uses the freshly computed grandTotal (amount must be in kobo)
  const paystackConfig = {
    amount: Math.round(grandTotal * 100), // Kobo
    currency: 'NGN'
  };
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: deliveryState || "",
  });
  // Auto-fill form fields from authenticated user when available
  React.useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      fullName: prev.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user?.name || "")),
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || user?.user_metadata?.phone || "",
      address: prev.address || user?.address || "",
      city: prev.city || user?.city || "",
      state: prev.state || deliveryState || user?.state || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // keep formData.state and deliveryState in sync
  React.useEffect(() => {
    if (deliveryState && deliveryState !== formData.state) {
      setFormData(prev => ({ ...prev, state: deliveryState }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryState]);

  React.useEffect(() => {
    if (formData.state !== deliveryState) {
      setDeliveryState(formData.state || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state]);

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!user?.id) {
      showToast("Please log in to place an order.", "error");
      return;
    }

    // Prevent empty cart orders
    if (!Array.isArray(realItems) || realItems.length === 0) {
      if (showToast) showToast('Cart is empty!', 'error');
      else alert('Cart is empty!');
      return;
    }

    // Map cart items explicitly to ensure payload contains product_id, quantity, price and name
    const orderItems = realItems.map(item => ({
      product_id: item.id,
      quantity: Number(item.quantity || item.qty || 1) || 1,
      price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.-]+/g, '')) || 0,
      name: item.name || item.title || ''
    }));

    const orderData = {
      customer: {
        userId: user?.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state
      },
        items: orderItems,
        subtotal: Number(subtotal).toFixed(2),
        tax: Number(tax).toFixed(2),
        total: Number(grandTotal).toFixed(2),
        amountKobo: Math.round(Number(grandTotal) * 100),
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}`,
      status: 'pending'
    };

    try {
      const res = await orderService.addOrder(orderData);

      if (res?.success) {
        const order = res.data?.order;
        const paystack = res.data?.paystack;

        const authorizationUrl = paystack?.authorization_url || paystack?.data?.authorization_url;
        if (authorizationUrl) {
          clearCart();
          window.location.href = authorizationUrl;
          return;
        }

        if (order?.id) {
          clearCart();
          showToast(`Order placed successfully! Order Number: ${order.id}`, "success");
          navigate(`/order-confirmation/${order.id}`);
          return;
        }
      }

      showToast("Failed to place order. Please try again.", "error");
    } catch (error) {
      console.error("Error placing order:", error);
      showToast("Failed to place order. Please try again.", "error");
    }
  };

  const currency = (value) => {
    return Number(value).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
  };

  console.log("Checkout Math:", { subtotal, tax, shippingCost, grandTotal });

  const needsState = Number(shippingCost) === 0 && !formData.state;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Shipping form (span 2) */}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={formData.state}
                    onChange={(e) => {
                      const s = e.target.value;
                      setFormData(prev => ({ ...prev, state: s }));
                      setDeliveryState(s);
                    }}
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
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
            </div>
          </div>
        </section>

        {/* Right: Order summary (span 1) */}
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
              <div key={finalTotal} className="w-full">
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600"
                >
                  Pay with Paystack
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
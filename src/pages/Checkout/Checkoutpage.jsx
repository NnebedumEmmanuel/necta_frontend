// src/pages/CheckoutPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/useCartHook";
import CheckoutForm from "../../components/shop/CheckoutForm";
import OrderSummary from "../../components/shop/shopdetails/OrderSummary";
import { orderService } from "../../../services/orderService";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "../../context/useToastHook";

const CheckoutPage = () => {
  const { state, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  // Calculate subtotal from cart
  const subtotal = state.items.reduce((acc, item) => {
    const rawPrice = item?.price;
    const price = typeof rawPrice === 'number' ? Number(rawPrice || 0) : parseFloat(String(rawPrice || '').replace(/[^\d.-]/g, '')) || 0;
    return acc + price * (Number(item.quantity) || 0);
  }, 0);

  const deliveryFee = 1500;

  // Place order handler
  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!user?.id) {
      showToast("Please log in to place an order.", "error");
      // Optionally redirect to login page
      // navigate('/login');
      return;
    }

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
      items: state.items.map(item => {
        const rawPrice = item?.price;
        const price = typeof rawPrice === 'number' ? Number(rawPrice || 0) : parseFloat(String(rawPrice || '').replace(/[^\d.-]/g, '')) || 0;
        return {
          id: item.id,
          name: item.name,
          price: price.toFixed(2),
          quantity: item.quantity,
          total: (price * (Number(item.quantity) || 0)).toFixed(2),
          image: item.image,
          brand: item.brand || "T&G"
        };
      }),
      subtotal: subtotal.toFixed(2),
      tax: (subtotal * 0.08).toFixed(2),
      total: (subtotal + (subtotal * 0.08) + deliveryFee).toFixed(2),
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}`,
      status: 'pending'
    };

    try {
      // Save the order
      const res = await orderService.addOrder(orderData);

      // res is the backend response object (e.g. { success: true, data: { order, paystack } })
      if (res?.success) {
        const order = res.data?.order;
        const paystack = res.data?.paystack;

        // If Paystack returned an authorization_url, redirect the browser to complete payment
        const authorizationUrl = paystack?.authorization_url || paystack?.data?.authorization_url;
        if (authorizationUrl) {
          // Original behavior: clear cart before redirecting to payment and then
          // navigate to Paystack. Restoring that flow during revert.
          clearCart();
          window.location.href = authorizationUrl;
          return;
        }

        // Fallback: if no paystack URL, but order exists, navigate to confirmation
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Shipping Form */}
        <div className="lg:col-span-2">
          <CheckoutForm
            formData={formData}
            setFormData={setFormData}
          />
        </div>

        {/* RIGHT: Order Summary */}
        <OrderSummary
          cartItems={state.items}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
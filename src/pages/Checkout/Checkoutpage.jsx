// src/pages/CheckoutPage.jsx
import React, { useState } from "react";

// ✅ Import OrderSummary here (because it is rendered here)
import CheckoutForm from "../../components/shop/CheckoutForm";

import { useCart } from "../../../context/useCartHook";
import OrderSummary from "../../components/shop/shopdetails/OrderSummary";

const CheckoutPage = () => {
  const { state } = useCart();

  // ============================
  // Shipping form state
  // ============================
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  // ============================
  // Calculate subtotal from cart
  // ============================
  const subtotal = state.items.reduce((acc, item) => {
    const price = parseFloat(
      item.price.replace(/[^\d.-]/g, "")
    );
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = 1500;

  // ============================
  // Place order handler
  // ============================
  const handlePlaceOrder = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const order = {
      customer: formData,
      items: state.items,
      total: subtotal + deliveryFee,
    };

    console.log("Order placed:", order);
    alert("Order placed successfully 🎉");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Checkout
      </h1>

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

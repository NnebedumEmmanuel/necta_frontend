import React from "react";
import {
  Package,
  Truck,
  CreditCard,
} from "lucide-react";

const OrderSummary = ({ cartItems, subtotal, deliveryFee, onPlaceOrder }) => {
  const total = Number(subtotal || 0) + Number(deliveryFee || 0);

  const formatPrice = (value) => {
    const n = Number(value || 0);
    return n.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 });
  };

  return (
    <div
      className="
        bg-white
        p-6
        rounded-2xl
        border
        border-yellow-100
        shadow-md
        transition-all
        duration-300
        hover:shadow-xl
        hover:-translate-y-[1px]
      "
    >
      {}
      <div className="flex items-center gap-2 mb-4">
        <Package className="text-yellow-500" size={22} />
        <h2 className="text-2xl font-bold text-gray-800">
          Order Summary
        </h2>
      </div>

      {}
      <div className="space-y-3">
        {cartItems.map((item) => {
          const itemPrice = Number(item.price || 0);
          const qty = Number(item.quantity || item.qty || 1) || 0;
          return (
            <div
              key={item.id}
              className="
                flex
                justify-between
                items-center
                text-sm
                text-gray-700
                transition-colors
                hover:text-gray-900
              "
            >
              {}
              <span>
                {item.name} ×{" "}
                <span className="font-medium">{item.quantity}</span>
              </span>

              {}
              <span className="font-medium">
                {formatPrice(itemPrice * qty)}
              </span>
            </div>
          );
        })}
      </div>

      {}
      <hr className="my-4 border-gray-200" />

      {}
      <div
        className="
          flex
          items-center
          gap-3
          bg-yellow-50
          p-3
          rounded-xl
          text-sm
          text-gray-700
          mb-4
        "
      >
        <Truck className="text-yellow-500" size={18} />
        <span>
          Estimated delivery:
          <span className="font-semibold text-gray-900">
            {" "}5 working days
          </span>
        </span>
      </div>

      {}
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>

        {}
        <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
          <span>Total</span>
          <span className="text-yellow-500">{formatPrice(total)}</span>
        </div>
      </div>

      {}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <CreditCard size={14} />
        <span>Secure checkout • All payments are protected</span>
      </div>

      {}
      <button
        onClick={onPlaceOrder}
        className="
          mt-6
          w-full
          bg-yellow-500
          text-white
          py-3
          rounded-xl
          font-semibold
          hover:bg-yellow-600
          transition-colors
          duration-300
        "
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;

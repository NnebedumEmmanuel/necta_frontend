// pages/CartPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../../../context/useCartHook";

const CartPage = () => {
  const { state, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black font-semibold">Shopping Cart</span>
      </nav>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Cart Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b">
              <div className="col-span-6">
                <span className="text-sm font-semibold text-gray-900">PRODUCT</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-semibold text-gray-900">QUANTITY</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-semibold text-gray-900">TOTAL</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-semibold text-gray-900">ACTION</span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="divide-y">
              {state.items.map((item) => {
                const price = parseFloat(item.price.replace(/[^\d.-]/g, ''));
                const total = price * item.quantity;

                return (
                  <div key={item.id} className="p-4 md:p-6">
                    <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Product Image and Info */}
                      <div className="flex items-start gap-4 md:col-span-6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-contain rounded-lg bg-gray-50"
                        />
                        <div className="flex-1">
                          <Link
                            to={`/shop/products/${item.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.brand || "Brand"}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex justify-between items-center md:col-span-2 mt-4 md:mt-0">
                        <span className="md:hidden font-medium text-gray-600">Qty:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex flex-col md:col-span-2 mt-4 md:mt-0">
                        <span className="md:hidden font-medium text-gray-600 mb-2">Total:</span>
                        <span className="font-bold text-lg text-gray-900 ml-4">
                          ₦{total.toFixed(2)}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <div className="flex justify-end md:col-span-2 md:justify-center mt-4 md:mt-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Remove from cart"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Actions */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center border border-gray-300 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="inline-flex items-center justify-center border border-red-200 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  <Trash2 className="mr-2" size={18} />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₦{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₦{(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₦{(getTotalPrice() * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                Proceed to Checkout
              </button>
              <p className="text-center text-sm text-gray-500">
                Free shipping on orders over ₦50,000
              </p>
            </div>

            {/* Promo Code */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Promo Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
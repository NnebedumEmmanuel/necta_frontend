// import React from "";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/useCartHook";

export default function WishlistPage() {
  const { state, dispatch } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleRemoveFromWishlist = (productId) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: 1
    });
    navigate("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex text-gray-500 text-sm mb-8">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black font-semibold">Wishlist</span>
      </nav>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {state.items.length} {state.items.length === 1 ? "item" : "items"} in your wishlist
        </p>
      </div>

      {/* Empty State */}
      {state.items.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Add items to your wishlist to save them for later
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.items.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden group cursor-pointer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate(`/shop/products/${product.id}`)}
                />
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                  title="Remove from wishlist"
                >
                  <Heart size={20} className="fill-red-500 text-red-500" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3
                  className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => navigate(`/shop/products/${product.id}`)}
                >
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-xl font-bold text-black">{product.price}</p>
                  {product.oldPrice && (
                    <p className="text-sm text-gray-400 line-through">{product.oldPrice}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => navigate(`/shop/products/${product.id}`)}
                    className="flex-1 border border-gray-300 text-gray-900 py-2 rounded-lg hover:border-black transition-colors font-medium text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Shopping Button */}
      {state.items.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Link
            to="/shop"
            className="inline-block border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

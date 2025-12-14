import React from "react";
import { Heart, ShoppingBag, Tag } from "lucide-react";
import StarRating from "./StarRating";
import { useToast } from "../../context/useToastHook";

const ProductCard = ({ 
  product, 
  isInWishlist = false, 
  onWishlistToggle,
  onAddToCart
 }) => {
  const { showToast } = useToast();
  const {
    image,
    brand,
    name,
    price,
    oldPrice,
    rating = 4.5,
    reviewCount = 0,
    discount,
    isNew
  } = product;

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Product Image Container */}
      <div className="relative h-64 bg-gray-50 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              New
            </span>
          )}
          {discount && (
            <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
              onWishlistToggle?.(product);
              if (isInWishlist) {
                showToast(`${product.name} removed from wishlist`, { type: 'info' });
              } else {
                showToast(`${product.name} added to wishlist`, { type: 'success' });
              }
          }}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={20}
            className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Brand */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {brand}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <StarRating 
            rating={rating} 
            totalStars={5} 
            size={16}
          />
          <span className="text-sm text-gray-600 ml-2">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Price Section */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {price}
            </span>
            {oldPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {oldPrice}
                </span>

              </>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => {
            onAddToCart?.(product);
            showToast(`${product.name} added to cart`, { type: 'success' });
          }}
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
        >
          <ShoppingBag size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
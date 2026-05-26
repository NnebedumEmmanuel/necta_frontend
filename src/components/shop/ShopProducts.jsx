import React from "react";
import { Heart, ShoppingBag, Tag } from "lucide-react";
import StarRating from "./StarRating";
import { useToast } from '@/context/ToastProvider';

const ProductCard = ({ 
  product, 
  isInWishlist = false, 
  onWishlistToggle,
  onAddToCart
 }) => {
  const { showToast } = useToast();

  // Simplified data reading: trust the normalized props passed from parent (do not re-calculate)
  // product.rating and product.reviewCount should already be normalized by upstream code
  let rating = Number(product?.rating);
  if (!Number.isFinite(rating)) rating = 0;

  let reviewCount = Number(product?.reviewCount);
  if (!Number.isFinite(reviewCount)) reviewCount = 0;

  const {
    brand,
    name,
    price,
    oldPrice,
    discount,
    isNew
  } = product;

  // Robust Image Getter
  const getValidImage = (prod) => {
    if (!prod) return 'https://placehold.co/400?text=No+Image'
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const first = prod.images[0]
      if (typeof first === 'string') return first
      if (first && typeof first === 'object' && first.url) return first.url
    }
    if (typeof prod.images === 'string') {
      try {
        const parsed = JSON.parse(prod.images)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
      } catch (e) {
        // ignore parse errors
      }
    }
    if (prod.image && typeof prod.image === 'string') return prod.image
    return 'https://placehold.co/400?text=No+Image'
  }

  const displayImage = getValidImage(product)

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      {}
      <div className="relative h-64 bg-gray-50 overflow-hidden">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        
        {}
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

        {}
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

      {}
      <div className="p-5">
        {}
        <div className="mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {brand}
          </span>
        </div>

        {}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">
          {name}
        </h3>

        {}
        <div className="flex items-center mb-4">
          <StarRating 
            rating={rating} 
            totalStars={5} 
            size={16}
          />
          {(typeof rating === 'number' || reviewCount != null) && (
            <span className="text-sm text-gray-600 ml-2">
              {typeof rating === 'number' ? rating.toFixed(1) : ''}
              {reviewCount != null && ` (${reviewCount})`}
            </span>
          )}
        </div>

        {}
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

        {}
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
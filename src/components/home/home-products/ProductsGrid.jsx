import React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastProvider';
import { getProductRating } from '@/lib/productRating';

const ProductGrid = ({ products, toggleWishlist: externalToggleWishlist, wishlistState: externalWishlistState }) => {
  const { wishlist: ctxWishlist, toggleWishlist: ctxToggleWishlist, isInWishlist: ctxIsInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const wishlistState = externalWishlistState || (ctxWishlist ? { items: ctxWishlist } : { items: [] });
  const toggleWishlist = externalToggleWishlist || ctxToggleWishlist;
  const isInWishlistFn = ctxIsInWishlist || ((id) => wishlistState?.items?.some(i => i.id === id));

  const items = Array.isArray(products)
    ? products
    : products?.data ?? products?.items ?? products?.products ?? [];

  // Normalize products before rendering to ensure rating and reviewCount are present
  const normalizedItems = (items || []).map(p => {
    const realRating = Number(p?.rating) || Number(p?.average_rating) || Number(p?.averageRating) || 0;
    // Trust the API-provided rating; do not fabricate a 5.0 fallback
    const finalRating = realRating;

    // Use the API-provided review count (or 0) — do not fabricate a random count
    const apiCount = Number(p?.reviewCount) || Number(p?.review_count) || 0;
    const finalCount = apiCount;

    return {
      ...p,
      rating: finalRating,
      reviewCount: finalCount,
      // Ensure reviews array exists
      reviews: Array.isArray(p?.reviews) ? p.reviews : []
    };
  });

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      quantity: 1
    });
    showToast && showToast(`${product.name} added to cart`, { type: 'success' });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {normalizedItems.map((product) => {
        // Parse images if they are stringified JSON
        let imageList = [];
        try {
          imageList = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        } catch (e) {
          imageList = [];
        }

        // Determine the final display image
        let validImage = 'https://placehold.co/400?text=No+Image';
        if (Array.isArray(imageList) && imageList.length > 0) {
          const first = imageList[0];
          if (typeof first === 'string') validImage = first;
          else if (first && typeof first === 'object' && first.url) validImage = first.url;
        } else if (product.image && typeof product.image === 'string' && product.image.startsWith('http')) {
          validImage = product.image;
        }

        // Ensure price is a number
        const validPrice = Number(product.price) || Number(product.priceValue) || 0;

  const rating = getProductRating(product) || 0;
  const activeStars = Math.floor(rating);
  // Debug output to verify source of rating and reviews
  // eslint-disable-next-line no-console
  console.log("Grid Product:", product.name, "| Rating:", product.rating, "| Reviews:", product.reviews);

  // Use only a real reviews array as the source of truth for the count.
  // If product.reviews is a JSON string (mock/fake data), we ignore it and report 0.
  const reviewCountDisplay = Number(product.reviewCount) || (Array.isArray(product.reviews) ? product.reviews.length : 0);

        return (
          <div key={product.id} className="relative group">
            <Link to={`/shop/products/${product.id}`} className="block">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group">
                <div className="relative h-40 bg-gray-50 overflow-hidden">
                  <img
                    src={validImage}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-3">
                  <div className="mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {product.brand || getBrandFromName(product.name)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 h-10">
                    {product.name}
                  </h3>

                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < activeStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      {rating > 0 ? rating.toFixed(1) : ''}
                      <span className="text-gray-400"> ({reviewCountDisplay})</span>
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        {typeof product.price === 'number' || typeof product.priceValue === 'number' ? (`₦${validPrice.toLocaleString()}`) : product.price || `₦${validPrice.toLocaleString()}`}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.oldPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1 text-xs"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentlyIn = isInWishlistFn(product.id);
                try {
                  if (toggleWishlist) toggleWishlist(product);
                } catch (err) {
                  console.warn('toggleWishlist failed', err);
                }
                if (currentlyIn) {
                  showToast && showToast(`${product.name} removed from wishlist`, { type: 'info' });
                } else {
                  showToast && showToast(`${product.name} added to wishlist`, { type: 'success' });
                }
              }}
              className="absolute top-5 right-5 bg-white rounded-full p-1.5 shadow hover:shadow-md transition-all duration-200 hover:scale-110 z-10"
              type="button"
            >
              <Heart
                size={16}
                className={isInWishlistFn(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function getBrandFromName(name) {
  const brands = ["Apple", "Samsung", "Xiaomi", "Poco", "OPPO", "Honor", "Motorola", "Nokia", "Realme", "Vivo", "Lenovo", "Asus", "LG", "Google", "OnePlus", "Infinix", "Canon", "Sony", "Nikon", "Blackmagic", "Fujifilm", "Panasonic", "Bose", "Beats", "Sennheiser", "JBL", "PlayStation", "Xbox", "Nintendo", "Steam", "Razer", "Logitech"];
  const foundBrand = brands.find(brand => (name || '').toLowerCase().includes(brand.toLowerCase()));
  return foundBrand || "Brand";
}

export default ProductGrid;
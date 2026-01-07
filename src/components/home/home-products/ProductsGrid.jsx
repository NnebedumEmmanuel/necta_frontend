import React from "react";
import { Heart, ShoppingBag, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../../../context/WishlistContext";
import { useCart } from "../../../../context/useCartHook";
import { useToast } from "../../../context/useToastHook";

const ProductGrid = ({ products, toggleWishlist: externalToggleWishlist, wishlistState: externalWishlistState }) => {
  const { state: localWishlistState, toggleWishlist: localToggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  // Use external props if provided, otherwise use local context
  const wishlistState = externalWishlistState || localWishlistState;
  const toggleWishlist = externalToggleWishlist || localToggleWishlist;

  // Normalize incoming `products` prop — backend may return an object like
  // { data: [...], total, limit, skip } or { items: [...] } or a raw array.
  const items = Array.isArray(products)
    ? products
    : products?.data ?? products?.items ?? products?.products ?? [];

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
    showToast(`${product.name} added to cart`, { type: 'success' });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map((product) => {
        const isInWishlist = wishlistState?.items?.some(item => item.id === product.id) || false;
        
        return (
          <div key={product.id} className="relative group">
            <Link to={`/shop/products/${product.id}`} className="block">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group">
                {/* Image Container */}
                <div className="relative h-40 bg-gray-50 overflow-hidden">
                  <img
                    src={product.image || product.images?.[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                  

                </div>

                {/* Product Info */}
                <div className="p-3">
                  {/* Brand */}
                  <div className="mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {product.brand || getBrandFromName(product.name)}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 h-10">
                    {product.name}
                  </h3>

                  {/* Rating - Smaller Stars */}
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating || 4.5)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      {product.rating ? product.rating.toFixed(1) : "4.5"} 
                      <span className="text-gray-400"> ({product.reviewCount || "120"})</span>
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        {product.price}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.oldPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
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
            
            {/* Wishlist Button - Outside Link */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Pass only the product id to the wishlist toggle as required by backend
                toggleWishlist(product.id);
                if (isInWishlist) {
                  showToast(`${product.name} removed from wishlist`, { type: 'info' });
                } else {
                  showToast(`${product.name} added to wishlist`, { type: 'success' });
                }
              }}
              className="absolute top-5 right-5 bg-white rounded-full p-1.5 shadow hover:shadow-md transition-all duration-200 hover:scale-110 z-10"
              type="button"
            >
              <Heart 
                size={16} 
                className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"} 
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to extract brand from name
function getBrandFromName(name) {
  const brands = ["Apple", "Samsung", "Xiaomi", "Poco", "OPPO", "Honor", "Motorola", "Nokia", "Realme", "Vivo", "Lenovo", "Asus", "LG", "Google", "OnePlus", "Infinix", "Canon", "Sony", "Nikon", "Blackmagic", "Fujifilm", "Panasonic", "Bose", "Beats", "Sennheiser", "JBL", "PlayStation", "Xbox", "Nintendo", "Steam", "Razer", "Logitech"];
  const foundBrand = brands.find(brand => name.toLowerCase().includes(brand.toLowerCase()));
  return foundBrand || "Brand";
}

export default ProductGrid;
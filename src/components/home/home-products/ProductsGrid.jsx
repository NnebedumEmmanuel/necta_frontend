import React from "react";
import { Heart } from "lucide-react";

// Remove TypeScript types and use prop destructuring
// You'll need to define your Product type or use the actual data structure
const ProductGrid = ({ products }) => {
  // Mock wishlist context - replace with your actual context
  const wishlistState = { items: [] };
  const wishlistDispatch = () => {}; // Replace with actual dispatch

  const toggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (wishlistState.items.some(item => item.id === product.id)) {
      wishlistDispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
    } else {
      wishlistDispatch({ type: 'ADD_TO_WISHLIST', payload: product });
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const isInWishlist = wishlistState.items.some(item => item.id === product.id);
        
        return (
          <a key={product.id} href={`/shop/products/${product.id}`}>
            <div className="border border-gray-200 rounded-lg p-4 relative text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-[#F6F6F6]">
              <img
                src={product.image}
                alt={product.name}
                width={200}
                height={160}
                className="w-full h-40 object-contain mb-4 mx-auto"
              />
              <h3 className="text-sm font-medium mb-2 line-clamp-2 h-10 overflow-hidden">
                {product.name}
              </h3>
              <p className="text-lg font-semibold mb-3 text-gray-900">
                {product.price}
              </p>
              <button className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition-colors w-full">
                Buy Now
              </button>
              <div className="absolute top-3 right-3">
                <button 
                  onClick={(e) => toggleWishlist(product, e)}
                  className="p-1 hover:scale-110 transition-transform bg-white rounded-full shadow-md"
                >
                  <Heart 
                    size={20} 
                    className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"} 
                  />
                </button>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default ProductGrid;
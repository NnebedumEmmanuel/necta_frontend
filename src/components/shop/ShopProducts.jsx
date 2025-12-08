import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const ProductGrid = ({ products, wishlistState, toggleWishlist }) => {
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
        const isInWishlist = wishlistState?.items?.some(item => item.id === product.id) || false;
        
        return (
          <Link key={product.id} to={`/shop/products/${product.id}`} className="block">
            <div className="border border-gray-200 rounded-lg p-4 relative text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-[#F6F6F6]">
              <img
                src={product.image}
                alt={product.name}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="p-1 hover:scale-110 transition-transform bg-white rounded-full shadow-md"
                >
                  <Heart 
                    size={20} 
                    className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"} 
                  />
                </button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductGrid;
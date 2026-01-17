import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "../../../../context/WishlistContext";
import { useToast } from "../../../context/useToastHook";
import { productService } from '../../../../services/productService';

const RelatedProducts = () => {
  const [products, setProducts] = useState([]);
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const { showToast } = useToast();

  const { id } = useParams();

  useEffect(() => {
    let mounted = true;
    if (!id) return () => { mounted = false };

    productService.getRelated(id, 8)
      .then((res) => {
        if (!mounted) return;
        const items = res?.products ?? [];
        setProducts(items);
      })
      .catch((err) => console.error('Failed to load related products', err));

    return () => { mounted = false };
  }, [id]);

  const toggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistState.items.some((item) => item.id === product.id)) {
      wishlistDispatch({ type: "REMOVE_FROM_WISHLIST", payload: product.id });
      showToast(`${product.name} removed from wishlist`, { type: 'info' });
    } else {
      wishlistDispatch({ type: "ADD_TO_WISHLIST", payload: product });
      showToast(`${product.name} added to wishlist`, { type: 'success' });
    }
  };

  // Hide the related carousel completely when there are no related items.
  if (!products || products.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 py-10">
      <h2 className="text-lg sm:text-xl font-semibold mb-6 text-left">
        Related Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => {
          const isInWishlist = wishlistState.items.some(
            (item) => item.id === product.id
          );

          return (
            <div
              key={product.id}
              className="bg-[#F6F6F6] p-3 sm:p-4 rounded-lg border relative text-center hover:shadow-lg transition-shadow duration-200"
            >
              <a href={`/shop/products/${product.id}`}>
                <div className="cursor-pointer">
                  <img
                    src={product.image || product.images?.[0]?.url}
                    alt={product.name}
                    className="w-full h-32 sm:h-40 object-contain mb-3 sm:mb-4 mx-auto"
                  />
                  <h3 className="text-xs sm:text-sm font-medium mb-2 line-clamp-2 h-8 sm:h-10 overflow-hidden">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {product.price}
                    </p>
                    {product.oldPrice && (
                      <p className="text-gray-400 line-through text-xs sm:text-sm">
                        {product.oldPrice}
                      </p>
                    )}
                  </div>
                </div>
              </a>

              <a href={`/shop/products/${product.id}`}>
                <button className="w-full bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded hover:bg-gray-800 transition-colors">
                  Buy Now
                </button>
              </a>

              <button
                onClick={(e) => toggleWishlist(product, e)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 hover:scale-110 transition-transform"
              >
                <Heart
                  size={18}
                  className={
                    isInWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400 hover:text-red-500"
                  }
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;
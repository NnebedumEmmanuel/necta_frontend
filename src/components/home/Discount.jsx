import React from 'react';
import { useNavigate } from 'react-router-dom';

const DiscountPage = () => {
  const navigate = useNavigate();
  
  const speakers = [
    {
      id: 1,
      name: "T&G TG659 Trending High Quality Audio",
      image: "/public/img1.jpg",
      originalPrice: "₦10,000.00",
      discountedPrice: "₦7,500.00",
      rating: 5,
      reviewCount: 239,
      badge: "New"
    },
    {
      id: 2,
      name: "T&G TG691 Bluetooth Speaker Outdoor",
      image: "/public/img2.jpg",
      originalPrice: "₦8,500",
      discountedPrice: null,
      rating: 5,
      reviewCount: 131,
      badge: null
    },
    {
      id: 3,
      name: "T&G TG689 Bluetooth Speaker Outdoor",
      image: "/public/img3.jpg",
      originalPrice: "₦12,000",
      discountedPrice: "₦6,800",
      rating: 5,
      reviewCount: 27,
      badge: "New"
    },
    {
      id: 4,
      name: "T&G TG-676 Wireless Portable Stereo Woofer",
      image: "/public/img4.jpg",
      originalPrice: "₦43,000",
      discountedPrice: "₦35,000",
      rating: 5,
      reviewCount: 269,
      badge: "New"
    }
  ];

  const handleViewDetails = (productId, e) => {
    e.stopPropagation();
    window.scrollTo(0, 0); // Scroll to top before navigation
    navigate(`/shop/products/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    console.log("Add to cart:", product);
    // Add to cart logic here
  };

  const handleProductClick = (product) => {
    window.scrollTo(0, 0); // Scroll to top before navigation
    navigate(`/shop/products/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-16">
      
      {/* Header */}
      <div className="mb-8 pl-1">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Premium Audio Collection
        </h1>
        <p className="text-gray-600">Limited time offers on trending speakers</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            onClick={() => handleProductClick(speaker)}
            className="
              group relative bg-white rounded-2xl overflow-hidden 
              border border-gray-100 shadow-lg hover:shadow-2xl
              transition-all duration-300 hover:-translate-y-2
              flex flex-col h-full cursor-pointer
            "
          >
            {/* Badge */}
            {speaker.badge && (
              <div className="absolute top-3 left-3 z-20">
                <span className="
                  inline-flex items-center px-3 py-1 rounded-full 
                  text-xs font-bold uppercase tracking-wide
                  bg-gradient-to-r from-emerald-500 to-green-500 text-white
                  shadow-lg shadow-green-200/50
                ">
                  {speaker.badge}
                </span>
              </div>
            )}

            {/* Discount Ribbon */}
            {speaker.discountedPrice && (
              <div className="absolute top-3 right-3 z-20">
                <div className="
                  bg-gradient-to-r from-orange-500 to-red-500 text-white 
                  px-3 py-1 rounded-lg text-sm font-bold
                  shadow-lg shadow-red-200/50
                  transform -rotate-3
                ">
                  SALE
                </div>
              </div>
            )}

            {/* Image */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-56">
              <img
                src={speaker.image}
                alt={speaker.name}
                className="
                  w-full h-full object-cover
                  transition-transform duration-500 
                  group-hover:scale-110
                "
              />
            </div>

            {/* Content */}
            <div className="p-5 flex-grow flex flex-col">
              <h3 className="
                text-lg font-bold text-gray-900 mb-3 
                line-clamp-2
              ">
                {speaker.name}
              </h3>

              {/* Price Section */}
              <div className="mb-3 transition-opacity duration-300 group-hover:opacity-0">
                {speaker.discountedPrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-sm">
                      {speaker.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {speaker.discountedPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {speaker.originalPrice}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 transition-opacity duration-300 group-hover:opacity-0">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">
                      {i < speaker.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-gray-500 text-sm">
                  ({speaker.reviewCount})
                </span>
              </div>

              {/* Buttons */}
              <div className="
                mt-auto opacity-0 group-hover:opacity-100 
                translate-y-3 group-hover:translate-y-0
                transition-all duration-300
              ">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleViewDetails(speaker.id, e)}
                    className="
                      flex-1 py-2 text-sm font-semibold rounded-lg
                      border border-gray-200 text-gray-700
                      hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900
                      active:scale-95 transition-all duration-200
                    "
                  >
                    Details
                  </button>
                  
                  <button 
                    onClick={(e) => handleAddToCart(speaker, e)}
                    className="
                      flex-1 py-2 text-sm font-semibold rounded-lg
                      bg-gradient-to-r from-orange-500 to-red-500 text-white
                      hover:from-orange-600 hover:to-red-600
                      active:scale-95 transition-all duration-200
                      shadow-md shadow-orange-200 hover:shadow-orange-300
                    "
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountPage;
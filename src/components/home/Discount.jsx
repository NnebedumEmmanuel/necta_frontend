import React from 'react';

const DiscountPage = () => {
  const speakers = [
    {
      id: 1,
      name: "T&G TG659 Trending High Quality Audio",
      image: "/public/img1.jpg",
      description: "El JBL PartyBox Music Player Extreme Wireless Radio Speaker Popular Sound...",
      originalPrice: "₦1,0000.00",
      discountedPrice: "₦7,500.00",
      rating: 5,
      reviewCount: 239,
      installmentText: "Hasta 6 cuotas sin interés",
      badge: "New"
    },
    {
      id: 2,
      name: "T&G TG691 Blue Tooth Speaker Outdoor",
      image: "/public/img2.jpg",
      description: "Portable Card FM Radio BT TWS Fabric Heavy Subwoofer...",
      originalPrice: "₦8,500",
      discountedPrice: null,
      rating: 5,
      reviewCount: 131,
      installmentText: "Hasta 6 cuotas sin interés",
      badge: null
    },
    {
      id: 3,
      name: "T&G TG689 Bluetooth Speaker Outdoor ",
      image: "/public/img3.jpg",
      description: "Portable Card FM Radio BT TWS Fabric Heavy Subwoofer...",
      originalPrice: "₦12,000",
      discountedPrice: "₦6,800",
      rating: 5,
      reviewCount: 27,
      installmentText: "Hasta 6 cuotas sin interés",
      badge: "New"
    },
    {
      id: 4,
      name: "T&G TG-676 Wireless Portable Stereo Woofer",
      image: "/public/img4.jpg",
      description: "IPX5 Waterproof Speaker HIFI Active Bass Outdoor Party...",
      originalPrice: "₦43,000",
      discountedPrice: "₦35,000",
      rating: 5,
      reviewCount: 269,
      installmentText: "Hasta 6 cuotas sin interés",
      badge: "New"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* All Speakers List */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="
                group relative bg-white rounded-xl shadow-lg overflow-hidden 
                border border-gray-200 transition-all duration-300 
                hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1
              "
            >

              {/* Badge */}
              {speaker.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    speaker.badge === "New" 
                      ? "bg-green-100 text-green-600" 
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {speaker.badge}
                  </span>
                </div>
              )}

              {/* Image */}
              <div className="w-full h-48 bg-gray-100">
                <img
                  src={speaker.image}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text */}
              <div className="p-6">

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {speaker.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {speaker.description}
                </p>

                {/* ------------------- PRICE SECTION ------------------- */}
                <div className="mb-4 transition-all duration-300 group-hover:opacity-0">
                  {speaker.discountedPrice ? (
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-gray-400 line-through">
                        {speaker.originalPrice}
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {speaker.discountedPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {speaker.originalPrice}
                    </span>
                  )}
                </div>

                <p className="text-green-600 font-semibold text-sm mb-3">
                  {speaker.installmentText}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {"★".repeat(speaker.rating)}
                    {"☆".repeat(5 - speaker.rating)}
                  </div>
                  <span className="text-gray-500 text-sm">
                    ({speaker.reviewCount})
                  </span>
                </div>

                {/* ------------------- BUTTONS SIDE-BY-SIDE ------------------- */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    
                    {/* Learn More Button */}
                    <button className="
                      w-1/2 py-2 text-sm font-semibold
                      border border-gray-300 rounded-xl
                      hover:bg-gray-100 transition
                    ">
                      Learn More
                    </button>

                    {/* Add to Cart Button */}
                    <button className="
                      w-1/2 py-2 text-sm font-semibold
                      rounded-xl bg-orange-500 text-white
                      hover:bg-orange-600 transition
                    ">
                      Add to Cart
                    </button>

                  </div>
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default DiscountPage;

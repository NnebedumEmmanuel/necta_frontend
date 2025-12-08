import React from "react";

export default function BrowseByCategory() {
  const categories = [
    { name: "Phones", icon: "/icons/Phones2.png" },
    { name: "SmartWatches", icon: "/icons/Smart Watches2.png" },
    { name: "Cameras", icon: "/icons/Cameras2.png" },
    { name: "Headphones", icon: "/icons/Headphones2.png" },
    { name: "Computers", icon: "/icons/Computers2.png" },
    { name: "Gaming", icon: "/icons/Gaming2.png" },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Browse By Category</h2>

          <div className="flex gap-4">
            <button
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Previous categories"
              title="Previous categories"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Next categories"
              title="Next categories"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <a
              href={`/shop?category=${encodeURIComponent(category.name.toLowerCase())}`}
              key={index}
              className="flex flex-col items-center justify-center p-6 border bg-[#EDEDED] border-gray-200 [border-radius:6px] hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-black"
              aria-label={`Browse ${category.name}`}
            >
              <div className="relative w-12 h-12 mb-3 group-hover:scale-110 transition-transform duration-200">
                <img
                  src={category.icon}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>

              <h3 className="text-lg font-medium text-center">{category.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

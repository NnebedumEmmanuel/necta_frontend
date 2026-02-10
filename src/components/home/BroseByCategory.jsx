import React from "react";
import { 
  Smartphone,
  Speaker,
  Sun,
  Zap,
  Tv,
  Headphones
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BrowseByCategory() {
  const categories = [
    { 
      name: "Phones", 
      icon: <Smartphone size={40} className="text-gray-600" />,
      available: false 
    },
    { 
      name: "Speakers", 
      icon: <Speaker size={40} className="text-gray-600" />,
      available: true 
    },
    { 
      name: "Solar", 
      icon: <Sun size={40} className="text-gray-600" />,
      available: false 
    },
    { 
      name: "Inverter", 
      icon: <Zap size={40} className="text-gray-600" />,
      available: false 
    },
    { 
      name: "TV", 
      icon: <Tv size={40} className="text-gray-600" />,
      available: false 
    },
    { 
      name: "Headphones", 
      icon: <Headphones size={40} className="text-gray-600" />,
      available: false 
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {}
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

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category, index) => (
            <Link
              to={`/shop?category=${encodeURIComponent(category.name.toLowerCase())}`}
              key={index}
              className={`flex flex-col items-center justify-center p-6 border ${
                category.available 
                  ? "bg-[#EDEDED] hover:bg-gray-100 cursor-pointer" 
                  : "bg-gray-50 opacity-60 cursor-not-allowed"
              } border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-black`}
              aria-label={`Browse ${category.name}`}
              onClick={(e) => {
                if (!category.available) {
                  e.preventDefault();
                }
              }}
            >
              <div className="relative w-full aspect-square mb-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {category.icon}
              </div>

              <div className="text-center">
                <h3 className="text-xs font-medium mb-1">{category.name}</h3>
                <span className={`text-[10px] px-2 py-1 rounded ${
                  category.available 
                    ? "text-gray-500 bg-gray-100" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {category.available ? "Available" : "Coming Soon"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
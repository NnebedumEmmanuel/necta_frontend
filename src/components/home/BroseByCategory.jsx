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
  // Hard-coded 4 categories (keeps layout predictable)
  const categories = [
    { name: 'Speakers', image: '/px4.png' },
    { name: 'Watches', image: '/px5.png' },
    { name: 'Laptops', image: '/px6.png' },
    { name: 'Controllers', image: '/px7.png' },
  ]

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
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          {categories.map((category, index) => (
            <Link
              to={`/shop?category=${encodeURIComponent(category.name.toLowerCase())}`}
              key={index}
              className="block"
            >
              <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
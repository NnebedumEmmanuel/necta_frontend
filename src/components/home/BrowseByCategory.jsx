import React from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, Speaker, Sun, Zap, Tv, Headphones } from 'lucide-react'

export default function BrowseByCategory() {
  const categories = [
    { name: 'Phones', icon: <Smartphone size={40} className="text-gray-600" />, available: false },
    { name: 'Speakers', icon: <Speaker size={40} className="text-gray-600" />, available: true },
    { name: 'Solar', icon: <Sun size={40} className="text-gray-600" />, available: false },
    { name: 'Inverter', icon: <Zap size={40} className="text-gray-600" />, available: false },
    { name: 'TV', icon: <Tv size={40} className="text-gray-600" />, available: false },
    { name: 'Headphones', icon: <Headphones size={40} className="text-gray-600" />, available: false },
  ]

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Browse By Category</h2>
        </div>

        {/* THE GRID: Forced 2 columns on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              to={category.available ? `/shop?category=${encodeURIComponent(category.name.toLowerCase())}` : '#'}
              key={index}
              onClick={(e) => !category.available && e.preventDefault()}
              className={`flex flex-col items-center justify-center p-6 border rounded-lg transition-all duration-200 group
                ${category.available
                  ? 'bg-white border-gray-200 hover:border-black hover:shadow-md cursor-pointer'
                  : 'bg-gray-50 border-gray-100 opacity-70 cursor-not-allowed'}
              `}
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-200">
                {category.icon}
              </div>

              <h3 className="text-sm font-medium mb-2">{category.name}</h3>

              <span
                className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                  category.available ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {category.available ? 'Available' : 'Coming Soon'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

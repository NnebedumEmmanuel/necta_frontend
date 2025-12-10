import React, { useState } from "react";
import { ChevronDown, ChevronUp, Grid } from "lucide-react";
import { Link } from "react-router-dom";

const ShopByCategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(true); // Open by default

  const categories = [
    { name: "Smartphones", count: 156, href: "/shop?category=phones" },
    { name: "Laptops & Computers", count: 89, href: "/shop?category=computers" },
    { name: "Smart Watches", count: 42, href: "/shop?category=smartwatches" },
    { name: "Cameras", count: 31, href: "/shop?category=cameras" },
    { name: "Headphones", count: 67, href: "/shop?category=headphones" },
    { name: "Gaming", count: 54, href: "/shop?category=gaming" },
    { name: "Home Appliances", count: 78, href: "/shop?category=home" },
    { name: "Accessories", count: 123, href: "/shop?category=accessories" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Grid size={18} className="text-purple-500" />
          <span className="font-semibold text-gray-900">Shop by Category</span>
        </div>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={18} />
        ) : (
          <ChevronDown className="text-gray-500" size={18} />
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="border-t">
          <div className="p-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-black">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopByCategoryDropdown;
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Grid } from "lucide-react";
import { Link } from "react-router-dom";

const ShopByCategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(true);

  const categories = [
    { name: "Speakers", href: "/shop?category=speakers", available: true },
    { name: "Smartphones", href: "/shop?category=phones", available: false },
    { name: "Solar Products", href: "/shop?category=solar", available: false },
    { name: "Inverters", href: "/shop?category=inverter", available: false },
    { name: "Televisions", href: "/shop?category=tv", available: false },
    { name: "Headphones", href: "/shop?category=headphones", available: false },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Grid size={18} className="text-gray-600" />
          <span className="font-semibold text-gray-900">Shop by Category</span>
        </div>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={18} />
        ) : (
          <ChevronDown className="text-gray-500" size={18} />
        )}
      </button>

      {}
      {isOpen && (
        <div className="border-t">
          <div className="p-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className={`flex items-center justify-between p-2 rounded transition-colors group ${
                  category.available 
                    ? "hover:bg-gray-50" 
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    category.available 
                      ? "text-gray-700 group-hover:text-black" 
                      : "text-gray-500"
                  }`}>
                    {category.name}
                  </span>
                </div>
                {!category.available && (
                  <span className={`text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800`}>
                    Coming Soon
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopByCategoryDropdown;
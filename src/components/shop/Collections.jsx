import React, { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, Star, Zap, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const CollectionsDropdown = () => {
  const [isOpen, setIsOpen] = useState(true); // Open by default

  const collections = [
    { 
      name: "Trending Now", 
      count: 4, 
      href: "/shop?collection=trending",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    { 
      name: "Best Sellers", 
      count: 4, 
      href: "/shop?collection=bestsellers",
      icon: Star,
      color: "text-yellow-600"
    },
    { 
      name: "New Releases", 
      count: 4, 
      href: "/shop?collection=new",
      icon: Zap,
      color: "text-green-600"
    },
    { 
      name: "Deals & Offers", 
      count: 1, 
      href: "/shop?collection=deals",
      icon: Tag,
      color: "text-red-600"
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">Collections</span>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={18} />
        ) : (
          <ChevronDown className="text-gray-500" size={18} />
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="border-t">
          <div className="p-2">
            {collections.map((collection) => {
              const Icon = collection.icon;
              return (
                <Link
                  key={collection.name}
                  to={collection.href}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={collection.color} />
                    <span className="text-sm text-gray-700 group-hover:text-black">
                      {collection.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {collection.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsDropdown;
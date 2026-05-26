import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Grid } from "lucide-react";
import { Link } from "react-router-dom";
import { publicApi as api } from "@/lib/api";

const fallbackCategories = [
  { name: "Phones", slug: "phones", isComingSoon: true },
  { name: "Speakers", slug: "speakers", isComingSoon: false },
  { name: "Solar", slug: "solar", isComingSoon: true },
  { name: "Inverter", slug: "inverter", isComingSoon: true },
  { name: "TV", slug: "tv", isComingSoon: true },
  { name: "Headphones", slug: "headphones", isComingSoon: true },
];

const ShopByCategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    let mounted = true;

    api.get("/categories")
      .then((res) => {
        const data = res?.data;
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
          ? data.categories
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (mounted && rows.length) setCategories(rows);
      })
      .catch((error) => {
        console.error("Failed to load shop categories", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
            {categories.map((category) => {
              const slug = category.slug || category.name?.toLowerCase();
              const available = !category.isComingSoon;

              return (
                <Link
                  key={slug || category.name}
                  to={`/shop?category=${encodeURIComponent(slug)}`}
                  className={`flex items-center justify-between p-2 rounded transition-colors group ${
                    available ? "hover:bg-gray-50" : "opacity-70 hover:bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      available
                        ? "text-gray-700 group-hover:text-black"
                        : "text-gray-500"
                    }`}>
                      {category.name}
                    </span>
                  </div>
                  {!available && (
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                      Coming Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopByCategoryDropdown;

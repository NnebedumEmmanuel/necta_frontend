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
  const [categories, setCategories] = useState([]);

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

        if (mounted) setCategories(rows.length ? rows : fallbackCategories);
      })
      .catch((error) => {
        console.error("Failed to load shop categories", error);
        if (mounted) setCategories(fallbackCategories);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sortedCategories = [...categories].sort((a, b) => {
    const aSoon = a.isComingSoon || false;
    const bSoon = b.isComingSoon || false;
    if (aSoon === bSoon) return 0;
    return aSoon ? 1 : -1;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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

      {isOpen && (
        <div className="border-t">
          <div className="p-2 max-h-60 overflow-y-auto">
            {sortedCategories.map((category) => {
              const slug = category.slug || category.name?.toLowerCase();
              const isComingSoon = category.isComingSoon;
              const href = isComingSoon 
                  ? `/coming-soon?category=${encodeURIComponent(category.name)}` 
                  : `/shop?category=${encodeURIComponent(slug)}`;

              return (
                <Link
                  key={slug || category.name}
                  to={href}
                  className={`flex items-center justify-between p-2 rounded transition-colors group ${
                    !isComingSoon ? "hover:bg-gray-50" : "opacity-70 hover:bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      !isComingSoon
                        ? "text-gray-700 font-medium group-hover:text-black"
                        : "text-gray-500 font-normal"
                    }`}>
                      {category.name}
                    </span>
                  </div>
                  {isComingSoon && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">
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
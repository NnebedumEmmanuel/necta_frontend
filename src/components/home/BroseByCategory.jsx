import React, { useEffect, useState } from "react";
import { 
  Smartphone,
  Speaker,
  Sun,
  Zap,
  Tv,
  Headphones
} from "lucide-react";
import { Link } from "react-router-dom";
import { publicApi as api } from "@/lib/api";

const iconBySlug = {
  phones: Smartphone,
  speakers: Speaker,
  solar: Sun,
  inverter: Zap,
  tv: Tv,
  headphones: Headphones,
};

const fallbackCategories = [
  { name: "Phones", slug: "phones", isComingSoon: true },
  { name: "Speakers", slug: "speakers", isComingSoon: false },
  { name: "Solar", slug: "solar", isComingSoon: true },
  { name: "Inverter", slug: "inverter", isComingSoon: true },
  { name: "TV", slug: "tv", isComingSoon: true },
  { name: "Headphones", slug: "headphones", isComingSoon: true },
];

export default function BrowseByCategory() {
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
        console.error("Failed to load categories", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1728px]">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">Browse By Category</h2>

          <div className="flex gap-4">
            <button
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-black transition-colors duration-200 hover:bg-gray-100 sm:h-14 sm:w-14"
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
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-black transition-colors duration-200 hover:bg-gray-100 sm:h-14 sm:w-14"
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {categories.map((category) => {
            const slug = category.slug || category.label || category.name?.toLowerCase();
            const available = !category.isComingSoon;
            const Icon = iconBySlug[slug] || Speaker;

            return (
            <Link
              to={`/shop?category=${encodeURIComponent(slug)}`}
              key={slug || category.name}
              className={`group flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-gray-200 text-center transition-all duration-200 ${
                available
                  ? "bg-[#eeeeee] text-black hover:-translate-y-1 hover:shadow-lg"
                  : "bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon
                size={46}
                strokeWidth={1.8}
                className={available ? "mb-10 text-gray-700" : "mb-10 text-gray-400"}
              />
              <h3 className={`text-xl font-bold ${available ? "text-black" : "text-gray-600"}`}>
                {category.name}
              </h3>
              <div
                className={`mt-4 rounded-md px-3 py-1 text-sm ${
                  available
                    ? "bg-white/70 text-gray-600"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {available ? "Available" : "Coming Soon"}
              </div>
            </Link>
            )
          })}
        </div>
      </div>
    </section>
  );
}

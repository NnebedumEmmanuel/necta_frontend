import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Grid, Tag, Award, Loader } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from '@/lib/api';

const FilterSection = ({ title, icon: Icon, items, type, loading, currentParam }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-gray-600" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="border-t">
          <div className="p-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <Loader className="animate-spin mx-auto text-slate-400" size={20} />
              </div>
            ) : items.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No {title.toLowerCase()} found</p>
            ) : (
              items.map((item) => {
                const isActive = currentParam === item.slug;
                return (
                <Link
                    key={item._id || item.id}
                    to={!item.isComingSoon ? `/shop?${type}=${item.slug}` : "#"}
                    onClick={(e) => item.isComingSoon && e.preventDefault()}
                    className={`flex items-center justify-between p-2.5 mb-1 rounded-r-lg transition-all duration-200 group ${
                      !item.isComingSoon 
                        ? isActive 
                            ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600 font-bold shadow-sm" // 🚨 NECTA ORANGE BRANDING
                            : "hover:bg-orange-50/50 text-slate-600 border-l-4 border-transparent font-medium" 
                        : "opacity-50 cursor-not-allowed border-l-4 border-transparent"
                    }`}
                  >
                    <span className={`${isActive ? "text-orange-700" : "group-hover:text-orange-600"}`}>
                      {item.name}
                    </span>
                    {item.isComingSoon && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                       Coming Soon
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ShopByCategoryDropdown = () => {
  const [searchParams] = useSearchParams();
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllFilters = async () => {
      try {
        // Fire all 3 requests at the exact same time for speed
        const [catRes, brandRes, colRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/brands').catch(() => ({ data: [] })),
          api.get('/collections').catch(() => ({ data: [] }))
        ]);

        setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []));
        setBrands(Array.isArray(brandRes.data) ? brandRes.data : (brandRes.data?.data || []));
        setCollections(Array.isArray(colRes.data) ? colRes.data : (colRes.data?.data || []));
      } catch (err) {
        console.error("Failed to fetch store tags", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllFilters();
  }, []);

  return (
    <div className="space-y-4">
      <FilterSection 
        title="Categories" 
        icon={Grid} 
        items={categories} 
        type="category" 
        loading={loading}
        currentParam={searchParams.get('category')}
      />
      <FilterSection 
        title="Brands" 
        icon={Award} 
        items={brands} 
        type="brand" 
        loading={loading}
        currentParam={searchParams.get('brand')}
      />
      <FilterSection 
        title="Collections" 
        icon={Tag} 
        items={collections} 
        type="collection" 
        loading={loading}
        currentParam={searchParams.get('collection')}
      />
    </div>
  );
};

export default ShopByCategoryDropdown;
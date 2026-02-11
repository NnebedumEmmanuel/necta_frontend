import React, { useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useWishlist } from '@/context/SafeWishlistContext';
import { Filter } from "lucide-react";
import RatingFilter from "../../components/shop/RatingsFilter";
import PriceFilter from "../../components/shop/PriceFilter";
import ShopByCategoryDropdown from "../../components/shop/ShopByCategory";
import CollectionsDropdown from "../../components/shop/Collections";
import BrandFilter from "../../components/shop/BrandFilter";
import CategoryFilter from "../../components/shop/CategoryFilter";
import { productService } from "../../../services/productService";
import Pagination from "../../components/shop/Pagination";
import ProductGrid from "../../components/home/home-products/ProductsGrid";
import { getProductRating } from '@/lib/productRating';
import { Link } from "react-router-dom";
import ComingSoon from "../../components/shop/ComingSoon";

function getBrandFromName(name) {
  const brands = ["T&G", "JBL", "Sony", "Bose", "Amazon", "Yamaha", "Klipsch", "Anker", "Samsung"];
  const foundBrand = brands.find(brand => name.toLowerCase().includes(brand.toLowerCase()));
  return foundBrand || "T&G";
}

function getMemoryFromProduct() {
  return "N/A";
}

function parsePrice(price) {
  const numericPrice = parseInt(price.replace(/[^\d]/g, '')) || 0;
  return numericPrice;
}

// Ratings and review counts should come from the backend (no client-side fakes)

function ShopContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const category = searchParams.get("category") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("search") || "";
  const itemsPerPage = 8;

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const collectionParam = searchParams.get('collection') || null;

  const { state: wishlistState, toggleWishlist } = useWishlist();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [sortOption, setSortOption] = useState("rating");

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 200000,
    rating: 0,
    brands: [],
    categories: [],
    collections: [],
  });

  // Local min/max state to drive UI and client-side filtering
  const [minPrice, setMinPrice] = useState(filters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || 200000);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 200000]);

  React.useEffect(() => {
    if (collectionParam) {
      setFilters(prev => ({ ...prev, collections: [collectionParam] }));
    }
    // no async work here, but provide a cleanup for consistency
    return () => { /* cleanup: nothing to cancel here */ };
  }, [collectionParam]);

  const availableBrands = useMemo(() => {
    const set = new Set();
    (products || []).forEach(p => { if (p.brand) set.add(p.brand); });
    return Array.from(set).sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const set = new Set();
    (products || []).forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set).sort();
  }, [products]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const activeFilterCount = (
    (filters.brands?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.collections?.length || 0) +
    ((filters.rating || 0) > 0 ? 1 : 0) +
    ((filters.minPrice || 0) > 0 || (filters.maxPrice || 0) < 200000 ? 1 : 0)
  );

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const getBaseProducts = useCallback(() => {
    const lower = category.toLowerCase();
    switch (lower) {
      case "newarrivals":
        return products.filter(p => (p.tags || []).includes('new')) || products.slice(0, itemsPerPage);
      case "bestsellers":
        return products.filter(p => (p.tags || []).includes('bestseller')) || products.slice(itemsPerPage, itemsPerPage*2);
      case "featured":
        return products.filter(p => (p.tags || []).includes('featured')) || products.slice(itemsPerPage*2, itemsPerPage*3);
      case "phones":
      case "solar":
      case "inverter":
      case "tv":
      case "headphones":
        return [];
      case "speakers":
        return products.filter(p => p.category === "speakers");
      case "all":
      default:
        return products;
    }
  }, [category]);

  const getDisplayCategory = () => {
    switch (category.toLowerCase()) {
      case "newarrivals": return "New Arrivals";
      case "bestsellers": return "Bestsellers";
      case "featured": return "Featured";
      case "phones": return "Smartphones";
      case "speakers": return "Speakers";
      case "solar": return "Solar Products";
      case "inverter": return "Inverters";
      case "tv": return "Televisions";
      case "headphones": return "Headphones";
      default: return searchQuery ? `Search: "${searchQuery}"` : "All Products";
    }
  };

  const isComingSoonCategory = () => {
    const comingSoonCategories = ["phones", "solar", "inverter", "tv", "headphones"];
    return comingSoonCategories.includes(category.toLowerCase());
  };

  const [mobileSearchQuery, setMobileSearchQuery] = useState(searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    // Normalize input: trim and collapse multiple spaces to improve backend matching
    const query = String(mobileSearchQuery || '').trim().replace(/\s+/g, ' ');
    if (query) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', query);
      params.delete('page');
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // IMPORTANT: Do not perform client-side filtering here - server response is expected to be already
  // filtered/paginated according to query params. Returning the raw product list prevents double-filtering
  // which breaks pagination and search results.
  const filteredProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  const sortedAndFilteredProducts = useMemo(() => {
    const items = [...(filteredProducts || [])];

    switch (sortOption) {
      case "price":
        return items.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
      case "price-desc":
        return items.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
      case "name":
        return items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case "rating":
      default:
        return items.sort((a, b) => (getProductRating(b) || 0) - (getProductRating(a) || 0));
    }
  }, [filteredProducts, sortOption]);

  const clearAllFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 200000,
      rating: 0,
      brands: [],
      categories: [],
      collections: [],
    });
    // reset local price state too
    setMinPrice(0);
    setMaxPrice(200000);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  React.useEffect(() => {
    let mounted = true;
    setLoadingProducts(true);
    setProductsError(null);

    const fetchProducts = async () => {
      try {
        const rawFilterPayload = {
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          rating: filters.rating,
          brands: filters.brands,
          categories: (filters.categories && filters.categories.length > 0) ? filters.categories : (category !== 'all' ? [category] : []),
          collections: filters.collections,
          q: searchQuery,
        };

        // Strip empty arrays / empty values before sending request
        const filterPayload = Object.fromEntries(Object.entries(rawFilterPayload).filter(([k, v]) => {
          if (v == null) return false
          if (Array.isArray(v)) return v.length > 0
          if (typeof v === 'string') return String(v).trim() !== ''
          return true
        }))

  console.log("FETCH PARAMS", filterPayload);

  const res = await productService.getProducts({ limit: itemsPerPage, page, filters: filterPayload });

        // Debug: surface API response and normalized summary for migration verification
        try {
          // eslint-disable-next-line no-console
          console.debug('[shop page] products response', res);
          // eslint-disable-next-line no-console
          console.debug('[shop page] normalized', { products: (res?.products ?? []).length, total: res?.total ?? null, requestedPage: page });
        } catch (e) {}

        if (!mounted) return;

        // Prefer the normalized shape from productService and normalize rating/review fields
        const items = res?.products ?? [];
        const enhanced = items.map(product => ({
          ...product,
          // Category & Brand normalization
          category: product.category || (product.categories?.name ?? 'speakers'),
          brand: product.brand || getBrandFromName(product.name || ''),

          // Price normalization
          priceValue: parsePrice(String(product.price || '0')),

          // Hunt for rating in multiple possible fields (server may use different names)
          rating: Number(product.rating) || Number(product.average_rating) || Number(product.averageRating) || 0,

          // Review count: prefer explicit counts, fall back to reviews array length
          reviewCount: Number(product.reviewCount) || Number(product.review_count) || (Array.isArray(product.reviews) ? product.reviews.length : 0),

          // Pass through reviews array only when it's a real array (avoids JSON-string mock data)
          reviews: Array.isArray(product.reviews) ? product.reviews : [],
        }));

        // FORCE FIX: Manually check every product again before saving to state
        const robustProducts = enhanced.map(p => {
          // 1. Find the rating (check all possible spellings)
          const realRating = Number(p.rating) || Number(p.average_rating) || Number(p.averageRating) || 0;

          // Use the real rating coming from the service (do not force a 5.0 fallback)
          const finalRating = realRating;

          // 2. Get Count: Use API value only (do not fabricate a random count)
          const apiCount = Number(p.reviewCount) || Number(p.review_count) || 0;
          const finalCount = apiCount;

          return {
            ...p,
            rating: finalRating,
            // Ensure reviews is an array
            reviews: Array.isArray(p.reviews) ? p.reviews : [],
            // Use the API-provided count (or 0 if absent)
            reviewCount: finalCount
          };
        });

        // visible verification (development-only)
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV !== 'production') console.log('SHOPPAGE normalized sample:', robustProducts[0]?.id, robustProducts[0]?.rating, robustProducts[0]?.reviewCount);

        setProducts(robustProducts);
        // Do not overwrite total unless API explicitly provides it. Keep total accurate.
        setTotal(res?.total ?? total);
      } catch (err) {
        if (!mounted) return;
        setProductsError(err?.message || String(err));
      } finally {
        mounted && setLoadingProducts(false);
      }
    };

    fetchProducts();

    return () => { mounted = false };
  }, [filters.minPrice, filters.maxPrice, filters.rating, filters.brands, filters.categories, filters.collections, page, searchQuery, category]);

  // Important: reset page to 1 when filters/search/category change
  // Important: reset page to 1 only when filters/search/category truly change.
  // Use a ref to track previous filter signature so we don't reset on mount
  // or when page changes.
  const prevFiltersRef = React.useRef(null);
  React.useEffect(() => {
    const signature = JSON.stringify({
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      rating: filters.rating,
      brands: filters.brands || [],
      categories: filters.categories || [],
      collections: filters.collections || [],
      searchQuery,
      category,
    });

    if (prevFiltersRef.current === null) {
      // first render: record signature but do not reset page
      prevFiltersRef.current = signature;
      return;
    }

    if (prevFiltersRef.current !== signature) {
      // filters truly changed -> reset page to 1 in URL
      prevFiltersRef.current = signature;
      if (page !== 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        navigate(`${location.pathname}?${params.toString()}`);
      }
    }
    // only run when filter primitives change
    // provide a cleanup to avoid any accidental side-effects when unmounting
    return () => { /* no-op cleanup for prevFiltersRef effect */ };
  }, [filters.minPrice, filters.maxPrice, filters.rating, filters.brands, filters.categories, filters.collections, searchQuery, category, navigate, location.pathname, searchParams, page]);

  const hasActiveFilters =
    (filters.minPrice || 0) > 0 ||
    (filters.maxPrice || 0) < 200000 ||
    (filters.rating || 0) > 0 ||
    (filters.brands && filters.brands.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.collections && filters.collections.length > 0) ||
    Boolean(searchQuery && searchQuery.length > 0);

  // Ensure we never show total=0 when items exist (fallback for backend count anomalies)
  const totalProducts = (typeof total === 'number' && total > 0) ? total : ((products && products.length) ? products.length : 0);
  const totalPages = Math.ceil((totalProducts || 0) / itemsPerPage);
  const paginatedProducts = sortedAndFilteredProducts;

  const displayCategory = getDisplayCategory();

  if (loadingProducts) {
    return <ShopLoading />;
  }

  if (productsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-red-500">
        Failed to load products: {productsError}
      </div>
    );
  }

  if (isComingSoonCategory()) {
    return <ComingSoon category={getDisplayCategory()} />;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          {category !== "all" && (
            <>
              <span className="mx-2">/</span>
              <span className="text-black font-semibold">
                {displayCategory}
              </span>
            </>
          )}
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {}
        <div className="hidden lg:block lg:w-64">
             {}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Filters</h3>
              
              
              <PriceFilter 
                range={[filters.minPrice, filters.maxPrice]}
                onRangeChange={(range) => {
                  setFilters(prev => ({ ...prev, minPrice: range[0], maxPrice: range[1] }));
                  setMinPrice(range[0]);
                  setMaxPrice(range[1]);
                  setPriceRange([range[0], range[1]]);
                }}
              />
               
              <RatingFilter 
                selected={filters.rating ? [filters.rating] : []}
                onSelectionChange={(ratings) => setFilters(prev => ({ ...prev, rating: ratings.length ? Math.min(...ratings) : 0 }))}
              />

              <BrandFilter
                options={availableBrands}
                selected={filters.brands}
                onSelectionChange={(brands) => updateFilter('brands', brands)}
              />

              <CategoryFilter
                options={availableCategories}
                selected={filters.categories}
                onSelectionChange={(cats) => updateFilter('categories', cats)}
              />
            </div>
          <div className="sticky top-6 mt-4 space-y-6">
            {}
            <ShopByCategoryDropdown />
            
            {}
            <CollectionsDropdown />
            
         
            
            {}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg transition-colors font-medium text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {}
        <div className="flex-1">
          {}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? (
                <>
                  Search Results for "{searchQuery}"
                </>
              ) : (
                displayCategory
              )}
            </h1>
            {searchQuery && (
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Found {totalProducts} products
                </p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {}
          <div className="lg:hidden mb-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 pl-10 text-sm text-gray-700 border-0 focus:ring-2 focus:ring-black focus:outline-none"
              />
              <svg 
                className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>

          {}
          <div className="lg:hidden mb-6 flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sortOption}
              onChange={handleSortChange}
              className="flex-1 border rounded-lg px-4 py-3 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="rating">Sort by: Rating</option>
              <option value="price">Sort by: Price: Low to High</option>
              <option value="price-desc">Sort by: Price: High to Low</option>
              <option value="name">Sort by: Name A-Z</option>
            </select>
          </div>

          {}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {paginatedProducts.length} of {totalProducts} products
              {hasActiveFilters && " (filtered)"}
            </p>
            
            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
              
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="border rounded-lg px-4 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="rating">Sort by: Rating</option>
                <option value="price">Sort by: Price: Low to High</option>
                <option value="price-desc">Sort by: Price: High to Low</option>
                <option value="name">Sort by: Name A-Z</option>
              </select>
            </div>
          </div>

          {}
          {sortedAndFilteredProducts.length > 0 ? (
            <>
              <ProductGrid 
                products={paginatedProducts}
                wishlistState={wishlistState}
                toggleWishlist={toggleWishlist}
              />

              {}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination totalPages={totalPages} currentPage={page} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {totalProducts === 0
                    ? "No products match your filters"
                    : (searchQuery ? `No products match '${searchQuery}'. Try a different search term.` : "Check out our available speakers collection below.")}
                </p>
                <Link
                  to="/shop?category=speakers"
                  className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Browse Available Speakers
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      {isFilterOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setIsFilterOpen(false)} 
          />
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 overflow-y-auto p-6 lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
               {}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Rating</h3>
                <RatingFilter 
                  selected={filters.rating ? [filters.rating] : []}
                  onSelectionChange={(ratings) => setFilters(prev => ({ ...prev, rating: ratings.length ? Math.min(...ratings) : 0 }))}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Price Range</h3>
                <PriceFilter 
                  range={[filters.minPrice, filters.maxPrice]}
                  onRangeChange={(range) => {
                    setFilters(prev => ({ ...prev, minPrice: range[0], maxPrice: range[1] }));
                    setMinPrice(range[0]);
                    setMaxPrice(range[1]);
                    setPriceRange([range[0], range[1]]);
                  }}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Brand</h3>
                <BrandFilter
                  options={availableBrands}
                  selected={filters.brands}
                  onSelectionChange={(brands) => updateFilter('brands', brands)}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Category</h3>
                <CategoryFilter
                  options={availableCategories}
                  selected={filters.categories}
                  onSelectionChange={(cats) => updateFilter('categories', cats)}
                />
              </div>
            <div className="space-y-6">
              {}
              <div className="border-b pb-4">
                <ShopByCategoryDropdown />
              </div>
              
              {}
              <div className="border-b pb-4">
                <CollectionsDropdown />
              </div>
              
           
              
              {}
              <div className="space-y-3 pt-4">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
                
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {}
          <div className="lg:col-span-1 space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          
          {}
          <div className="lg:col-span-3">
            <div className="flex justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="h-40 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
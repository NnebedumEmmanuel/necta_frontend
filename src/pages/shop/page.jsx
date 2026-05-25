import React, { useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useWishlist } from '@/context/SafeWishlistContext';
import { Filter } from "lucide-react";
import { Link } from "react-router-dom";

// Components
import RatingFilter from "../../components/shop/RatingsFilter";
import PriceFilter from "../../components/shop/PriceFilter";
import ShopByCategoryDropdown from "../../components/shop/ShopByCategory";
import ProductGrid from "../../components/home/home-products/ProductsGrid";
import ComingSoon from "../../components/shop/ComingSoon";

// Services
import { productService } from "../../../services/productService";

function parsePrice(price) {
  const numericPrice = parseInt(String(price).replace(/[^\d]/g, '')) || 0;
  return numericPrice;
}

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

  const { state: wishlistState, toggleWishlist } = useWishlist();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("rating");

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 200000,
    rating: 0,
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);

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
    const query = String(mobileSearchQuery || '').trim().replace(/\s+/g, ' ');
    if (query) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', query);
      params.delete('page');
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSortChange = (e) => setSortOption(e.target.value);

  const clearAllFilters = () => {
    setFilters({ minPrice: 0, maxPrice: 200000, rating: 0 });
    setMinPrice(0);
    setMaxPrice(200000);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // FETCH PRODUCTS
  React.useEffect(() => {
    let mounted = true;
    setLoadingProducts(true);
    setProductsError(null);

    const fetchProducts = async () => {
      try {
        const filterPayload = {};
        if (filters.minPrice > 0) filterPayload.minPrice = filters.minPrice;
        if (filters.maxPrice < 200000) filterPayload.maxPrice = filters.maxPrice;
        if (filters.rating > 0) filterPayload.rating = filters.rating;
        if (searchQuery) filterPayload.q = searchQuery;

        const activeCategory = category !== 'all' ? [category] : [];
        if (activeCategory.length > 0) filterPayload.categories = activeCategory;

        const res = await productService.getProducts({ 
          limit: itemsPerPage, 
          page, 
          filters: filterPayload 
        });

        if (!mounted) return;

        const items = res?.products ?? [];
        const enhanced = items.map(product => ({
          ...product,
          category: product.category || (product.categories?.name ?? 'speakers'),
          brand: product.brand || product.brands?.name || 'Generic',
          priceValue: parsePrice(String(product.price || '0')),
          rating: Number(product.rating) || 0,
          reviewCount: Number(product.reviewCount) || (Array.isArray(product.reviews) ? product.reviews.length : 0),
        }));

        // 🚨 FIX: If page 1, overwrite. If page > 1, APPEND the new products!
        if (page === 1) {
          setProducts(enhanced);
        } else {
          setProducts(prev => {
            // Filter out duplicates just in case
            const newProducts = enhanced.filter(e => !prev.some(p => p.id === e.id));
            return [...prev, ...newProducts];
          });
        }
        
        setTotal(res?.total ?? total);
      } catch (err) {
        if (mounted) setProductsError(err?.message || String(err));
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => { mounted = false };
  }, [filters.minPrice, filters.maxPrice, filters.rating, page, searchQuery, category]);

  // Page Reset Logic
  const prevFiltersRef = React.useRef(null);
  React.useEffect(() => {
    const signature = JSON.stringify({
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      rating: filters.rating,
      searchQuery,
      category,
    });

    if (prevFiltersRef.current === null) {
      prevFiltersRef.current = signature;
      return;
    }

    if (prevFiltersRef.current !== signature) {
      prevFiltersRef.current = signature;
      if (page !== 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        navigate(`${location.pathname}?${params.toString()}`);
      }
    }
  }, [filters, searchQuery, category, navigate, location.pathname, searchParams, page]);

  // Sorting
  const sortedAndFilteredProducts = useMemo(() => {
    const items = [...products];
    switch (sortOption) {
      case "price": return items.sort((a, b) => a.priceValue - b.priceValue);
      case "price-desc": return items.sort((a, b) => b.priceValue - a.priceValue);
      case "name": return items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case "rating": default: return items.sort((a, b) => b.rating - a.rating);
    }
  }, [products, sortOption]);

  const hasActiveFilters = filters.minPrice > 0 || filters.maxPrice < 200000 || filters.rating > 0;
  const totalProducts = (typeof total === 'number' && total > 0) ? total : products.length;
  const displayCategory = getDisplayCategory();

  if (loadingProducts && page === 1) return <ShopLoading />;
  if (productsError && page === 1) return <div className="text-center text-red-500 py-10">Failed: {productsError}</div>;
  if (isComingSoonCategory()) return <ComingSoon category={getDisplayCategory()} />;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 mt-16">
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          {category !== "all" && (
            <>
              <span className="mx-2">/</span>
              <span className="text-black font-semibold">{displayCategory}</span>
            </>
          )}
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block lg:w-64">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Filters</h3>
              
              <PriceFilter 
                range={[filters.minPrice, filters.maxPrice]}
                onRangeChange={(range) => {
                  setFilters(prev => ({ ...prev, minPrice: range[0], maxPrice: range[1] }));
                  setMinPrice(range[0]);
                  setMaxPrice(range[1]);
                }}
              />
               
              <RatingFilter 
                selected={filters.rating ? [filters.rating] : []}
                onSelectionChange={(ratings) => updateFilter('rating', ratings.length ? Math.min(...ratings) : 0)}
              />
            </div>
          <div className="sticky top-6 mt-4 space-y-6">
            <ShopByCategoryDropdown />
            
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

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : displayCategory}
            </h1>
            {searchQuery && (
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Found {totalProducts} products</p>
                <button onClick={clearSearch} className="text-sm text-blue-600 hover:text-blue-800 underline">Clear Search</button>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {sortedAndFilteredProducts.length} of {totalProducts} products
              {hasActiveFilters && " (filtered)"}
            </p>
            <div className="flex items-center gap-4">
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

          {sortedAndFilteredProducts.length > 0 ? (
            <>
              <ProductGrid 
                products={sortedAndFilteredProducts}
                wishlistState={wishlistState}
                toggleWishlist={toggleWishlist}
              />
              
              {/* 🚨 NEW: Load More Button instead of Pagination */}
              {products.length < totalProducts && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', (page + 1).toString());
                      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                    }}
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50"
                    disabled={loadingProducts}
                  >
                    {loadingProducts ? 'Loading...' : 'Load More Products'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ShopLoading() {
  return <div className="text-center py-20 mt-16 text-lg font-medium animate-pulse">Loading products...</div>;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
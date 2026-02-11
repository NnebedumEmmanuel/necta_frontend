import React, { useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useWishlist } from '@/context/SafeWishlistContext';
import { Filter } from "lucide-react";

// Components
import RatingFilter from "../../components/shop/RatingsFilter";
import PriceFilter from "../../components/shop/PriceFilter";
import ShopByCategoryDropdown from "../../components/shop/ShopByCategory";
import CollectionsDropdown from "../../components/shop/Collections";
import BrandFilter from "../../components/shop/BrandFilter";
import Pagination from "../../components/shop/Pagination";
import ProductGrid from "../../components/home/home-products/ProductsGrid";
import ComingSoon from "../../components/shop/ComingSoon";

// Services & Utils
import { productService } from "../../../services/productService";
import { publicApi } from "@/lib/api";

function parsePrice(price) {
  const numericPrice = parseInt(String(price).replace(/[^\d]/g, '')) || 0;
  return numericPrice;
}

function ShopContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL Params
  const category = searchParams.get("category") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("search") || "";
  const collectionParam = searchParams.get('collection') || null;
  
  const itemsPerPage = 8;

  // Data State
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Filter Options State
  const [allBrands, setAllBrands] = useState([]);
  const [allCollections, setAllCollections] = useState([]); // Store collections to map Slug -> ID

  // Active Filters State
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 200000,
    rating: 0,
    brands: [],
    categories: [],
    collections: collectionParam ? [collectionParam] : [],
  });

  const { state: wishlistState, toggleWishlist } = useWishlist();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("rating");
  const [mobileSearchQuery, setMobileSearchQuery] = useState(searchQuery);

  // 1. FETCH FILTER OPTIONS (Collections & Brands)
  React.useEffect(() => {
    const loadOptions = async () => {
      // A. Load Collections (To map Slug -> ID)
      try {
        const { data } = await publicApi.get('/collections');
        const cols = data?.collections || data || [];
        setAllCollections(cols);
      } catch (e) {
        console.error("Failed to load collections", e);
      }

      // B. Load Brands (With robust fallback for 404)
      try {
        // Try API first
        const { data } = await publicApi.get('/brands');
        const apiBrands = data?.brands || data || [];
        if (apiBrands.length > 0) {
          setAllBrands(apiBrands.map(b => b.name).filter(Boolean).sort());
        } else {
          throw new Error("No brands from API");
        }
      } catch (e) {
        // HARD FALLBACK: Fetch products and extract brands manually
        console.warn("Brand API failed, using product fallback", e);
        try {
          const { products } = await productService.getProducts({ limit: 100 });
          // Extract brand names from the products themselves (ignore 'Generic')
          const distinctBrands = [...new Set(products.map(p => p.brand || p.brands?.name || 'Generic').filter(b => b !== 'Generic'))].sort();
          setAllBrands(distinctBrands);
        } catch (err) {
          console.error(err);
        }
      }
    };
    loadOptions();
  }, []);

  // 2. SYNC URL COLLECTION PARAM
  React.useEffect(() => {
    if (collectionParam) {
      setFilters(prev => ({ ...prev, collections: [collectionParam] }));
    } else {
      setFilters(prev => ({ ...prev, collections: [] }));
    }
  }, [collectionParam]);

  // 3. FETCH PRODUCTS
  React.useEffect(() => {
    let mounted = true;
    setLoadingProducts(true);
    setProductsError(null);

    const fetchProducts = async () => {
      try {
        // Resolve Collection Slug -> ID
        // (Backend likely needs ID, but URL has Slug)
        let targetCollectionId = null;
        if (filters.collections.length > 0 && allCollections.length > 0) {
          const slug = filters.collections[0];
          const matched = allCollections.find(c => c.slug === slug);
          if (matched) targetCollectionId = matched.id;
        }

        const rawFilterPayload = {
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          rating: filters.rating,
          brands: filters.brands,
          categories: (filters.categories && filters.categories.length > 0) ? filters.categories : (category !== 'all' ? [category] : []),
          q: searchQuery,
        };

        // Build Clean Query
        const queryParams = { limit: itemsPerPage, page };

        // Flatten & Clean Filters
        Object.entries(rawFilterPayload).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            queryParams[key] = value.join(',');
          } else if (value !== null && value !== '' && value !== 0 && value !== '0') {
            queryParams[key] = value;
          }
        });

        // Add Collection ID if found, and also send slug as a safety net
        if (targetCollectionId) {
          queryParams['collection_id'] = targetCollectionId;
          // Send slug too as backup so backend can accept either
          if (filters.collections.length > 0) queryParams['collections'] = filters.collections[0];
        } else if (filters.collections.length > 0) {
          queryParams['collections'] = filters.collections[0];
        }

        console.log("FETCHING PRODUCTS WITH:", queryParams);

        const res = await productService.getProducts(queryParams);

        if (!mounted) return;

        // Normalize Data (Preserve real brand names)
        const items = res?.products ?? [];
        const normalizedProducts = items.map(p => ({
          ...p,
          brand: p.brand || p.brands?.name || 'Generic',
          category: p.category || p.categories?.name || 'General',
          priceValue: parsePrice(p.price || 0),
          rating: Number(p.rating) || Number(p.average_rating) || 0,
          reviewCount: Number(p.reviewCount) || Number(p.review_count) || (Array.isArray(p.reviews) ? p.reviews.length : 0),
          reviews: Array.isArray(p.reviews) ? p.reviews : [],
        }));

        setProducts(normalizedProducts);
        setTotal(res?.total ?? 0);

      } catch (err) {
        if (mounted) setProductsError(err?.message || String(err));
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    // Only run fetch if we have collections loaded (to map IDs) OR if no collection is selected
    if (!collectionParam || allCollections.length > 0) {
      fetchProducts();
    }
    
    return () => { mounted = false };
  }, [
    filters.minPrice, 
    filters.maxPrice, 
    filters.rating, 
    filters.brands, 
    filters.categories, 
    filters.collections, 
    page, 
    searchQuery, 
    category,
    allCollections // Re-run once collections are loaded to map IDs
  ]);

  // Handlers
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSortChange = (e) => setSortOption(e.target.value);

  const clearAllFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 200000,
      rating: 0,
      brands: [],
      categories: [],
      collections: [],
    });
    navigate(location.pathname);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = String(mobileSearchQuery || '').trim();
    if (query) {
      const params = new URLSearchParams(searchParams);
      params.set('search', query);
      params.delete('page');
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  // Sorting
  const sortedProducts = useMemo(() => {
    const items = [...products];
    switch (sortOption) {
      case "price": return items.sort((a, b) => a.priceValue - b.priceValue);
      case "price-desc": return items.sort((a, b) => b.priceValue - a.priceValue);
      case "name": return items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case "rating": default: return items.sort((a, b) => b.rating - a.rating);
    }
  }, [products, sortOption]);

  const hasActiveFilters = 
    filters.minPrice > 0 || 
    filters.maxPrice < 200000 || 
    filters.rating > 0 || 
    filters.brands.length > 0 || 
    filters.collections.length > 0;

  const totalPages = Math.ceil((total || 0) / itemsPerPage);
  
  const getDisplayCategory = () => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (collectionParam) return collectionParam.replace('-', ' ').toUpperCase();
    return category === 'all' ? "All Products" : category;
  };

  if (loadingProducts && products.length === 0) return <ShopLoading />;
  
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-semibold">Shop</span>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-64 space-y-6">
          <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
          
          <PriceFilter 
            range={[filters.minPrice, filters.maxPrice]}
            onRangeChange={(range) => setFilters(prev => ({ ...prev, minPrice: range[0], maxPrice: range[1] }))}
          />
          
          <RatingFilter 
            selected={filters.rating ? [filters.rating] : []}
            onSelectionChange={(ratings) => updateFilter('rating', ratings.length ? Math.min(...ratings) : 0)}
          />

          <BrandFilter
            options={allBrands}
            selected={filters.brands}
            onSelectionChange={(brands) => updateFilter('brands', brands)}
          />

          <ShopByCategoryDropdown />
          <CollectionsDropdown />

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded text-sm">
              Clear Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold capitalize">{getDisplayCategory()}</h1>
            <p className="text-gray-500 text-sm">{total} products found</p>
          </div>

          <div className="lg:hidden mb-4">
             <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded">
               <Filter size={16} /> Filters
             </button>
          </div>

          {products.length > 0 ? (
            <>
              <ProductGrid 
                products={sortedProducts}
                wishlistState={wishlistState}
                toggleWishlist={toggleWishlist}
              />
              {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} />}
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
              <button onClick={clearAllFilters} className="mt-4 text-blue-600 underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
          <div className="relative bg-white w-80 h-full p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between mb-6">
              <h2 className="font-bold text-xl">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}>✕</button>
            </div>
            <PriceFilter 
                range={[filters.minPrice, filters.maxPrice]}
                onRangeChange={(range) => setFilters(prev => ({ ...prev, minPrice: range[0], maxPrice: range[1] }))}
            />
            <div className="mt-6">
              <BrandFilter
                options={allBrands}
                selected={filters.brands}
                onSelectionChange={(brands) => updateFilter('brands', brands)}
              />
            </div>
            <div className="mt-8">
              <button onClick={() => setIsFilterOpen(false)} className="w-full bg-black text-white py-3 rounded">
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ShopLoading() {
  return <div className="text-center py-20">Loading products...</div>;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
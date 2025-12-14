// ShopPage.jsx
import React, { useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useWishlist } from "../../../context/WishlistContext";
import { Filter } from "lucide-react";
import RatingFilter from "../../components/shop/RatingsFilter";
import PriceFilter from "../../components/shop/PriceFilter";
import ShopByCategoryDropdown from "../../components/shop/ShopByCategory";
import CollectionsDropdown from "../../components/shop/Collections";
import {
  newArrivals,
  bestsellers,
  featured,
} from "../../../data/Products";
import Pagination from "../../components/shop/Pagination";
import ProductGrid from "../../components/home/home-products/ProductsGrid";
import { Link } from "react-router-dom";
import ComingSoon from "../../components/shop/ComingSoon";

// Helper functions
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

function getRandomRating() {
  const random = Math.random();
  if (random < 0.3) return 5;
  if (random < 0.6) return 4.5;
  if (random < 0.8) return 4;
  if (random < 0.95) return 3.5;
  return 3;
}

// Enhanced mock data with ratings
const allProductsData = [
  ...newArrivals.map(product => ({
    ...product,
    category: "speakers",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    rating: getRandomRating(),
    reviewCount: Math.floor(Math.random() * 500) + 100,
  })),
  ...bestsellers.map(product => ({
    ...product,
    category: "speakers",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    rating: getRandomRating(),
    reviewCount: Math.floor(Math.random() * 500) + 100,
  })),
  ...featured.map(product => ({
    ...product,
    category: "speakers",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    rating: getRandomRating(),
    reviewCount: Math.floor(Math.random() * 500) + 100,
  })),
];

function ShopContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const category = searchParams.get("category") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("search") || "";
  const itemsPerPage = 8;

  const { state: wishlistState, toggleWishlist } = useWishlist();

  // State for mobile filter visibility
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Add state for sort option
  const [sortOption, setSortOption] = useState("rating");

  // Initialize all filter states
  const [filters, setFilters] = useState({
    memory: [],
    priceRange: [0, 5000000],
    ratings: [],
  });

  // Update individual filter functions
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Get base products based on category
  const getBaseProducts = useCallback(() => {
    switch (category.toLowerCase()) {
      case "newarrivals":
        return newArrivals;
      case "bestsellers":
        return bestsellers;
      case "featured":
        return featured;
      case "phones":
      case "solar":
      case "inverter":
      case "tv":
      case "headphones":
        // Return empty array for coming soon categories
        return [];
      case "speakers":
        return allProductsData.filter(p => p.category === "speakers");
      case "all":
      default:
        return allProductsData;
    }
  }, [category]);

  // Get display category name
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

  // Check if category is coming soon
  const isComingSoonCategory = () => {
    const comingSoonCategories = ["phones", "solar", "inverter", "tv", "headphones"];
    return comingSoonCategories.includes(category.toLowerCase());
  };

  // Handle search from mobile
  const [mobileSearchQuery, setMobileSearchQuery] = useState(searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = mobileSearchQuery.trim();
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

  // Filter products based on all selected filters and category
  const filteredProducts = useMemo(() => {
    const baseProducts = getBaseProducts();
    
    let productsToFilter = [];
    
    if (category.toLowerCase() === "all") {
      productsToFilter = allProductsData;
    } else {
      productsToFilter = baseProducts;
    }

    return productsToFilter.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          (product.brand && product.brand.toLowerCase().includes(query)) ||
          (product.category && product.category.toLowerCase().includes(query));
        
        if (!matchesSearch) {
          return false;
        }
      }

      // Memory filter
      if (filters.memory.length > 0 && !filters.memory.includes(product.memory)) {
        return false;
      }

      // Price filter
      if (product.priceValue < filters.priceRange[0] || product.priceValue > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.ratings.length > 0) {
        const minRating = Math.min(...filters.ratings);
        if ((product.rating || 0) < minRating) {
          return false;
        }
      }

      return true;
    });
  }, [category, filters, getBaseProducts, searchQuery]);

  // Sort filtered products
  const sortedAndFilteredProducts = useMemo(() => {
    const products = [...filteredProducts];
    
    switch (sortOption) {
      case "price":
        return products.sort((a, b) => a.priceValue - b.priceValue);
      case "price-desc":
        return products.sort((a, b) => b.priceValue - a.priceValue);
      case "name":
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case "rating":
      default:
        return products.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
    }
  }, [filteredProducts, sortOption]);

  const clearAllFilters = () => {
    setFilters({
      memory: [],
      priceRange: [0, 5000000],
      ratings: [],
    });
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const hasActiveFilters = 
    filters.memory.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000000 ||
    filters.ratings.length > 0;

  // Pagination
  const totalProducts = sortedAndFilteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedAndFilteredProducts.slice(startIndex, endIndex);

  const displayCategory = getDisplayCategory();

  // If coming soon category, show coming soon page
  if (isComingSoonCategory()) {
    return <ComingSoon category={getDisplayCategory()} />;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
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
        {/* Left Sidebar - Filters and Categories (Desktop) */}
        <div className="hidden lg:block lg:w-64">
             {/* Filters */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Filters</h3>
              
              
              <PriceFilter 
                range={filters.priceRange}
                onRangeChange={(range) => updateFilter('priceRange', range)}
              />
               
              <RatingFilter 
                selected={filters.ratings}
                onSelectionChange={(ratings) => updateFilter('ratings', ratings)}
              />
            </div>
          <div className="sticky top-6 mt-4 space-y-6">
            {/* Shop By Category */}
            <ShopByCategoryDropdown />
            
            {/* Collections */}
            <CollectionsDropdown />
            
         
            
            {/* Clear All Filters Button */}
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

        {/* Main content - Right side */}
        <div className="flex-1">
          {/* Page Header */}
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
                  Found {sortedAndFilteredProducts.length} products
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

          {/* Mobile Search Bar */}
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

          {/* Mobile Filter and Sort Row */}
          <div className="lg:hidden mb-6 flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).reduce((acc, val) => 
                    Array.isArray(val) ? acc + val.length : acc + (val[0] > 0 || val[1] < 5000000 ? 1 : 0), 0)}
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

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {paginatedProducts.length} of {sortedAndFilteredProducts.length} products
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

          {/* Product Grid */}
          {sortedAndFilteredProducts.length > 0 ? (
            <>
              <ProductGrid 
                products={paginatedProducts}
                wishlistState={wishlistState}
                toggleWishlist={toggleWishlist}
              />

              {/* Pagination */}
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
                  {searchQuery 
                    ? `No products match your search "${searchQuery}". Try a different search term.`
                    : "Check out our available speakers collection below."}
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

      {/* Mobile Filter Sidebar */}
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
               {/* Filters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Rating</h3>
                <RatingFilter 
                  selected={filters.ratings}
                  onSelectionChange={(ratings) => updateFilter('ratings', ratings)}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Price Range</h3>
                <PriceFilter 
                  range={filters.priceRange}
                  onRangeChange={(range) => updateFilter('priceRange', range)}
                />
              </div>
            <div className="space-y-6">
              {/* Shop By Category */}
              <div className="border-b pb-4">
                <ShopByCategoryDropdown />
              </div>
              
              {/* Collections */}
              <div className="border-b pb-4">
                <CollectionsDropdown />
              </div>
              
           
              
              {/* Action Buttons */}
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
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          
          {/* Main content skeleton */}
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
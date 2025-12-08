import React, { useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import MemoryFilter from "../../components/shop/MemoryFilter";
import PriceFilter from "../../components/shop/PriceFilter";
import {
  newArrivals,
  bestsellers,
  featured,
  phones,
  computers,
  smartWatches,
  cameras,
  headphones,
  gaming,
} from "../../../data/Products";
import Pagination from "../../components/shop/Pagination";
import ShopProductGrid from "../../components/shop/ShopProducts";
import { Link } from "react-router-dom";
import BatteryCapacityFilter from "../../components/shop/BatteryCapacityFilter";

// Helper functions to extract filter properties from product data
function getBrandFromName(name) {
  const brands = ["Apple", "Samsung", "Xiaomi", "Poco", "OPPO", "Honor", "Motorola", "Nokia", "Realme", "Vivo", "Lenovo", "Asus", "LG", "Google", "OnePlus", "Infinix", "Canon", "Sony", "Nikon", "Blackmagic", "Fujifilm", "Panasonic", "Bose", "Beats", "Sennheiser", "JBL", "PlayStation", "Xbox", "Nintendo", "Steam", "Razer", "Logitech"];
  const foundBrand = brands.find(brand => name.toLowerCase().includes(brand.toLowerCase()));
  return foundBrand || "Other";
}

function getMemoryFromProduct(product) {
  // Try to extract memory from name
  const memoryPatterns = /(\d+)\s*(GB|TB|MB)/gi;
  const matches = product.name.match(memoryPatterns);
  if (matches && matches.length > 0) {
    return matches[0];
  }
  
  // Fallback to random memory based on product type
  const phoneMemories = ["64GB", "128GB", "256GB", "512GB"];
  const computerMemories = ["8GB", "16GB", "32GB", "64GB"];
  const watchMemories = ["16GB", "32GB", "64GB"];
  
  if (product.name.toLowerCase().includes("phone") || product.name.toLowerCase().includes("iphone")) {
    return phoneMemories[Math.floor(Math.random() * phoneMemories.length)];
  } else if (product.name.toLowerCase().includes("watch")) {
    return watchMemories[Math.floor(Math.random() * watchMemories.length)];
  } else {
    return computerMemories[Math.floor(Math.random() * computerMemories.length)];
  }
}

function parsePrice(price) {
  const numericPrice = parseInt(price.replace(/[^\d]/g, '')) || 0;
  return numericPrice;
}

function getBatteryCapacity() {
  const capacities = ["Under 2000 mAh", "2000 - 3000 mAh", "3000 - 4000 mAh", "4000 - 5000 mAh", "5000 - 6000 mAh", "Over 6000 mAh"];
  return capacities[Math.floor(Math.random() * capacities.length)];
}

function getProtectionClass() {
  const classes = ["IP68", "IP67", "IP66", "IP55", "IP54", "IP53", "IP52", "No Rating"];
  // Higher probability for common ratings
  const weights = [0.3, 0.2, 0.1, 0.1, 0.1, 0.05, 0.05, 0.1];
  const random = Math.random(); 
  let sum = 0;
  for (let i = 0; i < classes.length; i++) {
    sum += weights[i];
    if (random <= sum) return classes[i];
  }
  return "No Rating";
}

function getScreenDiagonal() {
  const diagonals = ["Under 5 inch", "5 - 5.5 inch", "5.5 - 6 inch", "6 - 6.5 inch", "6.5 - 7 inch", "Over 7 inch"];
  return diagonals[Math.floor(Math.random() * diagonals.length)];
}

function getScreenType() {
  const types = ["OLED", "AMOLED", "Super AMOLED", "LCD", "IPS LCD", "Retina", "LTPO", "Mini-LED"];
  // Higher probability for common types
  const weights = [0.2, 0.15, 0.15, 0.2, 0.15, 0.05, 0.05, 0.05];
  const random = Math.random(); 
  let sum = 0;
  for (let i = 0; i < types.length; i++) {
    sum += weights[i];
    if (random <= sum) return types[i];
  }
  return "LCD";
}

function getCategoryFromProduct(product) {
  if (phones.includes(product)) return "phones";
  if (computers.includes(product)) return "computers";
  if (smartWatches.includes(product)) return "smartWatches";
  if (cameras.includes(product)) return "cameras";
  if (headphones.includes(product)) return "headphones";
  if (gaming.includes(product)) return "gaming";
  if (newArrivals.includes(product)) return "newArrivals";
  if (bestsellers.includes(product)) return "bestsellers";
  if (featured.includes(product)) return "featured";
  return "other";
}

// Enhanced mock data with additional properties for filtering
const allProducts = [
  // Combine all products and enrich with filter properties
  ...phones.map(product => ({
    ...product,
    category: "phones",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...computers.map(product => ({
    ...product,
    category: "computers",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...smartWatches.map(product => ({
    ...product,
    category: "smartWatches",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...cameras.map(product => ({
    ...product,
    category: "cameras",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...headphones.map(product => ({
    ...product,
    category: "headphones",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...gaming.map(product => ({
    ...product,
    category: "gaming",
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...newArrivals.map(product => ({
    ...product,
    category: getCategoryFromProduct(product),
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...bestsellers.map(product => ({
    ...product,
    category: getCategoryFromProduct(product),
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
  })),
  ...featured.map(product => ({
    ...product,
    category: getCategoryFromProduct(product),
    brand: getBrandFromName(product.name),
    memory: getMemoryFromProduct(product),
    priceValue: parsePrice(product.price),
    batteryCapacity: getBatteryCapacity(),
    protectionClass: getProtectionClass(),
    screenDiagonal: getScreenDiagonal(),
    screenType: getScreenType(),
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

  // State for mobile filter visibility
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Add state for sort option
  const [sortOption, setSortOption] = useState("rating");

  // Initialize all filter states with proper default values
  const [filters, setFilters] = useState({
    brands: [],
    memory: [],
    priceRange: [0, 5000000],
    battery: [],
    protection: [],
    screenDiagonal: [],
    screenType: [],
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
        return phones;
      case "computers":
        return computers;
      case "smartwatches":
        return smartWatches;
      case "cameras":
        return cameras;
      case "headphones":
        return headphones;
      case "gaming":
        return gaming;
      case "all":
      default:
        return allProducts; // Use the enriched allProducts array
    }
  }, [category]);

  // Get display category name
  const getDisplayCategory = () => {
    switch (category.toLowerCase()) {
      case "newarrivals": return "New Arrivals";
      case "bestsellers": return "Bestsellers";
      case "featured": return "Featured";
      case "phones": return "Smartphones";
      case "computers": return "Computers";
      case "smartwatches": return "Smart Watches";
      case "cameras": return "Cameras";
      case "headphones": return "Headphones";
      case "gaming": return "Gaming";
      default: return searchQuery ? `Search: "${searchQuery}"` : "All Products";
    }
  };

  // Handle search from mobile
  const [mobileSearchQuery, setMobileSearchQuery] = useState(searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = mobileSearchQuery.trim();
    if (query) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', query);
      params.delete('page'); // Reset to first page when searching
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
    
    // For specific categories, we need to map to the enriched products
    let productsToFilter = [];
    
    if (category.toLowerCase() === "all") {
      productsToFilter = allProducts;
    } else {
      // Map base products to their enriched versions from allProducts
      productsToFilter = baseProducts.map(baseProduct => {
        const enrichedProduct = allProducts.find(p => p.id === baseProduct.id);
        if (enrichedProduct) {
          return enrichedProduct;
        }
        return {
          ...baseProduct,
          category: getCategoryFromProduct(baseProduct),
          brand: getBrandFromName(baseProduct.name),
          memory: getMemoryFromProduct(baseProduct),
          priceValue: parsePrice(baseProduct.price),
          batteryCapacity: getBatteryCapacity(),
          protectionClass: getProtectionClass(),
          screenDiagonal: getScreenDiagonal(),
          screenType: getScreenType(),
        };
      });
    }

    return productsToFilter.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query));
        
        if (!matchesSearch) {
          return false;
        }
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Memory filter
      if (filters.memory.length > 0 && !filters.memory.includes(product.memory)) {
        return false;
      }

      // Price filter
      if (product.priceValue < filters.priceRange[0] || product.priceValue > filters.priceRange[1]) {
        return false;
      }

      // Battery capacity filter
      if (filters.battery.length > 0 && !filters.battery.includes(product.batteryCapacity)) {
        return false;
      }

      // Protection class filter
      if (filters.protection.length > 0 && !filters.protection.includes(product.protectionClass)) {
        return false;
      }

      // Screen diagonal filter
      if (filters.screenDiagonal.length > 0 && !filters.screenDiagonal.includes(product.screenDiagonal)) {
        return false;
      }

      // Screen type filter
      if (filters.screenType.length > 0 && !filters.screenType.includes(product.screenType)) {
        return false;
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
      case "name":
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case "rating":
      default:
        return products.sort((a, b) => {
          const ratingA = a.reviews?.averageRating || 0;
          const ratingB = b.reviews?.averageRating || 0;
          return ratingB - ratingA;
        });
    }
  }, [filteredProducts, sortOption]);

  const clearAllFilters = () => {
    setFilters({
      brands: [],
      memory: [],
      priceRange: [0, 5000000],
      battery: [],
      protection: [],
      screenDiagonal: [],
      screenType: [],
    });
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const hasActiveFilters = 
    filters.brands.length > 0 ||
    filters.memory.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000000 ||
    filters.battery.length > 0 ||
    filters.protection.length > 0 ||
    filters.screenDiagonal.length > 0 ||
    filters.screenType.length > 0;

  // Pagination
  const totalProducts = sortedAndFilteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedAndFilteredProducts.slice(startIndex, endIndex);

  const displayCategory = getDisplayCategory();

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500 mb-4">
          <Link 
            to="/" 
            className="hover:text-gray-700 transition-colors"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link 
            to="/shop" 
            className="hover:text-gray-700 transition-colors"
          >
            Catalog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">
            {searchQuery ? (
              <>
                Search: &quot;{searchQuery}&quot;
              </>
            ) : (
              displayCategory
            )}
          </span>
        </nav>
        
        {/* Section Title and Search Info */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery ? (
              <>
                Search: &quot;{searchQuery}&quot;
              </>
            ) : (
              displayCategory
            )}
          </h1>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-gray-600 mt-2">
            Found {sortedAndFilteredProducts.length} products matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden mb-4">
        <form onSubmit={handleSearch} className="flex items-center bg-gray-100 [border-radius:6px] px-3 py-2 shadow-sm">
          <input
            type="text"
            placeholder="Search products..."
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent outline-none text-sm text-gray-700"
          />
          <button 
            type="submit" 
            className="ml-2 text-gray-600 hover:text-black"
            title="Search products"
            aria-label="Search products"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile Filter and Sort Row */}
      <div className="lg:hidden mb-4 flex items-center justify-between gap-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex-1"
          aria-label="Open filters"
          aria-expanded={isFilterOpen}
        >
          <span className="text-left">Filters</span>
          <img 
            src="/icons/Filters.png" 
            alt="Filter" 
            width={20} 
            height={20} 
          />
        </button>

        <select
          value={sortOption}
          onChange={handleSortChange}
          className="border rounded-md px-3 py-2 text-sm flex-1"
          title="Sort products by"
          aria-label="Sort products by"
        >
          <option value="rating">By rating</option>
          <option value="price">By price</option>
          <option value="name">By name</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className={`
          lg:col-span-1
          ${isFilterOpen 
            ? "block fixed top-0 left-0 right-0 bottom-0 z-50 bg-white overflow-y-auto scrollbar-hide" 
            : "hidden lg:block"
          }
          bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg border lg:border-none
        `}>
          {/* Close button for mobile */}
          {isFilterOpen && (
            <div className="flex items-center justify-between mb-6 lg:hidden border-b pb-4">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close filters"
                title="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Filter Content Container */}
          <div className={`space-y-6 ${isFilterOpen ? "pb-20" : ""}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Filter Components - Direct usage without extra wrappers */}
            <PriceFilter 
              range={filters.priceRange}
              onRangeChange={(range) => updateFilter('priceRange', range)}
            />

            <MemoryFilter 
              selected={filters.memory}
              onSelectionChange={(memory) => updateFilter('memory', memory)}
            />

            <BatteryCapacityFilter 
              selected={filters.battery}
              onSelectionChange={(battery) => updateFilter('battery', battery)}
            />

       
          </div>

          {/* Apply Filters Button for Mobile */}
          {isFilterOpen && (
            <div className="lg:hidden mt-6 pt-4 border-t">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-black text-white py-3 hover:bg-white hover:text-black [border-radius:6px] transition-colors font-medium border"
                aria-label="Apply filters"
                title="Apply filters"
              >
                Apply Filters
              </button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-500">
              Showing {paginatedProducts.length} of {sortedAndFilteredProducts.length} products
              {hasActiveFilters && " (filtered)"}
            </p>
            
            {/* Clear filters button for desktop */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors hidden lg:block"
              >
                Clear filters
              </button>
            )}

            {/* Sort selector - hidden on mobile, shown on desktop */}
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="border rounded-md px-3 py-2 text-sm hidden lg:block"
              title="Sort products by"
              aria-label="Sort products by"
            >
              <option value="rating">By rating</option>
              <option value="price">By price</option>
              <option value="name">By name</option>
            </select>
          </div>

          <ShopProductGrid products={paginatedProducts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination totalPages={totalPages} currentPage={page} />
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
          aria-hidden="true"
        />
      )}
    </section>
  );
}

function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-10"></div>
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
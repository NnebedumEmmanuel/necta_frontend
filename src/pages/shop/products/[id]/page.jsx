import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { allProducts } from "../../../../../data/Products";
import DetailsSection from "../../../../components/shop/shopdetails/DetailsSection";
import ReviewsSection from "../../../../components/shop/shopdetails/ReviewSection";
import RelatedProducts from "../../../../components/shop/shopdetails/RelatedProducts";
import { useWishlist } from "../../../../../context/WishlistContext";
import { Heart } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  
  const product = allProducts.find((p) => p.id.toString() === id);

  // State for product customization
  const [activeImage, setActiveImage] = useState(product?.image || "");
  const [activeColor, setActiveColor] = useState(product?.colors?.[0] || null);
  const [activeStorage, setActiveStorage] = useState("128GB");

  if (!product) {
    navigate("/404");
    return null;
  }

  const isInWishlist = wishlistState?.items?.some(item => item.id === product.id) || false;

  // Color mapping
  const colorClasses = {
    "#000000": "bg-black",
    "#7d4ac7": "bg-purple-600",
    "#ffffff": "bg-gray-100 border border-gray-300",
    "#f1c40f": "bg-yellow-400",
    "#2c3e50": "bg-gray-800",
    "#e74c3c": "bg-red-500",
    "#3498db": "bg-blue-500",
    "#27ae60": "bg-green-500",
    "#8e44ad": "bg-purple-500",
    "#f8f9fa": "bg-gray-50 border border-gray-300",
    "#bdc3c7": "bg-gray-300",
    "#ecf0f1": "bg-gray-100 border border-gray-300",
    "#34495e": "bg-gray-700",
    "#7f8c8d": "bg-gray-500",
    "#95a5a6": "bg-gray-400",
    "#c0392b": "bg-red-600",
    "#d35400": "bg-orange-500",
    "#2980b9": "bg-blue-600",
    "#1e1e1e": "bg-gray-900",
  };

  // Camera extraction functions
  const extractMainCamera = (specs) => {
    if (specs?.mainCamera) return specs.mainCamera;
    
    if (specs?.camera) {
      const cameraStr = specs.camera;
      
      const mpMatches = cameraStr.match(/(\d+\.?\d*)\s*MP/g);
      if (mpMatches && mpMatches.length > 0) {
        const mainCameras = mpMatches.filter((mp) => {
          const mpText = mp.toLowerCase();
          return !mpText.includes('front') && !mpText.includes('facing') && 
                 !cameraStr.toLowerCase().includes(`front ${mp}`) &&
                 !cameraStr.toLowerCase().includes(`facing ${mp}`);
        });
        
        if (mainCameras.length > 0) {
          return mainCameras.map((mp) => mp.replace(/\s*MP/i, '')).join('-') + ' MP';
        }
        
        if (mpMatches.length > 1) {
          const mainCams = mpMatches.slice(0, -1);
          return mainCams.map((mp) => mp.replace(/\s*MP/i, '')).join('-') + ' MP';
        }
        
        return mpMatches[0];
      }
    }
    
    if (product.name.includes('Watch')) return "12 MP";
    if (product.name.includes('iPad')) return "8 MP";
    if (product.name.includes('Galaxy S24')) return "200-50-12 MP";
    if (product.name.includes('iPhone 15')) return "48-12-12 MP";
    if (product.name.includes('Pixel')) return "50-48-48 MP";
    
    return "48-12-12 MP";
  };

  const extractFrontCamera = (specs) => {
    if (specs?.frontCamera) return specs.frontCamera;
    
    if (specs?.camera) {
      const cameraStr = specs.camera.toLowerCase();
      
      const frontMatch = cameraStr.match(/(?:front|facing)[^\d]*(\d+\.?\d*)\s*mp/i);
      if (frontMatch) return frontMatch[1] + " MP";
      
      const selfieMatch = cameraStr.match(/(?:selfie)[^\d]*(\d+\.?\d*)\s*mp/i);
      if (selfieMatch) return selfieMatch[1] + " MP";
      
      const allMpMatches = specs.camera.match(/(\d+\.?\d*)\s*MP/gi);
      if (allMpMatches && allMpMatches.length > 1) {
        const lastCamera = allMpMatches[allMpMatches.length - 1];
        return lastCamera.replace(/\s*MP/i, '') + " MP";
      }
    }
    
    if (product.name.includes('Watch')) return "12 MP";
    if (product.name.includes('iPad')) return "12 MP";
    if (product.name.includes('Galaxy S24')) return "12 MP";
    if (product.name.includes('iPhone 15')) return "12 MP";
    if (product.name.includes('Pixel')) return "10.5 MP";
    
    return "12 MP";
  };

  // Extract dynamic specs with fallbacks
  const screenSize = product.specs?.screenSize || 
                    product.specs?.screen?.match(/([\d.]+)[”"]/)?.[1] + "”" || 
                    "6.7”";
  
  const cpu = product.specs?.cpu || "Apple A16 Bionic";
  
  const numberOfCores = product.specs?.numberOfCores || 
                       product.specs?.cores || 
                       (product.specs?.cpu?.includes("A16") ? "6" : 
                        product.specs?.cpu?.includes("A17") ? "6" : 
                        product.specs?.cpu?.includes("Snapdragon") ? "8" : "6");
  
  const mainCamera = extractMainCamera(product.specs);
  const frontCamera = extractFrontCamera(product.specs);
  
  const capacity = product.specs?.capacity || 
                  product.specs?.battery?.match(/(\d+)\s*mAh/)?.[1] + " mAh" || 
                  "4323 mAh";

  const handleAddToCart = () => {
    console.log("Add to cart:", { product, color: activeColor, storage: activeStorage });
    // Add to cart logic here
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      wishlistDispatch({ type: "REMOVE_FROM_WISHLIST", payload: product.id });
    } else {
      wishlistDispatch({ type: "ADD_TO_WISHLIST", payload: product });
    }
  };

  // Function to determine product category
  const getProductCategory = () => {
    const name = product.name.toLowerCase();
    
    if (name.includes('phone') || name.includes('iphone') || name.includes('galaxy') || name.includes('pixel')) {
      return 'Smartphones';
    } else if (name.includes('ipad') || name.includes('tablet')) {
      return 'Tablets';
    } else if (name.includes('watch') || name.includes('smartwatch')) {
      return 'SmartWatches';
    } else if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) {
      return 'Computers';
    } else if (name.includes('headphone') || name.includes('airpods') || name.includes('earbud')) {
      return 'Headphones';
    } else if (name.includes('camera')) {
      return 'Cameras';
    } else if (name.includes('gaming') || name.includes('console') || name.includes('playstation') || name.includes('xbox')) {
      return 'Gaming';
    } else {
      return 'Electronics';
    }
  };

  // Function to determine product brand
  const getProductBrand = () => {
    const name = product.name.toLowerCase();
    
    if (name.includes('apple') || name.includes('iphone') || name.includes('ipad') || name.includes('macbook')) {
      return 'Apple';
    } else if (name.includes('samsung') || name.includes('galaxy')) {
      return 'Samsung';
    } else if (name.includes('google') || name.includes('pixel')) {
      return 'Google';
    } else if (name.includes('sony')) {
      return 'Sony';
    } else if (name.includes('dell')) {
      return 'Dell';
    } else if (name.includes('lenovo')) {
      return 'Lenovo';
    } else {
      return 'Brand';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="hidden sm:flex text-gray-500 text-sm mb-6 sm:mb-8">
        <Link to="/" className="hover:text-black transition-colors cursor-pointer">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-black transition-colors cursor-pointer">
          Catalog
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/shop?category=${getProductCategory().toLowerCase()}`} className="hover:text-black transition-colors cursor-pointer">
          {getProductCategory()}
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/shop?category=${getProductCategory().toLowerCase()}&brand=${getProductBrand().toLowerCase()}`} className="hover:text-black transition-colors cursor-pointer">
          {getProductBrand()}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black font-semibold">{product.name}</span>
      </nav>

      {/* Mobile Breadcrumb */}
      <nav className="sm:hidden flex text-gray-500 text-xs mb-4 overflow-x-auto pb-2">
        <Link to="/" className="hover:text-black transition-colors cursor-pointer whitespace-nowrap">
          Home
        </Link>
        <span className="mx-1">/</span>
        <Link to="/shop" className="hover:text-black transition-colors cursor-pointer whitespace-nowrap">
          Catalog
        </Link>
        <span className="mx-1">/</span>
        <Link to={`/shop?category=${getProductCategory().toLowerCase()}`} className="hover:text-black transition-colors cursor-pointer whitespace-nowrap">
          {getProductCategory()}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-black font-semibold whitespace-nowrap truncate max-w-[100px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
        {/* Left Section - Images */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Thumbnail Gallery */}
          {product.gallery && (
            <div className="flex sm:flex-col gap-3 sm:gap-4 order-2 sm:order-1 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
              {product.gallery.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition flex-shrink-0
                    ${activeImage === img ? "border-black" : "border-transparent hover:border-gray-300"}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    className={`object-cover transition-all duration-300 w-full h-full ${activeImage === img ? "" : "filter blur-[1px] opacity-80"}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative w-full h-80 sm:h-[400px] lg:h-[600px] rounded-2xl border overflow-hidden order-1 sm:order-2">
            <img
              src={activeImage}
              alt={product.name}
              className="object-contain transition-all duration-300 w-full h-full"
            />
          </div>
        </div>

        {/* Right Section - Info */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{product.name}</h1>

            {/* Pricing */}
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <p className="text-2xl sm:text-3xl font-semibold text-black">{product.price}</p>
              {product.oldPrice && (
                <p className="text-gray-400 line-through text-lg sm:text-xl">
                  {product.oldPrice}
                </p>
              )}
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <p className="font-medium whitespace-nowrap text-sm sm:text-base">Select color:</p>
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setActiveColor(color)}
                        title={`Select color ${color}`}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition flex-shrink-0 hover:scale-105 ${colorClasses[color] || "bg-gray-200"} ${activeColor === color ? "border-black scale-110" : "border-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Storage Selector */}
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 sm:pb-0">
              {product.storage && product.storage.length > 0 ? (
                product.storage.map((size) => (
                  <button
                    key={size}
                    onClick={() => setActiveStorage(size)}
                    className={`px-4 py-2 sm:px-5 sm:py-2 rounded-lg border text-sm font-medium transition flex-shrink-0 hover:border-black ${activeStorage === size ? "border-black bg-black text-white" : "border-gray-300"}`}
                  >
                    {size}
                  </button>
                ))
              ) : (
                ["128GB", "256GB", "512GB", "1TB"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setActiveStorage(size)}
                    className={`px-4 py-2 sm:px-5 sm:py-2 rounded-lg border text-sm font-medium transition flex-shrink-0 hover:border-black ${activeStorage === size ? "border-black bg-black text-white" : "border-gray-300"}`}
                  >
                    {size}
                  </button>
                ))
              )}
            </div>

            {/* Dynamic Specs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <SpecItem icon="/icons/screensize.png" label="Screen size" value={screenSize} />
              <SpecItem icon="/icons/cpu.png" label="CPU" value={cpu} />
              <SpecItem icon="/icons/core.png" label="Number of Cores" value={numberOfCores} />
              <SpecItem icon="/icons/main.png" label="Main Camera" value={mainCamera} />
              <SpecItem icon="/icons/front.png" label="Front Camera" value={frontCamera} />
              <SpecItem icon="/icons/battery.png" label="Capacity" value={capacity} />
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm max-w-lg mb-4 sm:mb-6">
              {product.description || "Enhanced capabilities thanks to an enlarged display of 6.7 inches and work without recharging throughout the day, incredible photos in weak, and in bright light using the new system with two cameras more..."}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={handleToggleWishlist}
              className="w-full border border-gray-300 px-6 py-3 sm:py-4 rounded-lg hover:bg-gray-100 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
              {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white px-6 py-3 sm:py-4 rounded-lg hover:bg-gray-800 font-medium transition-colors"
            >
              Add to Cart
            </button>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-20 mt-6 sm:mt-10 text-[#717171] border-t pt-4 sm:pt-6">
            <DeliveryInfo icon="/icons/Delivery.png" label="Free Delivery" detail="1-2 day" />
            <DeliveryInfo icon="/icons/Stock.png" label="In Stock" detail="Today" />
            <DeliveryInfo icon="/icons/Guaranteed.png" label="Guaranteed" detail="1 year" />
          </div>
        </div>
      </div>

      {/* Details Section */}
      <DetailsSection product={product} />

      {/* Reviews Section */}
      <ReviewsSection product={product} />
      
      {/* Related Products */}
      <RelatedProducts />
    </div>
  );
}

// Helper components
function SpecItem({ icon, label, value }) {
  return (
    <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
          <img src={icon} alt={label} className="object-contain w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{label}</div>
          <div className="text-base sm:text-lg font-medium text-black truncate">{value}</div>
        </div>
      </div>
    </div>
  );
}

function DeliveryInfo({ icon, label, detail }) {
  return (
    <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-2 sm:text-left">
      <div className="w-10 h-10 sm:w-16 sm:h-16 relative mb-1 sm:mb-0">
        <img src={icon} alt={label} className="object-contain w-full h-full" />
      </div>
      <span className="font-semibold text-xs sm:text-md leading-tight">
        {label}<br /><span className="text-black">{detail}</span>
      </span>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import DetailsSection from "../../../../components/shop/shopdetails/DetailsSection";
import ReviewsSection from "../../../../components/shop/shopdetails/ReviewSection";
import RelatedProducts from "../../../../components/shop/shopdetails/RelatedProducts";
import { productService } from '../../../../../services/productService';
import { useWishlist } from "../../../../../context/WishlistContext";
import { Heart } from "lucide-react";
import { useCart } from "../../../../../context/useCartHook";
import { useToast } from "../../../../context/useToastHook";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await productService.getProduct(id);
        if (!mounted) return;
        const p = data?.product || data || null;
        if (!p) {
          navigate('/404');
          return;
        }
        setProduct(p);
        setActiveImage(p.image || p.gallery?.[0] || p.images?.[0]?.url || '');
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || String(err));
        navigate('/404');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false };
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center">Loading product…</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load product: {error}</div>;
  if (!product) return null;

  const isInWishlist = wishlistState?.items?.some(item => item.id === product.id) || false;

  // Only map to backend fields: name, price, specs, images, stock

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0]?.url || product.gallery?.[0] || null,
      stock: product.stock ?? null,
      quantity: 1,
    });
    showToast(`${product.name} added to cart`, { type: 'success' });
    navigate("/cart");
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      wishlistDispatch({ type: "REMOVE_FROM_WISHLIST", payload: product.id });
      showToast(`${product.name} removed from wishlist`, { type: 'info' });
    } else {
      wishlistDispatch({ type: "ADD_TO_WISHLIST", payload: product });
      showToast(`${product.name} added to wishlist`, { type: 'success' });
    }
  };

  // category/brand inference removed — UI maps only to backend fields

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {}
      <nav className="hidden sm:flex text-gray-500 text-sm mb-6 sm:mb-8">
        <Link to="/" className="hover:text-black transition-colors cursor-pointer">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-black transition-colors cursor-pointer">
          Catalog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black font-semibold">{product.name}</span>
      </nav>

      {}
      <nav className="sm:hidden flex text-gray-500 text-xs mb-4 overflow-x-auto pb-2">
        <Link to="/" className="hover:text-black transition-colors cursor-pointer whitespace-nowrap">
          Home
        </Link>
        <span className="mx-1">/</span>
        <Link to="/shop" className="hover:text-black transition-colors cursor-pointer whitespace-nowrap">
          Catalog
        </Link>
        <span className="mx-1">/</span>
        <span className="text-black font-semibold whitespace-nowrap truncate max-w-[100px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
        {}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {}
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

          {}
          <div className="relative w-full h-80 sm:h-[400px] lg:h-[600px] rounded-2xl border overflow-hidden order-1 sm:order-2">
            <img
              src={activeImage}
              alt={product.name}
              className="object-contain transition-all duration-300 w-full h-full"
            />
          </div>
        </div>

        {}
        <div className="flex flex-col justify-between">
          <div>
            {}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{product.name}</h1>

            {}
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <p className="text-2xl sm:text-3xl font-semibold text-black">{product.price}</p>
              {product.oldPrice && (
                <p className="text-gray-400 line-through text-lg sm:text-xl">
                  {product.oldPrice}
                </p>
              )}
            </div>

            {}
            {/* Specs grid generated dynamically from product.specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {product.specs && typeof product.specs === 'object' ? (
                Object.entries(product.specs).map(([key, val]) => (
                  <SpecItem key={key} label={String(key)} value={
                    typeof val === 'string' || typeof val === 'number' ? String(val) : JSON.stringify(val)
                  } />
                ))
              ) : (
                <div className="text-gray-600">No specifications available.</div>
              )}
            </div>

            {}
            <p className="text-gray-600 leading-relaxed text-sm max-w-lg mb-4 sm:mb-6">
              {product.description || "Enhanced capabilities thanks to an enlarged display of 6.7 inches and work without recharging throughout the day, incredible photos in weak, and in bright light using the new system with two cameras more..."}
            </p>
          </div>

          {}
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

          {}
          <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-20 mt-6 sm:mt-10 text-[#717171] border-t pt-4 sm:pt-6">
            <DeliveryInfo icon="/icons/Delivery.png" label="Free Delivery" detail="1-2 day" />
            <DeliveryInfo icon="/icons/Stock.png" label="In Stock" detail="Today" />
            <DeliveryInfo icon="/icons/Guaranteed.png" label="Guaranteed" detail="1 year" />
          </div>
        </div>
      </div>

      {}
      <DetailsSection product={product} />

      {}
      <ReviewsSection product={product} />
      
      {}
      <RelatedProducts />
    </div>
  );
}

function SpecItem({ label, value }) {
  const renderValue = (val) => {
    if (Array.isArray(val)) {
      if (val.length <= 3) {
        return val.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
      }
      return (
        <ul className="list-disc pl-5 space-y-1">
          {val.map((v, i) => (
            <li key={i}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
          ))}
        </ul>
      );
    }

    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return val ?? '';
  };

  return (
    <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{label}</div>
          <div className="text-base sm:text-lg font-medium text-black truncate">{renderValue(value)}</div>
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
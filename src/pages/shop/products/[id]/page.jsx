import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ChevronRight, Home, Zap } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastProvider';
import { api } from '@/lib/api';

import DetailsSection from '@/components/shop/shopdetails/DetailsSection';
import ReviewsSection from '@/components/shop/shopdetails/ReviewSection';
import RelatedProducts from '@/components/shop/shopdetails/RelatedProducts';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // --- DATA NORMALIZER (CRITICAL) ---
  const normalizeProduct = (data) => {
    if (!data) return null;
    const parseJSON = (str) => { try { return JSON.parse(str); } catch (e) { return str; } };

    // Images: backend may send JSON string or array; normalize to array
    let images = Array.isArray(data.images) ? data.images : parseJSON(data.images || '');
    if (!Array.isArray(images)) images = data.image ? [data.image] : ['https://placehold.co/600x600?text=No+Image'];

    // Specs: backend may send JSON string or object
    let specs = (typeof data.specs === 'object' && data.specs) ? data.specs : parseJSON(data.specs || '{}');
    if (typeof specs !== 'object' || specs === null) specs = {};

    return {
      ...data,
      name: data.name || 'Untitled Product',
      price: Number(data.price) || 0,
      oldPrice: Number(data.old_price ?? data.oldPrice) || 0,
      images,
      specs: specs || {},
      description: data.description || data.short_description || 'No description available.'
    };
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const rawData = res?.data?.product ?? res?.data?.data ?? res?.data;
      if (rawData) setProduct(normalizeProduct(rawData));
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;
  if (!product) return <div className="min-h-screen flex justify-center items-center">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Home size={16} /> <ChevronRight size={16} /> <span>Shop</span> <ChevronRight size={16} />
          <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply"
                  onError={(e) => e.target.src = 'https://placehold.co/600x600?text=Image+Error'}
                />
              </div>
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden ${selectedImage === idx ? 'border-indigo-600' : 'border-gray-200'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="flex flex-col">
              <span className="text-indigo-600 font-bold text-sm uppercase mb-2">{product.brand_id}</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                {(() => {
                  const rating = Number(product.rating) || Number(product.average_rating) || 0;
                  const reviewCount = Number(product.reviewCount) || Number(product.review_count) || (Array.isArray(product.reviews) ? product.reviews.length : 0) || 0;
                  return (
                    <div className="flex items-center text-yellow-400">
                      <Star className="fill-current" size={20} />
                      <span className="ml-2 font-bold text-gray-900">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                      <span className="text-gray-400 ml-2">({reviewCount})</span>
                    </div>
                  );
                })()}
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold uppercase">In Stock</span>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
                {product.old_price > 0 && (
                  <span className="text-xl text-gray-400 line-through">₦{product.old_price.toLocaleString()}</span>
                )}
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => { addToCart(product, quantity); showToast && showToast('Added to cart', { type: 'success' }); }}
                  className="flex-1 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => { addToCart(product, quantity); navigate('/checkout'); }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold hover:shadow-orange-200 hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                  className={`p-4 rounded-xl border-2 ${isInWishlist(product.id) ? 'bg-red-50 text-red-500 border-red-100' : 'border-gray-200'}`}
                >
                  <Heart size={24} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                </button>
              </div>

              <div className="border-t border-gray-100 pt-8 mt-auto">
                <h3 className="font-bold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase">{key}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ReviewsSection productId={product.id} />
        <RelatedProducts category={product.category || product.category_id} currentId={product.id} />
      </div>
    </div>
  );
}
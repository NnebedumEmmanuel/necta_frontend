import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastProvider';
import { useCart } from '../../../context/useCartHook';
import { publicApi as api } from '@/lib/api';

const premiumAudioFallback = [
    {
      id: "t-g-tg659-trending-high-quality-audio",
      slug: "t-g-tg659-trending-high-quality-audio",
      name: "T&G TG659 Trending High Quality Audio",
      image: "/images/img1.png",
      originalPrice: "₦10,000.00",
      discountedPrice: "₦7,500.00",
      badge: "New"
    },
    {
      id: "t-g-tg691-bluetooth-speaker-outdoor",
      slug: "t-g-tg691-bluetooth-speaker-outdoor",
      name: "T&G TG691 Bluetooth Speaker Outdoor",
      image: "/images/img2.png",
      originalPrice: "₦8,500",
      discountedPrice: null,
      badge: null
    },
    {
      id: "t-g-tg689-bluetooth-speaker-outdoor",
      slug: "t-g-tg689-bluetooth-speaker-outdoor",
      name: "T&G TG689 Bluetooth Speaker Outdoor",
      image: "/images/img3.png",
      originalPrice: "₦12,000",
      discountedPrice: "₦6,800",
      badge: "New"
    },
    {
      id: "t-g-tg-676-wireless-portable-stereo-woofer",
      slug: "t-g-tg-676-wireless-portable-stereo-woofer",
      name: "T&G TG-676 Wireless Portable Stereo Woofer",
      image: "/images/img4.png",
      originalPrice: "₦43,000",
      discountedPrice: "₦35,000",
      badge: "New"
    }
  ];

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `NGN ${amount.toLocaleString()}`;
};

const normalizePremiumAudioProduct = (product, fallback = {}) => {
  const images = Array.isArray(product?.images) && product.images.length
    ? product.images
    : [product?.image || fallback.image].filter(Boolean);
  const price = Number(product?.price) || 0;
  const oldPrice = Number(product?.old_price || product?.compare_at_price) || 0;

  return {
    ...fallback,
    ...product,
    id: product?.id || product?._id || fallback.id,
    slug: product?.slug || fallback.slug,
    name: product?.name || product?.title || fallback.name,
    title: product?.title || product?.name || fallback.name,
    image: product?.image || images[0] || fallback.image,
    images,
    originalPrice: oldPrice ? formatMoney(oldPrice) : formatMoney(price) || fallback.originalPrice,
    discountedPrice: oldPrice ? formatMoney(price) : null,
    badge: fallback.badge,
  };
};

const DiscountPage = () => {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState(premiumAudioFallback);

  useEffect(() => {
    let mounted = true;

    api.get('/products', { params: { collections: 'premium-audio', limit: 4 } })
      .then((res) => {
        const body = res?.data;
        const rows = Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body?.products)
          ? body.products
          : [];

        if (mounted && rows.length) {
          const normalizedRows = rows.slice(0, 4).map((product, index) => (
            normalizePremiumAudioProduct(product, premiumAudioFallback[index] || {})
          ));
          const seen = new Set(
            normalizedRows.map((item) => String(item.id || item.slug || item.name || ''))
          );
          const nextSpeakers = [...normalizedRows];

          premiumAudioFallback.forEach((fallback) => {
            if (nextSpeakers.length >= 4) return;
            const key = String(fallback.id || fallback.slug || fallback.name || '');
            if (!seen.has(key)) {
              nextSpeakers.push(fallback);
              seen.add(key);
            }
          });

          setSpeakers(nextSpeakers.slice(0, 4));
        }
      })
      .catch((error) => {
        console.error('Failed to load premium audio products', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const normalizeStoreProduct = (data, fallback) => {
    const images = Array.isArray(data?.images) && data.images.length
      ? data.images
      : [data?.image || fallback.image];

    return {
      ...fallback,
      ...data,
      id: data?.id || data?._id || fallback.id,
      name: data?.name || data?.title || fallback.name,
      title: data?.title || data?.name || fallback.name,
      price: Number(data?.price) || Number(String(fallback.discountedPrice || fallback.originalPrice).replace(/[^0-9.-]+/g, '')) || 0,
      images,
      image: data?.image || images[0] || fallback.image,
      quantity: 1,
    };
  };

  const fetchStoreProduct = async (product) => {
    const res = await api.get(`/products/${product.slug}`);
    const raw = res?.data?.product ?? res?.data?.data ?? res?.data;
    return normalizeStoreProduct(raw, product);
  };

  const handleViewDetails = (product, e) => {
    e.stopPropagation();
    window.scrollTo(0, 0);
    navigate(`/shop/products/${product.slug}`);
  };

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    try {
      const storeProduct = await fetchStoreProduct(product);
      addToCart({ ...storeProduct, quantity: 1 });
      showToast(`${storeProduct.name} added to cart`, 'success');
    } catch (error) {
      console.error('Premium audio add-to-cart failed:', error);
      showToast('This product is still syncing. Open details and try again.', 'error');
    }
  };

  const handleProductClick = (product) => {
    window.scrollTo(0, 0);
    navigate(`/shop/products/${product.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-16">
      
      {}
      <div className="mb-8 pl-1">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Premium Audio Collection
        </h1>
        <p className="text-gray-600">Limited time offers on trending speakers</p>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            onClick={() => handleProductClick(speaker)}
            className="
              group relative bg-white rounded-2xl overflow-hidden 
              border border-gray-100 shadow-lg hover:shadow-2xl
              transition-all duration-300 hover:-translate-y-2
              flex flex-col h-full cursor-pointer
            "
          >
            {}
            {speaker.badge && (
              <div className="absolute top-3 left-3 z-20">
                <span className="
                  inline-flex items-center px-3 py-1 rounded-full 
                  text-xs font-bold uppercase tracking-wide
                  bg-gradient-to-r from-emerald-500 to-green-500 text-white
                  shadow-lg shadow-green-200/50
                ">
                  {speaker.badge}
                </span>
              </div>
            )}

            {}
            {speaker.discountedPrice && (
              <div className="absolute top-3 right-3 z-20">
                <div className="
                  bg-gradient-to-r from-orange-500 to-red-500 text-white 
                  px-3 py-1 rounded-lg text-sm font-bold
                  shadow-lg shadow-red-200/50
                  transform -rotate-3
                ">
                  SALE
                </div>
              </div>
            )}

            {}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-56">
              <img
                src={speaker.image}
                alt={speaker.name}
                className="
                  w-full h-full object-cover
                  transition-transform duration-500 
                  group-hover:scale-110
                "
              />
            </div>

            {}
            <div className="p-5 flex-grow flex flex-col">
              <h3 className="
                text-lg font-bold text-gray-900 mb-3 
                line-clamp-2
              ">
                {speaker.name}
              </h3>

              {}
              <div className="mb-3 transition-opacity duration-300 group-hover:opacity-0">
                {speaker.discountedPrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-sm">
                      {speaker.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {speaker.discountedPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {speaker.originalPrice}
                  </span>
                )}
              </div>

              {}
              <div className="flex items-center gap-2 mb-4 transition-opacity duration-300 group-hover:opacity-0">
                {typeof speaker.rating === 'number' && (
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-lg">
                        {i < speaker.rating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                )}
                {speaker.reviewCount != null && (
                  <span className="text-gray-500 text-sm">
                    ({speaker.reviewCount})
                  </span>
                )}
              </div>

              {}
              <div className="
                mt-auto opacity-0 group-hover:opacity-100 
                translate-y-3 group-hover:translate-y-0
                transition-all duration-300
              ">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleViewDetails(speaker, e)}
                    className="
                      flex-1 py-2 text-sm font-semibold rounded-lg
                      border border-gray-200 text-gray-700
                      hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900
                      active:scale-95 transition-all duration-200
                    "
                  >
                    Details
                  </button>
                  
                  <button 
                    onClick={(e) => handleAddToCart(speaker, e)}
                    className="
                      flex-1 py-2 text-sm font-semibold rounded-lg
                      bg-gradient-to-r from-orange-500 to-red-500 text-white
                      hover:from-orange-600 hover:to-red-600
                      active:scale-95 transition-all duration-200
                      shadow-md shadow-orange-200 hover:shadow-orange-300
                    "
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountPage;

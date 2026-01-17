import React, { useState, useEffect } from 'react';
import ProductGrid from './ProductsGrid';
import { productService } from '../../../../services/productService';

const tabs = ['New Arrival', 'Bestseller', 'Featured Products'];

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState('New Arrival');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    productService.getProducts({ limit: 12, page: 1 })
      .then((res) => {
        if (!mounted) return;
        const items = res?.products ?? [];
        setProducts(items);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || String(err));
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const getTabProducts = () => {
    if (!products) return [];
    switch (activeTab) {
      case 'New Arrival':
        return products.slice(0, 4);
      case 'Bestseller':
        return products.slice(4, 8);
      case 'Featured Products':
        return products.slice(8, 12);
      default:
        return products.slice(0, 4);
    }
  };

  return (
    <div className="px-5 md:px-16 py-10">
      <div className="mb-6 flex gap-6 text-sm font-medium">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`pb-1 border-b-2 ${
              activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-6">Loading products…</div>
      ) : error ? (
        <div className="text-center py-6 text-red-500">Failed to load products</div>
      ) : (
        (() => {
          const tabProducts = getTabProducts();
          if (!tabProducts || tabProducts.length === 0) {
            // Hide the grid completely when there are no items for the active tab
            return null;
          }
          return <ProductGrid products={tabProducts} />
        })()
      )}
    </div>
  );
};

export default ProductTabs;
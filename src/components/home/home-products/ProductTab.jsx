import React, { useState } from 'react';

// Import the actual product data
import { newArrivals, bestsellers, featured } from '../../../../data/Products';
import ProductGrid from './ProductsGrid';

const tabs = ['New Arrival', 'Bestseller', 'Featured Products'];

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState('New Arrival');
  const [products, setProducts] = useState(newArrivals);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'New Arrival':
        setProducts(newArrivals);
        break;
      case 'Bestseller':
        setProducts(bestsellers);
        break;
      case 'Featured Products':
        setProducts(featured);
        break;
      default:
        setProducts(newArrivals);
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
      <ProductGrid products={products} />
    </div>
  );
};

export default ProductTabs;
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function BrandFilter({ options = [], selected = [], onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(v => !v);

  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string') {
      return { key: option, label: option, value: option, isComingSoon: false };
    }
    const label = option?.name || option?.label || option?.slug || 'Untitled';
    const value = option?.slug || option?.id || label;

    return {
      key: option?.id || option?._id || value,
      label,
      value,
      isComingSoon: Boolean(option?.isComingSoon),
      productCount: Number(option?.productCount || option?.count || 0),
    };
  });

  const sortedOptions = [...normalizedOptions].sort((a, b) => {
    if (a.isComingSoon === b.isComingSoon) return 0;
    return a.isComingSoon ? 1 : -1;
  });

  const handleToggle = (brand) => {
    if (!onSelectionChange) return;
    if (brand.isComingSoon) return;
    
    if (selected.includes(brand.value)) {
      onSelectionChange(selected.filter(b => b !== brand.value));
    } else {
      onSelectionChange([...selected, brand.value]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900">Brands</span>
        {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {isOpen && (
        <div className="border-t p-3">
          {sortedOptions.length > 0 ? (
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {sortedOptions.map((brand) => {
                const isSelected = selected.includes(brand.value);
                return (
                  <label
                    key={brand.key}
                    className={`flex items-center gap-3 p-2 rounded transition-colors ${
                      brand.isComingSoon
                        ? 'opacity-70 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-50 cursor-pointer'
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={brand.isComingSoon}
                      onChange={() => handleToggle(brand)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className={`text-sm flex-1 ${brand.isComingSoon ? 'text-gray-400 font-normal' : 'text-gray-700 font-medium'}`}>
                      {brand.label}
                    </span>
                    {brand.isComingSoon ? (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium tracking-wide">COMING SOON</span>
                    ) : brand.productCount > 0 ? (
                      <span className="text-xs text-gray-500">{brand.productCount}</span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">No brands found</div>
          )}

          {selected.length > 0 && (
            <button onClick={() => onSelectionChange([])} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium px-2">
              Clear brands
            </button>
          )}
        </div>
      )}
    </div>
  );
}
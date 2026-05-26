import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function BrandFilter({ options = [], selected = [], onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(v => !v);

  const handleToggle = (brand) => {
    if (!onSelectionChange) return;
    if (brand.isComingSoon) return;
    if (selected.includes(brand.value)) {
      onSelectionChange(selected.filter(b => b !== brand.value));
    } else {
      onSelectionChange([...selected, brand.value]);
    }
  };

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <span className="font-semibold text-gray-900">Brand</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="border-t p-3">
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {normalizedOptions.map((brand) => {
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
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 flex-1">{brand.label}</span>
                  {brand.isComingSoon ? (
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Coming Soon</span>
                  ) : brand.productCount > 0 ? (
                    <span className="text-xs text-gray-500">{brand.productCount}</span>
                  ) : null}
                </label>
              );
            })}
          </div>

          {selected.length > 0 && (
            <button onClick={() => onSelectionChange([])} className="mt-3 text-sm text-blue-600">Clear brands</button>
          )}
        </div>
      )}
    </div>
  );
}

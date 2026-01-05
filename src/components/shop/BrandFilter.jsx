import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function BrandFilter({ options = [], selected = [], onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(v => !v);

  const handleToggle = (brand) => {
    if (!onSelectionChange) return;
    if (selected.includes(brand)) {
      onSelectionChange(selected.filter(b => b !== brand));
    } else {
      onSelectionChange([...selected, brand]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <span className="font-semibold text-gray-900">Brand</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="border-t p-3">
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {options.map((b) => {
              const isSelected = selected.includes(b);
              return (
                <label key={b} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(b)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{b}</span>
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

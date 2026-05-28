import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function BrandFilter({ options = [], selected = [], onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(v => !v);

  // Sort: Active first, Coming Soon last
  const sortedOptions = [...options].sort((a, b) => {
    const aSoon = typeof a === 'object' ? a.isComingSoon : false;
    const bSoon = typeof b === 'object' ? b.isComingSoon : false;
    if (aSoon === bSoon) return 0;
    return aSoon ? 1 : -1;
  });

  const handleToggle = (itemValue) => {
    if (!onSelectionChange) return;
    if (selected.includes(itemValue)) {
      onSelectionChange(selected.filter(b => b !== itemValue));
    } else {
      onSelectionChange([...selected, itemValue]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900">Brands</span>
        {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {isOpen && (
        <div className="border-t">
          <div className="p-3">
            {sortedOptions.length > 0 ? (
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {sortedOptions.map((opt, idx) => {
                  const name = typeof opt === 'string' ? opt : opt.name;
                  const itemValue = typeof opt === 'string' ? opt : (opt.slug || opt.name);
                  const isComingSoon = typeof opt === 'object' ? opt.isComingSoon : false;
                  const isSelected = selected.includes(itemValue);
                  
                  return (
                    <label 
                      key={itemValue || idx} 
                      className={`flex items-center justify-between p-2 rounded transition-colors ${
                        isComingSoon ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-50'
                      } ${isSelected && !isComingSoon ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {!isComingSoon && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggle(itemValue)}
                            disabled={isComingSoon}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <span className={`text-sm ${isComingSoon ? 'text-gray-400 font-normal' : 'text-gray-800 font-medium'}`}>
                          {name}
                        </span>
                      </div>
                      
                      {isComingSoon && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium tracking-wide">
                          COMING SOON
                        </span>
                      )}
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
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CategoryFilter({ options = [], selected = [], onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(v => !v);

  const handleToggle = (cat) => {
    if (!onSelectionChange) return;
    if (selected.includes(cat)) {
      onSelectionChange(selected.filter(c => c !== cat));
    } else {
      onSelectionChange([...selected, cat]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <span className="font-semibold text-gray-900">Category</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="border-t p-3">
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {options.map((c) => {
              const isSelected = selected.includes(c);
              return (
                <label key={c} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(c)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{c}</span>
                </label>
              );
            })}
          </div>

          {selected.length > 0 && (
            <button onClick={() => onSelectionChange([])} className="mt-3 text-sm text-blue-600">Clear categories</button>
          )}
        </div>
      )}
    </div>
  );
}

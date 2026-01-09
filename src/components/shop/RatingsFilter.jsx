import React, { useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";

const RatingFilter = ({ selected = [], onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const ratingOptions = [
    { value: 4, label: "4+ Stars & above", stars: 4 },
    { value: 3, label: "3+ Stars & above", stars: 3 },
    { value: 2, label: "2+ Stars & above", stars: 2 },
    { value: 1, label: "1+ Stars & above", stars: 1 },
  ];

  const handleRatingSelect = (ratingValue) => {
    if (selected.includes(ratingValue)) {
      onSelectionChange(selected.filter(r => r !== ratingValue));
    } else {
      onSelectionChange([ratingValue]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Star size={18} className="text-yellow-500" />
          <span className="font-semibold text-gray-900">Customer Rating</span>
        </div>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={18} />
        ) : (
          <ChevronDown className="text-gray-500" size={18} />
        )}
      </button>

      {}
      {isOpen && (
        <div className="border-t p-3">
          <div className="space-y-2">
            {ratingOptions.map((option) => {
              const isSelected = selected.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleRatingSelect(option.value)}
                  className={`w-full flex items-center justify-between p-2 rounded transition-all duration-200 ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < option.stars
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm font-medium text-gray-700">
                        & above
                      </span>
                    </div>
                  </div>
                  
                  {}
                </button>
              );
            })}
          </div>
          
          {}
          {selected.length > 0 && (
            <button
              onClick={() => onSelectionChange([])}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors w-full text-left"
            >
              Clear rating filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingFilter;
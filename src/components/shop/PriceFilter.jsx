import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PriceFilter({ range = [0, 5000000], onRangeChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const [localRange, setLocalRange] = useState(range);

  // Use local state if onRangeChange is not provided
  const currentRange = onRangeChange ? range : localRange;

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleRangeChange = (min, max) => {
    const newRange = [min, max];
    
    if (onRangeChange) {
      onRangeChange(newRange);
    } else {
      setLocalRange(newRange);
    }
  };

  const handleMinInputChange = (value) => {
    const newMin = Math.min(Math.max(0, value), currentRange[1]);
    handleRangeChange(newMin, currentRange[1]);
  };

  const handleMaxInputChange = (value) => {
    const newMax = Math.max(Math.min(5000000, value), currentRange[0]);
    handleRangeChange(currentRange[0], newMax);
  };

  const handleMaxPriceChange = (maxPrice) => {
    handleRangeChange(0, maxPrice);
  };

  return (
    <div className="border rounded-lg p-4 w-full max-w-sm">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleOpen}
      >
        <h3 className="font-semibold text-lg">Price</h3>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isOpen && (
        <div className="mt-4">
          {/* Price inputs */}
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <div className="flex flex-col">
              <label htmlFor="price-from" className="text-xs text-gray-400 mb-1">
                From
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">₦</span>
                <input
                  id="price-from"
                  type="number"
                  value={currentRange[0]}
                  onChange={(e) => handleMinInputChange(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-24"
                  title="Minimum price"
                  min={0}
                  max={5000000}
                />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <label htmlFor="price-to" className="text-xs text-gray-400 mb-1">
                To
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">₦</span>
                <input
                  id="price-to"
                  type="number"
                  value={currentRange[1]}
                  onChange={(e) => handleMaxInputChange(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-24"
                  title="Maximum price"
                  min={0}
                  max={5000000}
                />
              </div>
            </div>
          </div>

          {/* Single range slider for max price (recommended) */}
          <div className="mb-4">
            <label htmlFor="max-price-slider" className="block text-sm text-gray-600 mb-2">
              Maximum Price: ₦{currentRange[1].toLocaleString()}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">₦0</span>
              <input
                id="max-price-slider"
                type="range"
                min={0}
                max={5000000}
                step={10000}
                value={currentRange[1]}
                onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                className="w-full accent-black"
                title="Select maximum price"
                aria-label="Select maximum price"
              />
              <span className="text-gray-500 text-sm font-medium">₦5M</span>
            </div>
          </div>

          {/* Price range display */}
          <div className="flex justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span>₦{currentRange[0].toLocaleString()}</span>
            <span className="text-gray-400">to</span>
            <span>₦{currentRange[1].toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
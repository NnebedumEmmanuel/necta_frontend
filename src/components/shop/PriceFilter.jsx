import { ChevronUp } from "lucide-react";

export default function PriceFilter({ range = [0, 200000], onRangeChange }) {
  const currentRange = Array.isArray(range) && range.length === 2 ? range : [0, 200000];

  const handleMinInputChange = (value) => {
    const newMin = Math.min(Math.max(0, value), currentRange[1]);
    onRangeChange && onRangeChange([newMin, currentRange[1]]);
  };

  const handleMaxInputChange = (value) => {
  const newMax = Math.max(Math.min(200000, value), currentRange[0]);
    onRangeChange && onRangeChange([currentRange[0], newMax]);
  };

  const handleMaxPriceChange = (maxPrice) => {
    onRangeChange && onRangeChange([0, maxPrice]);
  };

  return (
    <div className="border rounded-lg p-4 w-full max-w-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Price</h3>
        <ChevronUp size={20} />
      </div>

      <div className="mt-4">
        {}
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
                max={200000}
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
                max={200000}
              />
            </div>
          </div>
        </div>

        {}
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
              max={200000}
              step={1000}
              value={currentRange[1]}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              className="w-full accent-black"
              title="Select maximum price"
              aria-label="Select maximum price"
            />
            <span className="text-gray-500 text-sm font-medium">₦200k</span>
          </div>
        </div>

        {}
        <div className="flex justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <span>₦{currentRange[0].toLocaleString()}</span>
          <span className="text-gray-400">to</span>
          <span>₦{currentRange[1].toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
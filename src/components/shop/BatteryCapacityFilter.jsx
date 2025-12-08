import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const BatteryCapacityFilter = ({ selected = [], onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const batteryCapacities = [
    "Under 2000 mAh",
    "2000 - 3000 mAh", 
    "3000 - 4000 mAh",
    "4000 - 5000 mAh",
    "5000 - 6000 mAh",
    "Over 6000 mAh"
  ];

  const toggle = (capacity) => {
    const newSelected = selected.includes(capacity)
      ? selected.filter((c) => c !== capacity)
      : [...selected, capacity];
    onSelectionChange(newSelected);
  };

  return (
    <div className="border p-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 text-left font-medium text-gray-900 hover:text-gray-700 transition-colors"
        aria-expanded={isOpen}
      >
        <span>Battery capacity</span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-3">
          {batteryCapacities.map((capacity) => (
            <label key={capacity} className="flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(capacity)}
                onChange={() => toggle(capacity)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="ml-3 text-sm text-gray-700">{capacity}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatteryCapacityFilter;
"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

type MemoryOption = {
  label: string;
};

interface MemoryFilterProps {
  selected?: string[];
  onSelectionChange: (selected: string[]) => void;
}

const memoryOptions: MemoryOption[] = [
  { label: "16GB" },
  { label: "32GB" },
  { label: "64GB" },
  { label: "128GB" },
  { label: "256GB" },
  { label: "512GB" },
  { label: "1TB" },
  { label: "2TB" },
  { label: "4TB" },
  { label: "8TB" },
  { label: "16TB" },
  { label: "32TB" },
];

export default function MemoryFilter({ selected = [], onSelectionChange }: MemoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleOpen = () => setIsOpen(!isOpen);

  const toggleSelect = (label: string) => {
    const newSelected = selected.includes(label)
      ? selected.filter((l) => l !== label)
      : [...selected, label];
    onSelectionChange(newSelected);
  };

  const filteredOptions = memoryOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border rounded-lg p-4 w-full max-w-sm">
      {/* Header */}
      <button
        onClick={toggleOpen}
        className="flex justify-between items-center w-full font-semibold text-lg focus:outline-none"
      >
        <span>Built-in memory</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Collapsible content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[300px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 border rounded bg-gray-100 text-sm outline-none"
            title="Search memory sizes"
            aria-label="Search memory sizes"
          />
        </div>

        {/* Options with visible scrollbar */}
        <div
          className="space-y-2 max-h-60 overflow-y-auto pr-4 mr-[-6px]
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-400
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:hover:bg-gray-500
            scrollbar-width: thin
            scrollbar-color: rgb(156 163 175) rgb(243 244 246)"
        >
          {filteredOptions.map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.label)}
                onChange={() => toggleSelect(option.label)}
                className="accent-black"
                title={`Select ${option.label}`}
              />
              <span className="flex-1">{option.label}</span>
            </label>
          ))}
          {filteredOptions.length === 0 && (
            <p className="text-gray-400 text-sm">No matches found</p>
          )}
        </div>
      </div>
    </div>
  );
}
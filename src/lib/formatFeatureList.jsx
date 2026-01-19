import React from 'react';

// formatFeatureList(value)
// - Accepts an array or a string
// - If array: returns a comma-separated string for <= 4 items,
//   otherwise returns a <ul><li> list for > 4 items
// - If string: returns the string as-is
// - If null/undefined: returns null
export default function formatFeatureList(value) {
  if (value === null || value === undefined) return null;

  // If already a string, return as-is
  if (typeof value === 'string') return value;

  // If not an array, stringify (keeps behavior consistent with current UI)
  if (!Array.isArray(value)) return String(value);

  // Array handling
  if (value.length <= 4) {
    return value.map(v => (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v))).join(', ');
  }

  return (
    <ul className="list-disc list-inside space-y-1">
      {value.map((it, i) => (
        <li key={i} className="text-gray-900">{typeof it === 'object' && it !== null ? JSON.stringify(it) : String(it)}</li>
      ))}
    </ul>
  );
}

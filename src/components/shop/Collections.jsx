import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const CollectionsDropdown = () => {
  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchCollections = async () => {
      setLoading(true);
      try {
        // Use central axios client so baseURL and auth headers are applied.
        const res = await api.get('/collections', { params: undefined });
        const data = res.data || {};
        console.log('Collections API response', data)
        if (!mounted) return
        const cols = Array.isArray(data?.collections) ? data.collections : []
        setCollections(cols)
        console.log('Collections set in state', cols)
      } catch (e) {
        // Log error and ensure UI shows empty list
        console.error('Failed to load collections', e)
        setCollections([])
      } finally {
        mounted && setLoading(false)
      }
    }

    fetchCollections()
    return () => { mounted = false }
  }, [])

  // Explicitly determine whether we have a non-empty collections array.
  const hasCollections = Array.isArray(collections) && collections.length > 0

  // Debug: log collections state so devs can confirm data reaches the UI
  // This is temporary and can be removed after verification.
  // eslint-disable-next-line no-console
  console.log('Collections state (UI)', collections)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">Collections</span>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={18} />
        ) : (
          <ChevronDown className="text-gray-500" size={18} />
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="border-t">
          <div className="p-2">
            {loading ? (
              <div className="text-sm text-gray-500 p-2">Loading...</div>
            ) : hasCollections ? (
              collections.map((collection, idx) => {
                const Icon = Tag
                // Defensive guards: collection may be null/undefined or missing fields
                const id = collection?.id
                const slug = collection?.slug ?? ''
                const name = collection?.name ?? 'Untitled'

                // Use the collection slug in the query param when present.
                const href = slug ? `/shop?collection=${encodeURIComponent(slug)}` : '/shop'

                return (
                  <Link
                    key={id ?? slug ?? `col-${idx}`}
                    to={href}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-700 group-hover:text-black">
                        {name}
                      </span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="text-sm text-gray-500 p-2">No collections</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsDropdown;
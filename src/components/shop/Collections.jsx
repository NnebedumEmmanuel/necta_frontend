import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { publicApi as api } from "@/lib/api";

const fallbackCollections = [
  { id: "premium-audio", name: "Premium Audio", slug: "premium-audio" },
  { id: "best-seller", name: "Best Seller", slug: "best-seller" },
  { id: "new-arrival", name: "New Arrival", slug: "new-arrival" },
];

const CollectionsDropdown = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const res = await api.get('/collections', { params: undefined });
        const data = res.data || {};
        if (!mounted) return
        const cols = Array.isArray(data)
          ? data
          : Array.isArray(data?.collections)
          ? data.collections
          : Array.isArray(data?.data)
          ? data.data
          : []
        setCollections(cols.length ? cols : fallbackCollections)
      } catch (e) {
        console.error('Failed to load collections', e)
        setCollections(fallbackCollections)
      } finally {
        mounted && setLoading(false)
      }
    }

    fetchCollections()
    return () => { mounted = false }
  }, [])

  const hasCollections = Array.isArray(collections) && collections.length > 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {}
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

      {}
      {isOpen && (
        <div className="border-t">
          <div className="p-2">
            {loading ? (
              <div className="text-sm text-gray-500 p-2">Loading...</div>
            ) : hasCollections ? (
              collections.map((collection, idx) => {
                const Icon = Tag
                const id = collection?.id
                const slug = collection?.slug ?? ''
                const name = collection?.name ?? 'Untitled'
                const count = Number(collection?.productCount ?? collection?.count ?? 0)
                const available = !collection?.isComingSoon

                const href = slug ? `/shop?collection=${encodeURIComponent(slug)}` : '/shop'
                const content = (
                  <>
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={available ? "text-gray-600" : "text-gray-400"} />
                      <span className={`text-sm ${available ? "text-gray-700 group-hover:text-black" : "text-gray-500"}`}>
                        {name}
                      </span>
                    </div>
                    {available && count > 0 && (
                      <span className="text-xs text-gray-500">{count}</span>
                    )}
                    {!available && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Coming Soon</span>
                    )}
                  </>
                )

                if (!available) {
                  return (
                    <div
                      key={id ?? slug ?? `col-${idx}`}
                      className="flex items-center justify-between p-2 rounded opacity-70"
                    >
                      {content}
                    </div>
                  )
                }

                return (
                  <Link
                    key={id ?? slug ?? `col-${idx}`}
                    to={href}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors group"
                  >
                    {content}
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

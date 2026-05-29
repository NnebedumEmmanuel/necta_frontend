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
        if (!mounted) return;
        
        const cols = Array.isArray(data)
          ? data
          : Array.isArray(data?.collections)
          ? data.collections
          : Array.isArray(data?.data)
          ? data.data
          : [];
          
        setCollections(cols.length ? cols : fallbackCollections);
      } catch (e) {
        console.error('Failed to load collections', e);
        if (mounted) setCollections(fallbackCollections);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCollections();
    return () => { mounted = false; };
  }, []);

  const sortedCollections = [...collections].sort((a, b) => {
    const aSoon = a.isComingSoon || false;
    const bSoon = b.isComingSoon || false;
    if (aSoon === bSoon) return 0;
    return aSoon ? 1 : -1;
  });

  const hasCollections = sortedCollections.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">Collections</span>
        {isOpen ? <ChevronUp className="text-gray-500" size={18} /> : <ChevronDown className="text-gray-500" size={18} />}
      </button>

      {isOpen && (
        <div className="border-t">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="text-sm text-gray-400 p-4 text-center">Loading collections...</div>
            ) : hasCollections ? (
              sortedCollections.map((collection, idx) => {
                const Icon = Tag;
                const id = collection?.id || collection?._id;
                const slug = collection?.slug ?? '';
                const name = collection?.name ?? 'Untitled';
                const count = Number(collection?.productCount ?? collection?.count ?? 0);
                const isComingSoon = collection?.isComingSoon;

                const href = isComingSoon 
                  ? `/coming-soon?category=${encodeURIComponent(name)}` 
                  : (slug ? `/shop?collection=${encodeURIComponent(slug)}` : '/shop');

                return (
                  <Link
                    key={id ?? slug ?? `col-${idx}`}
                    to={href}
                    className={`flex items-center justify-between p-2 rounded transition-colors group ${
                      isComingSoon ? 'hover:bg-gray-50/50 opacity-70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isComingSoon ? 'text-gray-300' : 'text-gray-600 group-hover:text-black transition-colors'} />
                      <span className={`text-sm ${
                        isComingSoon 
                          ? 'text-gray-500 font-normal' 
                          : 'text-gray-700 font-medium group-hover:text-black transition-colors'
                      }`}>
                        {name}
                      </span>
                    </div>
                    
                    {!isComingSoon && count > 0 && (
                      <span className="text-xs text-gray-500">{count}</span>
                    )}
                    {isComingSoon && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium tracking-wide">
                        COMING SOON
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="text-sm text-gray-400 p-4 text-center">No collections found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsDropdown;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { api } from '@/lib/api';

function normalizeProduct(raw) {
  if (!raw) return null;
  const out = { ...raw };
  out.id = raw.id ?? raw._id ?? raw.product_id ?? raw.slug ?? String(Math.random()).slice(2);
  out.name = raw.name || raw.title || 'Untitled Product';
  out.price = Number(raw.price ?? raw.amount ?? raw.price_cents) || 0;

  const parseImgs = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') {
      const s = val.trim();
      if (s.startsWith('[')) {
        try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) return parsed.filter(Boolean); } catch (e) { /* ignore */ }
      }
      return [val];
    }
    return [];
  };

  out.images = parseImgs(raw.images || raw.image || raw.photos || raw.pictures);
  if (!out.images || out.images.length === 0) out.images = ['https://placehold.co/400x400?text=No+Image'];

  return out;
}

export default function RelatedProducts({ category, currentId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get('/products');
        const all = res?.data?.products ?? res?.data ?? [];
        if (!mounted) return;

        const pool = Array.isArray(all) ? all : [];

        // Step A: try to pick same-category products first
        const byCategory = pool.filter((p) => p && (p.category === category || p.category_id === category) && String(p.id) !== String(currentId));
        let result = byCategory.map(normalizeProduct).filter(Boolean);

        // Step B: if fewer than 4, fill with random distinct items from pool
        if (result.length < 4) {
          const others = pool
            .filter((p) => p && String(p.id) !== String(currentId) && !result.some(r => String(r.id) === String(p.id)))
            .map(normalizeProduct)
            .filter(Boolean);

          const needed = 4 - result.length;
          const picks = [];
          const available = [...others];
          while (picks.length < needed && available.length > 0) {
            const idx = Math.floor(Math.random() * available.length);
            picks.push(available.splice(idx, 1)[0]);
          }
          result = result.concat(picks);
        }


        // Note: intentionally do not use hardcoded fallbacks — prefer real DB products only.

        if (mounted) setItems(result.slice(0, 4));
      } catch (e) {
        // robust: log error but do not crash; component will render nothing if products unavailable
        console.error('RelatedProducts load failed', e);
        if (mounted) setItems([]);
      }
    }

    load();
    return () => { mounted = false };
  }, [category, currentId]);

  if (!items || items.length === 0) return null;

  return (
    <section className="py-10">
      <h2 className="text-lg sm:text-xl font-semibold mb-6">You May Also Like</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((p) => (
          <Link
            key={p.id}
            to={`/shop/products/${p.id}`}
            className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative h-48 w-full bg-gray-50 flex items-center justify-center p-4">
              <img
                src={(p.images && p.images[0]) || 'https://placehold.co/400x400?text=No+Image'}
                alt={p.name}
                className="max-h-full w-full object-contain mix-blend-multiply"
                onError={(e) => e.target.src = 'https://placehold.co/400x400?text=No+Image'}
              />

              {/* Hover icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition">
                <span className="bg-white/90 rounded-full p-2 shadow-lg">
                  <Zap size={24} className="text-orange-500" />
                </span>
              </div>
            </div>

            <div className="p-4 text-center">
              <div className="font-bold text-sm text-gray-900 truncate">{p.name}</div>
              <div className="text-orange-600 font-bold mt-2">₦{Number(p.price || 0).toLocaleString()}</div>

              <div className="mt-4 opacity-0 group-hover:opacity-100 transition">
                <span className="inline-block bg-black text-white py-2 px-4 rounded-lg text-sm">View</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
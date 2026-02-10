import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { api } from '@/lib/api';
import AdminProductForm from './AdminProductForm';
import { useToast } from '@/context/ToastProvider';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

    // Fetch with Cache Busting
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/products?t=${Date.now()}`);
          const data = res.data?.products || res.data || [];
          const list = Array.isArray(data) ? data : [];
          setProducts(formatProducts(list));
      } catch (error) {
        console.error('Failed to load products:', error);
        toast?.showToast?.('Failed to load products', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProducts();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      setSubmitting(true);
      const res = await api.delete(`/admin/products/${id}`);
      // assume successful delete when no error thrown
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast?.showToast?.('Product deleted', { type: 'success' });
      return res;
    } catch (err) {
      console.error('Delete failed', err);
      toast?.showToast?.('Delete failed', { type: 'error' });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    if (!product) return;
    const newStatus = product.status === 'published' ? 'unpublished' : 'published';
    try {
      setSubmitting(true);
      const res = await api.patch(`/admin/products/${product.id}`, { status: newStatus });
      const updated = res?.data?.product ?? res?.data ?? { ...product, status: newStatus };
      setProducts((prev) => prev.map((p) => (p.id === product.id ? formatProduct(updated) : p)));
      toast?.showToast?.('Status updated', { type: 'success' });
      return updated;
    } catch (err) {
      console.error('Status update failed', err);
      toast?.showToast?.('Status update failed', { type: 'error' });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSuccess = async (payload) => {
    // Called by AdminProductForm when the form is submitted with a prepared payload
    try {
      setSubmitting(true);
      if (editingProduct && editingProduct.id) {
        const res = await api.patch(`/admin/products/${editingProduct.id}`, payload);
        const updated = res?.data?.product ?? res?.data ?? null;
        if (updated) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? formatProduct(updated) : p)));
          toast?.showToast?.('Product updated', { type: 'success' });
        }
      } else {
        const res = await api.post('/admin/products', payload);
        const created = res?.data?.product ?? res?.data ?? null;
        if (created) {
          setProducts((prev) => [formatProduct(created), ...prev]);
          toast?.showToast?.('Product created', { type: 'success' });
        }
      }
      // Close modal and cleanup
      setIsModalOpen(false);
      setEditingProduct(null);
      return true;
    } catch (err) {
      console.error('Save failed', err);
      toast?.showToast?.('Save failed', { type: 'error' });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Modal close helper (used for backdrop clicks and ESC)
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  // Close on ESC when modal is open
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen, closeModal]);

  const getDisplayImage = (prod) => {
    if (!prod) return 'https://placehold.co/100?text=No+Img';
    if (Array.isArray(prod.images) && prod.images.length) return prod.images[0];
    if (prod.image) return prod.image;
    try {
      const parsed = typeof prod.images === 'string' ? JSON.parse(prod.images) : null;
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch (e) {
      // ignore
    }
    return 'https://placehold.co/100?text=No+Img';
  };

  // Ensure product objects are normalized and prices parsed when they arrive from the API
  const formatProduct = (p) => {
    if (!p) return p;
    const out = { ...p };
    // price may be string like "1200" or "₦1,200" - make numeric
    try {
      const raw = String(out.price ?? '0');
      const digits = raw.replace(/[^0-9.-]+/g, '');
      out.price = Number(digits) || 0;
    } catch (e) {
      out.price = Number(out.price) || 0;
    }
    // images may be JSON string
    try {
      if (typeof out.images === 'string') out.images = JSON.parse(out.images);
    } catch (e) {
      // ignore
    }
    return out;
  };

  const formatProducts = (arr) => (Array.isArray(arr) ? arr.map(formatProduct) : []);

  const filteredProducts = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => String(p.name || '').toLowerCase().includes(q));
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <main className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Product Manager</span>
            </h2>
            <p className="text-slate-600 mt-2">Manage your store's products — create, update and publish with ease.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 shadow-sm hover:shadow-md transition-all"
            />
            <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="inline-flex items-center gap-2 bg-purple-600 text-white rounded-2xl hover:opacity-95 px-6 py-3">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader className="animate-spin" /></div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">No products found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const stock = product.stock || product.stock_count || product.quantity || 0;
                  return (
                    <div key={product.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 transform">
                      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                        <img src={getDisplayImage(product)} alt={product.name} className="w-full h-full object-cover" />

                        {/* Overlay actions */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-2 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white rounded-lg">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Stock badge bottom-left */}
                        <div className="absolute bottom-3 left-3 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-sm">
                          Stock: <span className="font-medium">{stock}</span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-2">
                        <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="font-bold">₦{Number(product.price || 0).toLocaleString()}</div>
                          <button onClick={() => handleToggleStatus(product)} className={`px-2 py-1 text-xs rounded ${product.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {product.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Modal: fixed popup with backdrop */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">Cancel</button>
              </div>
              <AdminProductForm
                initialData={editingProduct}
                onClose={closeModal}
                onSuccess={handleSaveSuccess}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
        
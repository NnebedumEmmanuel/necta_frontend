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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

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

  const formatProduct = (p) => {
    if (!p) return p;

    const out = { ...p };
    out.id = out.id || out._id;
    out.name = out.name || out.title || 'Untitled product';
    out.title = out.title || out.name;
    out.category_id = out.category_id || out.category || '';
    out.brand_id = out.brand_id || out.brand || '';
    out.collection_id = out.collection_id || '';

    try {
      const raw = String(out.price ?? '0');
      const digits = raw.replace(/[^0-9.-]+/g, '');
      out.price = Number(digits) || 0;
    } catch (e) {
      out.price = Number(out.price) || 0;
    }

    try {
      if (typeof out.images === 'string') out.images = JSON.parse(out.images);
    } catch (e) {
      // ignore
    }

    if (!Array.isArray(out.images)) out.images = [];
    return out;
  };

  const formatProducts = (arr) => (Array.isArray(arr) ? arr.map(formatProduct) : []);

  const filteredProducts = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => String(p.name || '').toLowerCase().includes(q));
  }, [products, searchQuery]);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <main className="mx-auto w-full max-w-7xl min-w-0 space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Product Manager
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Manage your store&apos;s products - create, update and publish with ease.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:min-w-[26rem] xl:justify-end">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-purple-500 sm:text-base"
            />
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:opacity-95 sm:w-auto sm:px-6 sm:text-base"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center backdrop-blur-sm">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const stock = product.stock || product.stock_count || product.quantity || 0;

                  return (
                    <div
                      key={product.id}
                      className="group w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                        <img
                          src={getDisplayImage(product)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-sm hover:bg-white"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-sm hover:bg-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3 rounded-full bg-white/60 px-3 py-1 text-xs shadow-sm backdrop-blur-sm sm:text-sm">
                          Stock: <span className="font-medium">{stock}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 p-4">
                        <h3 className="mb-1 truncate text-sm font-semibold">{product.name}</h3>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-bold">₦{Number(product.price || 0).toLocaleString()}</div>
                          <button
                            onClick={() => handleToggleStatus(product)}
                            disabled={submitting}
                            className={`rounded px-2 py-1 text-xs ${
                              product.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
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

        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
            onClick={closeModal}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                  Cancel
                </button>
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

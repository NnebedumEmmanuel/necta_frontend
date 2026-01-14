import React, { useEffect, useState, useRef } from "react";
import { useToast } from "../../context/useToastHook.js";
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const formatProducts = (products) => {
  return products.map(p => {
    const priceString = String(p.price || "");
    const oldPriceString = String(p.oldPrice || "");
    
    const price = Number(priceString.replace(/[^0-9.-]+/g, ""));
    const oldPrice = oldPriceString ? Number(oldPriceString.replace(/[^0-9.-]+/g, "")) : 0;
    
    const discPercent = oldPrice > 0 && price < oldPrice 
      ? Math.round(((oldPrice - price) / oldPrice) * 100) 
      : 0;

    return {
      ...p,
      id: p.id,
      name: p.name,
      price: price,
      oldPrice: oldPrice,
      discPercent: discPercent,
      inStock: p.inStock || Math.floor(Math.random() * 100) + 1,
      category: p.category || 'speakers',
      brand: p.brand || 'T&G',
      image: p.image || "",
      description: p.description || ""
    };
  });
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('adminProducts_searchTerm') || "");
  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem('adminProducts_selectedCategory') || "all");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', discPercent: '', inStock: '', category: 'speakers', brand: 'T&G', image: '', description: ''
  });

  const productNameInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const loadProducts = async () => {
    let mounted = true;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/products');
      // If the backend returns a non-200 status explicitly, treat as error
      if (res && typeof res.status === 'number' && res.status !== 200) {
        const msg = res?.data?.error || `Unexpected response status: ${res.status}`;
        setError(msg);
        setProducts([]);
        setFilteredProducts([]);
        return;
      }
      if (!mounted) return;
      const items = Array.isArray(res?.data?.products)
        ? res.data.products
        : res?.data ?? [];

      // Ensure we have an array before attempting to format
      if (!Array.isArray(items)) {
        const msg = 'Invalid products response';
        console.error('[admin-products] invalid products payload', { payload: res?.data })
        setError(msg);
        setProducts([]);
        setFilteredProducts([]);
        return;
      }

      const formatted = formatProducts(items);
      setProducts(formatted);

      const uniqueCategories = ["all", ...new Set(formatted.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.showToast('Unauthorized. Please login.', 'error');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.showToast('Access denied: Admins only', 'error');
        navigate('/');
        return;
      }
      console.error('Failed to load admin products', err);
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
    localStorage.setItem('adminProducts_searchTerm', searchTerm);
    localStorage.setItem('adminProducts_selectedCategory', selectedCategory);
  }, [searchTerm, selectedCategory, products]);

  const handleSearchChange = (value) => setSearchTerm(value);
  const handleCategoryChange = (value) => setSelectedCategory(value);

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-200 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-amber-200 text-amber-800' };
    return { text: 'In Stock', color: 'bg-green-200 text-green-800' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditing(false);
    setForm({ name: '', price: '', discPercent: '', inStock: '', category: 'speakers', brand: 'T&G', image: '', description: '' });
    setShowModal(true);
    setTimeout(() => productNameInputRef.current?.focus(), 100);
  };
  
  const openEditModal = (product) => {
    setEditing(true);
    setCurrentProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      discPercent: product.discPercent || 0,
      inStock: product.inStock,
      category: product.category,
      brand: product.brand,
      image: product.image,
      description: product.description
    });
    setShowModal(true);
    setTimeout(() => productNameInputRef.current?.focus(), 100);
  };

  const cancelEdit = () => {
    setShowModal(false);
    setEditing(false);
    setCurrentProduct(null);
  };

  const handleAdd = async () => {
    // Ensure required fields are present and valid
    if (!form.name) {
      toast.showToast("Please provide a product name.", { type: "error" });
      return;
    }

    // Convert price to number and validate
    const priceNumber = Number(form.price)
    if (Number.isNaN(priceNumber)) {
      toast.showToast('Price must be a valid number', { type: 'error' })
      return
    }

    // Convert stock to number (default 0)
    const stockNumber = form.inStock !== '' && form.inStock !== undefined ? Number(form.inStock) : 0
    if (form.inStock !== '' && form.inStock !== undefined && Number.isNaN(stockNumber)) {
      toast.showToast('Stock must be a valid number', { type: 'error' })
      return
    }

    // Auto-generate slug from name if missing
    const slugFromName = String(form.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // strip invalid chars except space and -
      .replace(/\s+/g, '-') // spaces -> -
      .replace(/-+/g, '-')

    const slug = slugFromName || undefined

    // Build payload, converting empty strings to undefined so the backend normalizer can drop them
    const rawPayload = {
      name: form.name || undefined,
      slug: slug,
      price: priceNumber,
      stock: Number.isFinite(stockNumber) ? stockNumber : 0,
      category: form.category || undefined,
      brand: form.brand || undefined,
      image: form.image || undefined,
      description: form.description || undefined,
      // include discount percent as provided (numeric) so callers can decide how to persist
      discPercent: form.discPercent !== '' && form.discPercent !== undefined ? Number(form.discPercent) : undefined,
    }

    // Remove properties that are explicitly empty strings or undefined to avoid sending them
    const payload = {}
    Object.keys(rawPayload).forEach((k) => {
      const v = rawPayload[k]
      if (v === undefined) return
      // avoid sending empty strings
      if (typeof v === 'string' && v.trim() === '') return
      payload[k] = v
    })

    console.log('CREATE PRODUCT PAYLOAD', payload)

    setSubmitting(true);
    try {
      const res = await api.post('/admin/products', payload);
      const status = res?.status;
      if (status === 401) {
        toast.showToast('Unauthorized. Please login.', 'error');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.showToast('Access denied: Admins only', 'error');
        navigate('/');
        return;
      }
      const product = res?.data?.product ?? null;
      if (!product) {
        const msg = res?.data?.error || 'Invalid response from server';
        toast.showToast(msg, { type: 'error' });
        return;
      }
      const formatted = formatProducts([product])[0];
      setProducts(prev => [formatted, ...prev]);
      cancelEdit();
      toast.showToast('Product added', { type: 'success' });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.showToast('Unauthorized. Please login.', 'error');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.showToast('Access denied: Admins only', 'error');
        navigate('/');
        return;
      }
      const message = err?.response?.data?.error || err?.message || 'Failed to add product';
      toast.showToast(message, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async () => {
    if (!form.name || !form.price || !form.inStock) {
      toast.showToast("Please fill all required fields.", { type: "error" });
      return;
    }
    if (!currentProduct) return;
    // compute changed fields only
    const changes = {};
    ['name','price','inStock','discPercent','oldPrice','category','brand','image','description'].forEach(k => {
      const newVal = (k === 'price' || k === 'inStock' || k === 'discPercent') ? Number(form[k]) : form[k];
      const oldVal = currentProduct[k];
      if ((newVal ?? null) !== (oldVal ?? null)) changes[k] = newVal;
    })
    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.patch(`/admin/products/${currentProduct.id}`, changes);
      const status = res?.status;
      if (status === 401) {
        toast.showToast('Unauthorized. Please login.', 'error');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.showToast('Access denied: Admins only', 'error');
        navigate('/');
        return;
      }
      const product = res?.data?.product ?? null;
      if (!product) {
        const msg = res?.data?.error || 'Invalid response from server';
        toast.showToast(msg, { type: 'error' });
        return;
      }
      const formatted = formatProducts([product])[0];
      setProducts(prev => prev.map(p => p.id === formatted.id ? formatted : p));
      cancelEdit();
      toast.showToast('Product updated', { type: 'success' });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.showToast('Unauthorized. Please login.', 'error');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.showToast('Access denied: Admins only', 'error');
        navigate('/');
        return;
      }
      const message = err?.response?.data?.error || err?.message || 'Failed to update product';
      toast.showToast(message, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await api.delete(`/admin/products/${id}`);
      const status = res?.status;
      if (status === 401) {
        toast.showToast('Unauthorized. Please login.', 'error');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.showToast('Access denied: Admins only', 'error');
        navigate('/');
        return;
      }
      const removedId = res?.data?.id ?? id;
      setProducts(prev => prev.filter(p => p.id !== removedId));
      toast.showToast("Product deleted successfully", { type: "success" });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.showToast('Unauthorized. Please login.', 'error');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.showToast('Access denied: Admins only', 'error');
        navigate('/');
        return;
      }
      const message = err?.response?.data?.error || err?.message || 'Failed to delete product';
      toast.showToast(message, { type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (product) => {
    if (!product) return
    const id = product.id
    // Draft -> Publish, Published -> Unpublish, Unpublished -> Publish
    const current = product.status || 'draft'
    let next = 'published'
    if (current === 'draft') next = 'published'
    else if (current === 'published') next = 'unpublished'
    else if (current === 'unpublished') next = 'published'

    // optimistic update
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: next } : p))
    setFilteredProducts(prev => prev.map(p => p.id === id ? { ...p, status: next } : p))

    try {
      await api.patch(`/admin/products/${id}/status`, { status: next })
      toast.showToast(`Product ${next}`, { type: 'success' })
    } catch (err) {
      // rollback on error
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: product.status } : p))
      setFilteredProducts(prev => prev.map(p => p.id === id ? { ...p, status: product.status } : p))
      const message = err?.response?.data?.error || err?.message || 'Failed to update status'
      toast.showToast(message, { type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl p-2 font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Product Manager
            </h1>
            <p className="text-slate-600 mt-2">Manage your product catalog with ease</p>
          </div>
          
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input ref={searchInputRef} type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600" title="Clear search">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            
            <div className="w-full sm:w-48">
              <div className="relative">
                <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Read-only: Add Product disabled for now */}
            <div className="w-full sm:w-auto flex items-center justify-center">
              <button onClick={openAddModal} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:opacity-95">Add Product</button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
        )}

        {error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <p className="text-lg font-semibold text-slate-700">Error loading products</p>
            <p className="text-sm text-slate-500 mt-2">{String(error)}</p>
            <div className="mt-4">
              <button onClick={loadProducts} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Retry</button>
            </div>
          </div>
        ) : !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-sm border border-slate-200">
                <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {products.length === 0 ? "No products yet" : "No products found"}
                    </h3>
                    <p className="text-slate-600 mb-6">
                        {products.length === 0 ? "Get started by adding your first product." : "Try adjusting your search or filter."}
                    </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(p => {
                  const stockStatus = getStockStatus(p.inStock);
                  
                  return (
                    <div key={p.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute top-3 left-3 right-3 flex justify-end gap-2 z-10">
                        <button onClick={() => openEditModal(p)} disabled={submitting || deletingId === p.id} className="px-2 py-1 bg-white/90 text-slate-700 rounded-md shadow-sm hover:bg-white">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} disabled={submitting || deletingId === p.id} className="px-2 py-1 bg-red-600 text-white rounded-md shadow-sm hover:opacity-95">{deletingId === p.id ? 'Deleting...' : 'Delete'}</button>
                        {/* Publish / Unpublish toggle */}
                        <button onClick={() => toggleStatus(p)} disabled={submitting || deletingId === p.id} className="px-2 py-1 bg-emerald-600 text-white rounded-md shadow-sm hover:opacity-95">
                          {p.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400"></div>
                        )}
                        
                        {p.discPercent > 0 && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            -{p.discPercent}%
                          </div>
                        )}
                        
                      {/* read-only: no edit/delete actions */}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${stockStatus.color} backdrop-blur-sm`}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight h-14">{p.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-slate-600">{p.category}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'published' ? 'bg-green-100 text-green-800' : p.status === 'unpublished' ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1)) : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-slate-900">₦{p.price.toLocaleString()}</p>
                            {p.discPercent > 0 && p.oldPrice > 0 && (
                              <p className="text-sm text-slate-500 line-through">₦{p.oldPrice.toLocaleString()}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-700">Stock</p>
                            <p className="text-lg font-bold text-slate-900">{p.inStock}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

            {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={cancelEdit} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl z-50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{editing ? 'Edit product' : 'Add product'}</h3>
                <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-700">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Name</label>
                  <input ref={productNameInputRef} name="name" value={form.name} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Price (₦)</label>
                  <input name="price" value={form.price} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Discount %</label>
                  <input name="discPercent" value={form.discPercent} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">In Stock</label>
                  <input name="inStock" value={form.inStock} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Category</label>
                  <input name="category" value={form.category} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Brand</label>
                  <input name="brand" value={form.brand} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-600">Image URL</label>
                  <input name="image" value={form.image} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-600">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full mt-1 p-3 border rounded-lg" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={cancelEdit} disabled={submitting} className="px-4 py-2 bg-white border rounded-lg">Cancel</button>
                <button onClick={editing ? saveEdit : handleAdd} disabled={submitting} className="px-4 py-2 bg-purple-600 text-white rounded-lg">{submitting ? (editing ? 'Saving...' : 'Adding...') : (editing ? 'Save' : 'Add')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState, useRef } from "react";
import { useToast } from "../../context/useToastHook.js";
import { api } from '../../lib/api';

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
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', discPercent: '', inStock: '', category: 'speakers', brand: 'T&G', image: '', description: ''
  });

  const productNameInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    api.get('/admin/products')
      .then((res) => {
        if (!mounted) return;
        const items = Array.isArray(res?.data?.products)
          ? res.data.products
          : res?.data ?? [];
        const formatted = formatProducts(items);
        setProducts(formatted);

        const uniqueCategories = ["all", ...new Set(formatted.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401) {
          showToast('Unauthorized. Please login.', 'error');
          navigate('/login');
          return;
        }
        if (status === 403) {
          showToast('Access denied: Admins only', 'error');
          navigate('/');
          return;
        }
        console.error('Failed to load admin products', err);
        setError(err?.message || 'Failed to load products');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false };
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

  const handleAdd = () => {
    if (!form.name || !form.price || !form.inStock) {
      toast.showToast("Please fill all required fields.", { type: "error" });
      return;
    }
    const newProduct = {
      id: Date.now(),
      ...form,
      price: Number(form.price),
      inStock: Number(form.inStock),
      discPercent: Number(form.discPercent) || 0,
      oldPrice: form.discPercent > 0 ? Math.round(Number(form.price) / (1 - Number(form.discPercent) / 100)) : 0
    };
    setProducts(prev => [newProduct, ...prev]);
    cancelEdit();
    toast.showToast("Product added successfully!", { type: "success" });
  };

  const saveEdit = () => {
    if (!form.name || !form.price || !form.inStock) {
      toast.showToast("Please fill all required fields.", { type: "error" });
      return;
    }
    setProducts(prev => prev.map(p => p.id === currentProduct.id ? { 
        ...p, 
        ...form, 
        price: Number(form.price), 
        inStock: Number(form.inStock), 
        discPercent: Number(form.discPercent) || 0,
        oldPrice: form.discPercent > 0 ? Math.round(Number(form.price) / (1 - Number(form.discPercent) / 100)) : 0
    } : p));
    cancelEdit();
    toast.showToast("Product updated successfully!", { type: "success" });
  };
  
  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setProducts(products.filter(p => p.id !== id));
      toast.showToast("Product deleted successfully", { type: "success" });
    }
  };

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
              <div className="px-4 py-2 text-sm text-slate-500 rounded-2xl">Read-only</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
        )}

        {!loading && (
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
                          <p className="text-sm text-slate-600 mt-1">{p.category}</p>
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
          <div className="hidden" />
        )}
      </div>
    </div>
  );
}
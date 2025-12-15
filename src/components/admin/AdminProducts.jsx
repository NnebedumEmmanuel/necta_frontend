import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../../../services/authServices";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [realProduct, setRealProduct] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Initialize searchTerm from localStorage if exists
  const [searchTerm, setSearchTerm] = useState(() => {
    const saved = localStorage.getItem('adminProducts_searchTerm');
    return saved || "";
  });
  // Initialize category from localStorage if exists
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const saved = localStorage.getItem('adminProducts_selectedCategory');
    return saved || "all";
  });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, discPercent: 0, inStock: 0, category: "", image: "" });
  const [loading, setLoading] = useState(false);

  // Create refs for auto-focusing inputs
  const searchInputRef = useRef(null);
  const productNameInputRef = useRef(null);

  // Save searchTerm to localStorage whenever it changes
  useEffect(() => {
    if (searchTerm !== undefined) {
      localStorage.setItem('adminProducts_searchTerm', searchTerm);
    }
  }, [searchTerm]);

  // Save selectedCategory to localStorage whenever it changes
  useEffect(() => {
    if (selectedCategory !== undefined) {
      localStorage.setItem('adminProducts_selectedCategory', selectedCategory);
    }
  }, [selectedCategory]);

  // Fetch products from API
  const fetchProduct = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      const response = await axios.get("https://dummyjson.com/products", {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });
      console.log("products from axios call", response.data);
      
      // Map API response to match our product structure
      const mappedProducts = response.data.products.map(product => ({
        id: product.id,
        name: product.title,
        price: product.price,
        discPercent: Math.round(product.discountPercentage) || 0,
        inStock: product.stock || product.inStock || 1,
        category: product.category,
        image: product.thumbnail || product.images?.[0] || "", // Use thumbnail or first image
        description: product.description
      }));
      
      setRealProduct(mappedProducts);
      setProducts(mappedProducts);
      // Don't set filteredProducts here - let the useEffect handle it
      console.log("Mapped products:", mappedProducts);
    } catch (error) {
      console.error('Error:', error);
      // Fallback to local products if API fails
      const productsData = getProducts();
      setProducts(productsData);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProduct();
    setLoading(false);
  }, []);

  // Auto-focus search input on component mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Auto-focus product name input when modal opens
  useEffect(() => {
    if (showModal && productNameInputRef.current) {
      setTimeout(() => {
        productNameInputRef.current?.focus();
      }, 100);
    }
  }, [showModal]);

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // Custom setter for searchTerm that also saves to localStorage
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Custom setter for selectedCategory that also saves to localStorage
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === "number" ? Number(value) : value }));
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (form.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      addProduct(form);
      const updatedProducts = getProducts();
      setProducts(updatedProducts);
      setForm({ name: "", price: 0, discPercent: 0, inStock: 0, category: "", image: "" });
      setShowModal(false);
      setEditing(null);
      setLoading(false);
    }, 800);
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ ...p });
    setShowModal(true);
  };

  const saveEdit = async () => {
    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (form.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      updateProduct(editing, form);
      const updatedProducts = getProducts();
      setProducts(updatedProducts);
      setEditing(null);
      setForm({ name: "", price: 0, discPercent: 0, inStock: 0, category: "", image: "" });
      setShowModal(false);
      setLoading(false);
    }, 800);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: "", price: 0, discPercent: 0, inStock: 0, category: "", image: "" });
    setShowModal(false);
  };

  const remove = (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    deleteProduct(id);
    const updatedProducts = getProducts();
    setProducts(updatedProducts);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-500/10 text-red-600 border border-red-200" };
    if (stock < 10) return { text: "Low Stock", color: "bg-amber-500/10 text-amber-600 border border-amber-200" };
    return { text: "In Stock", color: "bg-emerald-500/10 text-emerald-600 border border-emerald-200" };
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: "", price: 0, discPercent: 0, inStock: 0, category: "", image: "" });
    setShowModal(true);
  };

  // Clear search function
  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    // Also clear from localStorage
    localStorage.removeItem('adminProducts_searchTerm');
    localStorage.removeItem('adminProducts_selectedCategory');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl p-2  font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Product Manager
            </h1>
            <p className="text-slate-600 mt-2">Manage your product catalog with ease</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products or categories..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-48">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== "all").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Add Product Button */}
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Stats Card - Show filtered results info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Showing</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{filteredProducts.length}</p>
                {(searchTerm || selectedCategory !== "all") && (
                  <p className="text-xs text-slate-500 mt-1">
                    {searchTerm && `Search: "${searchTerm}"`}
                    {searchTerm && selectedCategory !== "all" && " • "}
                    {selectedCategory !== "all" && `Category: ${selectedCategory}`}
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{categories.length - 1}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {products.filter(p => p.inStock > 0 && p.inStock < 10).length}
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-sm border border-slate-200">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {products.length === 0 ? "No products yet" : "No products found"}
              </h3>
              <p className="text-slate-600 mb-6">
                {products.length === 0 
                  ? "Get started by adding your first product to the catalog." 
                  : "Try adjusting your search or filter criteria."}
              </p>
              <button
                onClick={openAddModal}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Your First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => {
              const stockStatus = getStockStatus(p.inStock);
              const originalPrice = p.discPercent > 0 ? Math.round(p.price / (1 - p.discPercent / 100)) : p.price;
              
              return (
                <div key={p.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {p.discPercent > 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{p.discPercent}%
                      </div>
                    )}
                    
                    {/* Stock Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${stockStatus.color} backdrop-blur-sm`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight">{p.name}</h3>
                      {p.category && (
                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {p.category}
                        </p>
                      )}
                    </div>

                    {/* Price Section */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">${p.price}</p>
                        {p.discPercent > 0 && (
                          <p className="text-sm text-slate-500 line-through">${originalPrice}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">Stock</p>
                        <p className="text-lg font-bold text-slate-900">{p.inStock} units</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => startEdit(p)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Add/Edit Product */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {editing ? "Edit Product" : "Create Product"}
                    </h2>
                    <p className="text-slate-600 mt-1">
                      {editing ? "Update product details" : "Add a new product to your catalog"}
                    </p>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                  >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Product Name *</label>
                    <input
                      ref={productNameInputRef}
                      name="name"
                      placeholder="Enter product name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Price ($) *</label>
                    <input
                      name="price"
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Discount (%)</label>
                    <input
                      name="discPercent"
                      type="number"
                      placeholder="0"
                      value={form.discPercent}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Stock Quantity *</label>
                    <input
                      name="inStock"
                      type="number"
                      placeholder="0"
                      value={form.inStock}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Category</label>
                    <input
                      name="category"
                      placeholder="e.g., Electronics, Clothing"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Image URL</label>
                    <input
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={form.image}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  {!editing ? (
                    <button
                      onClick={handleAdd}
                      disabled={loading}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-sm flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding Product...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Product
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-sm flex-1"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add these styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
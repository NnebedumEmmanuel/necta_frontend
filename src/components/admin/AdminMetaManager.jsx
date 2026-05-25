import React, { useState, useEffect } from 'react';
import { Tag, LayoutGrid, Award, Plus, Trash2, ToggleLeft, ToggleRight, Loader, Eye, X, Search, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastProvider';

export default function AdminMetaManager() {
  const [activeTab, setActiveTab] = useState('categories'); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [selectedMeta, setSelectedMeta] = useState(null);
  const [metaProducts, setMetaProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [showAttachUI, setShowAttachUI] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);

  const tabs = [
    { id: 'categories', label: 'Categories', icon: LayoutGrid, path: '/admin/categories', queryParam: 'category' },
    { id: 'brands', label: 'Brands', icon: Award, path: '/admin/brands', queryParam: 'brand' },
    { id: 'collections', label: 'Collections', icon: Tag, path: '/admin/collections', queryParam: 'collection' },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const res = await api.get(currentTab.path);
      setItems(res.data || []);
    } catch (err) {
      showToast("Failed to fetch " + activeTab, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [activeTab]);

  const handleToggleSoon = async (item) => {
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const newStatus = !item.isComingSoon;
      const itemId = item._id || item.id; 
      
      if (!itemId) return showToast("Error: Missing Item ID", { type: 'error' });

      setItems(prev => prev.map(i => (i._id || i.id) === itemId ? { ...i, isComingSoon: newStatus } : i));
      await api.patch(`${currentTab.path}/${itemId}`, { isComingSoon: newStatus });
      showToast(`${item.name} updated`, { type: 'success' });
    } catch (err) {
      showToast("Update failed", { type: 'error' });
      fetchItems(); 
    }
  };

  const openProductsModal = async (item) => {
    setSelectedMeta(item);
    setShowAttachUI(false); 
    setSearchQuery('');
    setLoadingProducts(true);
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const res = await api.get(`/products?${currentTab.queryParam}=${item.slug}`);
      const productArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setMetaProducts(productArray);
    } catch (error) {
      showToast("Failed to load attached products", { type: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  };

  const openAttachUI = async () => {
    setShowAttachUI(true);
    setLoadingProducts(true);
    try {
      const res = await api.get('/products?limit=100'); 
      const productArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setAllProducts(productArray);
    } catch (error) {
      showToast("Failed to fetch products for searching", { type: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  };

  const attachProductToMeta = async (product) => {
    setIsAttaching(true);
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const metaId = selectedMeta._id || selectedMeta.id;
      const productId = product._id || product.id;

      await api.patch(`/products/${productId}`, { [currentTab.queryParam]: metaId });
      showToast(`${product.name} attached successfully!`, { type: 'success' });
      
      openProductsModal(selectedMeta);
    } catch (error) {
      showToast("Failed to attach product", { type: 'error' });
      setIsAttaching(false);
    }
  };

  // 🚨 NEW: Unlink Product Function
  const unlinkProductFromMeta = async (product) => {
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const productId = product._id || product.id;

      // Send a PATCH to overwrite the category/brand with "unassigned"
      await api.patch(`/products/${productId}`, { [currentTab.queryParam]: "unassigned" });
      showToast(`${product.name} removed from tag!`, { type: 'success' });
      
      // Instantly remove it from the screen
      setMetaProducts(prev => prev.filter(p => (p._id || p.id) !== productId));
    } catch (error) {
      showToast("Failed to remove product", { type: 'error' });
    }
  };

  const filteredSearchProducts = allProducts.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !metaProducts.find(mp => (mp._id || mp.id) === (p._id || p.id))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 px-2 transition-all ${
              activeTab === tab.id ? 'border-b-2 border-orange-600 text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Name</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
           {loading ? (
              <tr><td colSpan="3" className="p-12 text-center"><Loader className="animate-spin mx-auto text-orange-600" /></td></tr>
            ) : items.map(item => (
              <tr key={item._id || item.id} className="border-b hover:bg-slate-50/50">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4">
                  <button 
                    onClick={() => handleToggleSoon(item)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      item.isComingSoon ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.isComingSoon ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                    {item.isComingSoon ? 'Coming Soon' : 'Active'}
                  </button>
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-3">
                   <button 
                     onClick={() => openProductsModal(item)}
                     className="text-orange-600 hover:text-orange-800 flex items-center gap-1 text-sm font-bold bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                   >
                     <Eye size={16}/> View Products
                   </button>
                   <button className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMeta && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            
            <div className="p-6 border-b flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                {showAttachUI && (
                  <button onClick={() => setShowAttachUI(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {showAttachUI ? `Attach to "${selectedMeta.name}"` : `Products in "${selectedMeta.name}"`}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {showAttachUI ? "Search and select a product to link it" : `Manage items attached to this ${activeTab.slice(0, -1)}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedMeta(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {loadingProducts ? (
                 <div className="py-12 flex justify-center"><Loader className="animate-spin text-orange-600" size={32} /></div>
              ) : showAttachUI ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search existing products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {filteredSearchProducts.length === 0 ? (
                      <p className="text-center text-slate-500 py-6 font-medium">No available products found.</p>
                    ) : (
                      filteredSearchProducts.map(prod => (
                        <div key={prod.id || prod._id} className="flex gap-3 items-center bg-white border rounded-xl p-3 hover:border-orange-300 transition-all shadow-sm">
                          <img src={prod.images?.[0] || 'https://placehold.co/100'} alt={prod.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{prod.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">₦{Number(prod.price || 0).toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => attachProductToMeta(prod)}
                            disabled={isAttaching}
                            className="bg-slate-100 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                          >
                            Attach
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                metaProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <LayoutGrid size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">No products attached yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {metaProducts.map(prod => (
                      <div key={prod.id || prod._id} className="relative flex gap-3 items-center bg-white border rounded-xl p-3 hover:border-orange-300 transition-colors shadow-sm group">
                        <img src={prod.images?.[0] || 'https://placehold.co/100'} alt={prod.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 truncate">{prod.name}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">₦{Number(prod.price || 0).toLocaleString()}</p>
                        </div>
                        
                        {/* 🚨 NEW: Unlink Button (Hover to reveal) */}
                        <button 
                          onClick={() => unlinkProductFromMeta(prod)}
                          className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                          title="Remove from tag"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {!showAttachUI && (
              <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{metaProducts.length} items total</span>
                  
                  <button 
                    onClick={openAttachUI}
                    className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-md"
                  >
                    <Plus size={18} /> Add Product
                  </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
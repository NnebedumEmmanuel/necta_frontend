import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Eye,
  LayoutGrid,
  Loader,
  Plus,
  Search,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastProvider';

const tabs = [
  {
    id: 'categories',
    label: 'Categories',
    singular: 'category',
    icon: LayoutGrid,
    path: '/admin/categories',
    responseKey: 'categories',
    itemKey: 'category',
    productField: 'category',
  },
  {
    id: 'brands',
    label: 'Brands',
    singular: 'brand',
    icon: Award,
    path: '/admin/brands',
    responseKey: 'brands',
    itemKey: 'brand',
    productField: 'brand',
  },
  {
    id: 'collections',
    label: 'Collections',
    singular: 'collection',
    icon: Tag,
    path: '/admin/collections',
    responseKey: 'collections',
    itemKey: 'collection',
    productField: 'collection',
  },
];

function showToast(toastApi, message, type = 'info') {
  toastApi?.showToast?.(message, type);
}

function unwrapList(res, key) {
  const data = res?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function unwrapProducts(res) {
  const data = res?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getProductTagValue(product, field) {
  if (field === 'category') return product.category_id || product.category || '';
  if (field === 'brand') return product.brand_id || product.brand || '';
  return product.collection_id || '';
}

function getProductImage(product) {
  if (Array.isArray(product?.images) && product.images[0]) return product.images[0];
  if (typeof product?.image === 'string' && product.image) return product.image;
  return 'https://placehold.co/100?text=No+Image';
}

function getItemId(item) {
  return item?.id || item?._id || item?.slug;
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusClasses(isComingSoon) {
  return isComingSoon
    ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700';
}

function getStatusLabel(isComingSoon) {
  return isComingSoon ? 'Coming Soon' : 'Active';
}

export default function AdminMetaManager() {
  const [activeTab, setActiveTab] = useState('categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [metaProducts, setMetaProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAttachUI, setShowAttachUI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [attachingId, setAttachingId] = useState(null);
  const [unlinkingId, setUnlinkingId] = useState(null);
  const toastApi = useToast();

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(currentTab.path);
      const extractedItems = unwrapList(res, currentTab.responseKey);
      setItems(Array.isArray(extractedItems) ? extractedItems : []);
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}`, error);
      showToast(toastApi, `Failed to fetch ${currentTab.label}`, 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedMeta(null);
    setMetaProducts([]);
    setAllProducts([]);
    setShowAttachUI(false);
    setSearchQuery('');
    fetchItems();
  }, [activeTab]);

  const fetchProducts = async (limit = 100) => {
    const res = await api.get('/admin/products', { params: { limit, t: Date.now() } });
    return unwrapProducts(res);
  };

  const filterProductsForMeta = (products, meta) => {
    const metaValues = new Set([meta?.id, meta?._id, meta?.slug].filter(Boolean).map(String));
    return products.filter((product) => metaValues.has(String(getProductTagValue(product, currentTab.productField))));
  };

  const refreshMetaProducts = async (meta = selectedMeta) => {
    if (!meta) return [];

    setLoadingProducts(true);
    try {
      const products = await fetchProducts();
      setMetaProducts(filterProductsForMeta(products, meta));
      return products;
    } catch (error) {
      console.error('Failed to load attached products', error);
      showToast(toastApi, 'Failed to load attached products', 'error');
      return [];
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleToggleSoon = async (item) => {
    const itemId = getItemId(item);
    if (!itemId) {
      showToast(toastApi, 'Missing item id', 'error');
      return;
    }

    const isComingSoon = !Boolean(item.isComingSoon);
    setUpdatingId(itemId);
    setItems((rows) => rows.map((row) => (getItemId(row) === itemId ? { ...row, isComingSoon } : row)));

    try {
      const res = await api.patch(`${currentTab.path}/${itemId}`, { isComingSoon });
      const updated = res?.data?.[currentTab.itemKey] ?? null;
      if (updated) {
        setItems((rows) => rows.map((row) => (getItemId(row) === itemId ? updated : row)));
      }
      showToast(toastApi, `${item.name} updated`, 'success');
    } catch (error) {
      console.error('Tag status update failed', error);
      showToast(toastApi, 'Update failed', 'error');
      fetchItems();
    } finally {
      setUpdatingId(null);
    }
  };

  const openProductsModal = async (item) => {
    setSelectedMeta(item);
    setShowAttachUI(false);
    setSearchQuery('');
    await refreshMetaProducts(item);
  };

  const closeModal = () => {
    setSelectedMeta(null);
    setShowAttachUI(false);
    setSearchQuery('');
    setAllProducts([]);
  };

  const openAttachUI = async () => {
    setShowAttachUI(true);
    setSearchQuery('');
    setLoadingProducts(true);
    try {
      const products = await fetchProducts();
      setAllProducts(products);
      setMetaProducts(filterProductsForMeta(products, selectedMeta));
    } catch (error) {
      console.error('Failed to fetch products for attaching', error);
      showToast(toastApi, 'Failed to fetch products', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const syncProductTag = async (product, value, mode) => {
    const productId = product?.id || product?._id;
    if (!productId) {
      showToast(toastApi, 'Missing product id', 'error');
      return;
    }

    if (mode === 'attach') setAttachingId(productId);
    if (mode === 'unlink') setUnlinkingId(productId);

    try {
      await api.patch(`/admin/products/${productId}/tags`, {
        field: currentTab.productField,
        value,
      });
      showToast(
        toastApi,
        mode === 'attach' ? `${product.name || product.title} attached` : `${product.name || product.title} removed`,
        'success'
      );
      const products = await refreshMetaProducts(selectedMeta);
      if (mode === 'attach') setAllProducts(products);
    } catch (error) {
      console.error('Product tag sync failed', error);
      showToast(toastApi, error?.response?.data?.error || 'Failed to update product tag', 'error');
    } finally {
      setAttachingId(null);
      setUnlinkingId(null);
    }
  };

  const attachProductToMeta = (product) => {
    const tagValue = selectedMeta?.slug || selectedMeta?.id || selectedMeta?._id || '';
    syncProductTag(product, tagValue, 'attach');
  };

  const unlinkProductFromMeta = (product) => {
    syncProductTag(product, '', 'unlink');
  };

  const attachedIds = useMemo(
    () => new Set(metaProducts.map((product) => String(product.id || product._id))),
    [metaProducts]
  );

  const filteredSearchProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allProducts.filter((product) => {
      const productId = String(product.id || product._id);
      if (attachedIds.has(productId)) return false;
      if (!query) return true;
      return String(product.name || product.title || '').toLowerCase().includes(query);
    });
  }, [allProducts, attachedIds, searchQuery]);

  const renderState = (message) => (
    <div className="p-8 text-center text-sm font-medium text-slate-500 sm:p-12">{message}</div>
  );

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Store Tags</h1>
        <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
          Manage categories, brands, collections, and the products attached to them.
        </p>
      </div>

      <div className="border-b border-slate-200">
        <div className="-mb-px flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="mx-auto animate-spin text-orange-600" />
          </div>
        ) : items.length === 0 ? (
          renderState(`No ${currentTab.label.toLowerCase()} found.`)
        ) : (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {items.map((item) => {
                const itemId = getItemId(item);

                return (
                  <article key={itemId} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900" title={item.name}>
                          {item.name}
                        </h3>
                        <p className="mt-1 break-all text-xs text-slate-500">{item.slug || '-'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openProductsModal(item)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSoon(item)}
                        disabled={updatingId === itemId}
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${getStatusClasses(
                          item.isComingSoon
                        )}`}
                      >
                        {item.isComingSoon ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                        {updatingId === itemId ? 'Updating...' : getStatusLabel(item.isComingSoon)}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="[&>th]:whitespace-nowrap">
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">Slug</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const itemId = getItemId(item);

                    return (
                      <tr key={itemId} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{item.slug || '-'}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleSoon(item)}
                            disabled={updatingId === itemId}
                            title="Toggle status"
                            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                              item.isComingSoon
                            )}`}
                          >
                            {item.isComingSoon ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                            {updatingId === itemId ? 'Updating...' : getStatusLabel(item.isComingSoon)}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openProductsModal(item)}
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 hover:text-orange-700"
                          >
                            <Eye size={16} />
                            View Products
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selectedMeta && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-3 sm:p-4"
          onClick={closeModal}
        >
          <div className="flex h-full items-center justify-center">
            <div
              className="flex max-h-[88vh] w-full max-w-3xl min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:p-6">
                <div className="flex min-w-0 items-start gap-3">
                  {showAttachUI && (
                    <button
                      type="button"
                      onClick={() => setShowAttachUI(false)}
                      className="mt-0.5 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                      {showAttachUI ? `Attach to "${selectedMeta.name}"` : `Products in "${selectedMeta.name}"`}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {showAttachUI
                        ? 'Search and select a product to link it.'
                        : `Manage products attached to this ${currentTab.singular}.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
                {loadingProducts ? (
                  <div className="flex justify-center py-12">
                    <Loader className="animate-spin text-orange-600" size={32} />
                  </div>
                ) : showAttachUI ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search existing products..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none transition focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-3">
                      {filteredSearchProducts.length === 0 ? (
                        <p className="py-6 text-center text-sm font-medium text-slate-500">
                          No available products found.
                        </p>
                      ) : (
                        filteredSearchProducts.map((product) => {
                          const productId = product.id || product._id;

                          return (
                            <div
                              key={productId}
                              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-orange-300 sm:flex-row sm:items-center"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name || product.title}
                                  className="h-12 w-12 rounded-lg bg-slate-100 object-cover"
                                />
                                <div className="min-w-0">
                                  <h4 className="truncate text-sm font-semibold text-slate-900">
                                    {product.name || product.title}
                                  </h4>
                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    {formatCurrency(product.price || 0)}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => attachProductToMeta(product)}
                                disabled={attachingId === productId}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50 sm:w-auto"
                              >
                                {attachingId === productId ? 'Attaching...' : 'Attach'}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : metaProducts.length === 0 ? (
                  <div className="py-12 text-center">
                    <LayoutGrid size={48} className="mx-auto mb-3 text-slate-200" />
                    <p className="font-medium text-slate-500">No products attached yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {metaProducts.map((product) => {
                      const productId = product.id || product._id;

                      return (
                        <div
                          key={productId}
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-orange-300 sm:flex-row sm:items-center"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <img
                              src={getProductImage(product)}
                              alt={product.name || product.title}
                              className="h-16 w-16 rounded-lg bg-slate-100 object-cover"
                            />
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-semibold text-slate-900">
                                {product.name || product.title}
                              </h4>
                              <p className="mt-1 text-xs font-medium text-slate-500">
                                {formatCurrency(product.price || 0)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => unlinkProductFromMeta(product)}
                            disabled={unlinkingId === productId}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 sm:w-auto"
                          >
                            <Trash2 size={16} />
                            {unlinkingId === productId ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {!showAttachUI && (
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <span className="text-sm font-medium text-slate-500">
                    {metaProducts.length} product{metaProducts.length === 1 ? '' : 's'} attached
                  </span>
                  <button
                    type="button"
                    onClick={openAttachUI}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-700 sm:w-auto"
                  >
                    <Plus size={18} />
                    Add Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
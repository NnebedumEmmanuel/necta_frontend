import React, { useState, useEffect, useCallback } from 'react'
import { X, Plus, Trash2, Upload, Loader } from 'lucide-react'
import { api } from '@/lib/api'

const ORANGE = '#FF6B00'

export default function AdminProductForm({ onClose, onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [specs, setSpecs] = useState([{ key: '', value: '' }])

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: '',
    stock: '',
    collection_id: '',
    category_id: '',
    brand_id: '',
    description: '',
    short_description: '',
    images: []
  })

  useEffect(() => {
    if (!initialData) return

    const parseImages = (imgs) => {
      if (!imgs) return []
      if (Array.isArray(imgs)) return imgs
      try { return JSON.parse(imgs) } catch (e) { return [] }
    }

    setFormData({
      name: initialData.name || '',
      price: initialData.price ?? '',
      discount: initialData.discount ?? '',
      stock: initialData.stock ?? '',
      collection_id: initialData.collection_id || '',
      category_id: initialData.category_id || '',
      brand_id: initialData.brand_id || '',
      description: initialData.description || '',
      short_description: initialData.short_description || '',
      images: parseImages(initialData.images)
    })

    if (initialData.specs) {
      try {
        const parsed = typeof initialData.specs === 'string' ? JSON.parse(initialData.specs) : initialData.specs
        const formatted = Object.entries(parsed || {}).map(([k, v]) => ({ key: k, value: String(v) }))
        if (formatted.length > 0) setSpecs(formatted)
      } catch (e) {
        // ignore
      }
    }
  }, [initialData])

  useEffect(() => {
    let mounted = true

    const fetchAll = async () => {
      try {
        const [colsRes, catsRes, brandsRes] = await Promise.all([
          api.get('/collections'),
          api.get('/categories'),
          api.get('/admin/brands')
        ])

        if (!mounted) return
        const colsData = colsRes?.data?.collections ?? []
        const catsData = catsRes?.data?.categories ?? []
        const brandsList = brandsRes?.data?.brands ?? []

        setCollections(Array.isArray(colsData) ? colsData : [])
        setCategories(Array.isArray(catsData) ? catsData : [])
        setBrands(Array.isArray(brandsList) ? brandsList : [])
      } catch (err) {
        console.error('Failed to fetch collections/categories/brands', err)
        if (mounted) {
          setCollections([])
          setCategories([])
          setBrands([])
        }
      }
    }

    fetchAll()
    return () => { mounted = false }
  }, [])

  const handleAddBrand = async () => {
    const name = window.prompt('Enter new brand name')
    if (!name || !name.trim()) return
    try {
      const res = await api.post('/admin/brands', { name: name.trim() })
      const created = res?.data?.brand
      if (created && created.id) {
        setBrands(prev => [...prev, created])
        setFormData(prev => ({ ...prev, brand_id: created.id }))
      } else {
        alert('Failed to create brand')
      }
    } catch (err) {
      console.error('create brand failed', err)
      alert('Failed to create brand: ' + (err?.response?.data?.error || err.message || String(err)))
    }
  }

  const handleAddNewCategory = async () => {
    const name = window.prompt('Enter new category name')
    if (!name || !name.trim()) return
    try {
      const res = await api.post('/admin/categories', { name: name.trim() })
      const created = res?.data?.category
      if (created && created.id) {
        setCategories(prev => [...prev, created])
        setFormData(prev => ({ ...prev, category_id: created.id }))
      } else {
        alert('Failed to create category')
      }
    } catch (err) {
      console.error('create category failed', err)
      alert('Failed to create category: ' + (err?.response?.data?.error || err.message || String(err)))
    }
  }

  const handleAddNewCollection = async () => {
    const name = window.prompt('Enter new collection name')
    if (!name || !name.trim()) return
    try {
      // POST to admin collections endpoint
      const res = await api.post('/admin/collections', { name: name.trim() })
      const created = res?.data?.collection
      if (created && created.id) {
        setCollections(prev => [...prev, created])
        setFormData(prev => ({ ...prev, collection_id: created.id }))
      } else {
        alert('Failed to create collection')
      }
    } catch (err) {
      console.error('create collection failed', err)
      alert('Failed to create collection: ' + (err?.response?.data?.error || err.message || String(err)))
    }
  }

  const setField = useCallback((name, value) => setFormData(prev => ({ ...prev, [name]: value })), [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setField(name, value)
  }

  const handleSpecChange = (index, field, value) => {
    const copy = [...specs]
    copy[index][field] = value
    setSpecs(copy)
  }

  const addSpec = () => setSpecs(prev => ([...prev, { key: '', value: '' }]))
  const removeSpec = (index) => setSpecs(prev => prev.filter((_, i) => i !== index))

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return []
    setUploading(true)
    const uploaded = []
    try {
      // Upload files via server-side proxy to avoid client-side CORS issues
      for (const file of Array.from(files)) {
        try {
          const fd = new FormData()
          fd.append('file', file, file.name)
          const res = await fetch('/api/upload', { method: 'POST', body: fd })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            console.error('Upload failed', err)
            alert('Image upload failed: ' + (err?.error || res.statusText))
            continue
          }
          const json = await res.json()
          if (json && json.url) uploaded.push(json.url)
        } catch (e) {
          console.error('uploadFiles: network/error', e)
          alert('Image upload failed: ' + (e?.message || String(e)))
        }
      }
    } catch (err) {
      console.error('uploadFiles', err)
    } finally {
      setUploading(false)
    }
    return uploaded
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const dt = e.dataTransfer
    if (!dt) return
    const files = dt.files
    const urls = await uploadFiles(files)
    if (urls.length > 0) setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))
  }

  const handleImageSelect = async (e) => {
    const files = e.target.files
    const urls = await uploadFiles(files)
    if (urls.length > 0) setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))
    if (e.target) e.target.value = ''
  }

  const removeImage = (idx) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // build specs object
      const specsJson = specs.reduce((acc, cur) => {
        if (cur.key && cur.key.trim()) acc[cur.key.trim()] = cur.value
        return acc
      }, {})

      const payload = {
        ...formData,
        price: formData.price === '' ? null : Number(formData.price),
        discount: formData.discount === '' ? 0 : Number(formData.discount),
        stock: formData.stock === '' ? 0 : Number(formData.stock),
        specs: specsJson,
        images: formData.images
      }

      // Validation: category required
      if (!payload.category_id || String(payload.category_id).trim() === '') {
        alert('Please select a Category for the product.')
        setLoading(false)
        return
      }

      if (onSuccess && typeof onSuccess === 'function') {
        await onSuccess(payload)
      }
      onClose && onClose()
    } catch (err) {
      console.error('submit error', err)
      alert('Failed to save product: ' + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
        <h2 className="text-2xl font-extrabold text-black tracking-tight">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
          <X size={20} className="text-black" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Product Name</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Wireless Headphones" className={`w-full rounded-xl bg-gray-50 p-4 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Brand</label>
            <div className="flex items-center gap-2">
              <select name="brand_id" value={formData.brand_id} onChange={handleChange} className={`flex-1 rounded-xl bg-gray-50 p-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`}>
                <option value="">Select a Brand (optional)</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button type="button" onClick={handleAddBrand} title="Add brand" className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
                <Plus size={16} className="text-[#FF6B00]" />
              </button>
            </div>
          </div>
        </div>

        {/* Category & Collection side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <select name="category_id" value={formData.category_id} onChange={handleChange} required className={`flex-1 rounded-xl bg-gray-50 p-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`}>
                <option value="">Select a Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={handleAddNewCategory} title="Add category" className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
                <Plus size={16} className="text-[#FF6B00]" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Collection</label>
            <div className="flex items-center gap-2">
              <select name="collection_id" value={formData.collection_id} onChange={handleChange} className={`flex-1 rounded-xl bg-gray-50 p-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`}>
                <option value="">Select a Collection</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={handleAddNewCollection} title="Add collection" className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
                <Plus size={16} className="text-[#FF6B00]" />
              </button>
            </div>
          </div>
        </div>

        {/* Price / Discount / Stock grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Price (₦)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className={`w-full rounded-xl bg-gray-50 p-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Discount (%)</label>
            <input type="number" name="discount" value={formData.discount} onChange={handleChange} placeholder="0" className={`w-full rounded-xl bg-gray-50 p-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Stock</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" className={`w-full rounded-xl bg-gray-50 p-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`} />
          </div>
        </div>

        {/* Image dropzone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">Product Images</label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 h-40 flex items-center justify-center p-4 transition hover:border-[${ORANGE}] hover:bg-white`}>
            <div className="text-center">
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-[#FF6B00]"><Loader className="animate-spin" /> Uploading...</div>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-500" />
                  <div className="mt-2 text-sm text-gray-600">Drag & drop files here, or <label className="text-[#FF6B00] font-semibold cursor-pointer">browse<input type="file" multiple className="hidden" onChange={handleImageSelect} /></label></div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {formData.images && formData.images.map((url, idx) => (
              <div key={idx} className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-100 group">
                <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`w-full rounded-xl bg-gray-50 p-4 outline-none transition focus:bg-white focus:ring-2 focus:ring-[${ORANGE}] focus:border-[${ORANGE}]`} />
        </div>

        {/* Specs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-700">Specifications</label>
            <button type="button" onClick={addSpec} className="text-xs flex items-center gap-1 text-[#FF6B00] font-bold hover:text-orange-700"><Plus size={14} /> Add Spec</button>
          </div>
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
            {specs.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input placeholder="Feature (e.g. Battery)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} className="flex-1 p-3 rounded-lg bg-white border border-gray-200 text-sm" />
                <input placeholder="Value (e.g. 10 Hours)" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="flex-1 p-3 rounded-lg bg-white border border-gray-200 text-sm" />
                <button type="button" onClick={() => removeSpec(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions inside form so it scrolls into view */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition">Cancel</button>
          <button type="submit" disabled={loading || uploading} style={{ background: ORANGE }} className="px-6 py-2 text-white font-bold rounded-xl hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2">{loading ? 'Saving...' : 'Save Product'}</button>
        </div>
      </form>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import supabase from '../../../lib/supabaseClient'
import { useToast } from '../../../context/useToastHook'

export default function ProfileTab({ user = null, onProfileUpdate = () => {} }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      email: (user && (user.email || user?.email)) || '',
      full_name: (user && (user.name || user.fullName || (user.firstName ? [user.firstName, user.lastName].filter(Boolean).join(' ') : null))) || '',
      phone: (user && (user.phone || user.phone_number || user?.phone)) || '',
      // Map DB shipping column into the form's street_address
      street_address: (user && (user.shipping_address || user.address || user.street)) || '',
      city: (user && user.city) || '',
      state: (user && user.state) || ''
    })
  }, [user])

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id) {
      showToast?.('No user id available', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.full_name || null,
        phone: form.phone || null,
        shipping_address: form.street_address || null,
        city: form.city || null,
        state: form.state || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase.from('users').update(payload).eq('id', user.id).select()
      if (error) throw error
      showToast?.('Profile updated', 'success')
      // call parent refresh handler
      try { onProfileUpdate && onProfileUpdate() } catch (err) { /* ignore */ }
    } catch (err) {
      console.error('Profile update failed', err)
      showToast?.(err?.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
    
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Street Address</label>
              <textarea value={form.street_address} onChange={(e) => handleChange('street_address', e.target.value)} rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">City</label>
                <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">State</label>
                <input type="text" value={form.state} onChange={(e) => handleChange('state', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
    </div>
  )
}

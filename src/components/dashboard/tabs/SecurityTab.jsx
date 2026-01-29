import React, { useState } from 'react'
import supabase from '../../../lib/supabaseClient'
import { useToast } from '../../../context/useToastHook'

export default function SecurityTab({ user = null }) {
  const { showToast } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const formatDate = (iso) => {
    try {
      if (!iso) return '—'
      return new Date(iso).toLocaleString()
    } catch {
      return iso || '—'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword) {
      showToast?.('Please enter a new password', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast?.('Passwords do not match', 'error')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      showToast?.('Password updated successfully', 'success')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Password update failed', err)
      showToast?.(err?.message || 'Failed to update password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Account Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
          <div className="col-span-1">
            <p className="text-xs text-gray-500">Email</p>
            <div className="mt-1 bg-white px-3 py-2 rounded border border-gray-200 text-sm">{user?.email || '—'}</div>
          </div>
          <div className="col-span-1">
            <p className="text-xs text-gray-500">User ID</p>
            <div className="mt-1 bg-white px-3 py-2 rounded border border-gray-200 text-sm">{user?.id || '—'}</div>
          </div>
          <div className="col-span-1">
            <p className="text-xs text-gray-500">Last Sign In</p>
            <div className="mt-1 bg-white px-3 py-2 rounded border border-gray-200 text-sm">{formatDate(user?.last_sign_in_at || user?.lastSignIn || user?.last_sign_in)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, handleApiError } from '../../lib/api'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetchOrder() {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const res = await api.get(`/me/orders/${encodeURIComponent(id)}`)
        const payload = res?.data?.data ?? res?.data ?? null
        if (!mounted) return
        const o = payload?.order ?? payload
        if (!o) setNotFound(true)
        else setOrder(o)
      } catch (err) {
        if (!mounted) return
        const e = handleApiError(err)
        if (e?.status === 404) setNotFound(true)
        else setError(e?.message || 'Failed to load order')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (id) fetchOrder()
    return () => { mounted = false }
  }, [id])

  const formatCurrency = (v) => `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

  if (loading) return <div className="p-6">Loading order...</div>

  if (notFound) return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Order not found</h2>
      <p className="text-sm text-gray-600 mb-4">We couldn't find that order. It may have been removed or you don't have permission to view it.</p>
      <Link to="/dashboard" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">Back to Dashboard</Link>
    </div>
  )

  if (error) return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Error</h2>
      <p className="text-sm text-red-600 mb-4">{error}</p>
      <Link to="/dashboard" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">Back to Dashboard</Link>
    </div>
  )

  if (!order) return <div className="p-6">Order not found</div>

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order {order.id || id}</h1>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">Back to Dashboard</Link>
      </div>

      <div className="bg-white p-4 rounded shadow-sm">
        <div className="mb-4">
          <div className="text-sm text-gray-600">Status: <span className="font-medium">{(order.status || order.fulfillmentStatus || order.payment_status || 'pending').toString()}</span></div>
          <div className="text-sm text-gray-600">Placed: {new Date(order.created_at || order.createdAt || Date.now()).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total: <span className="font-medium">{formatCurrency(order.total ?? order.subtotal ?? 0)}</span></div>
        </div>

        <h2 className="text-lg font-semibold mb-2">Items</h2>
        <div className="space-y-3">
          {(order.items || []).map((it, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 border rounded">
              {it.image ? (
                <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded" />
              )}
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-600">Qty: {it.quantity ?? it.qty ?? 1}</div>
              </div>
              <div className="text-sm font-medium">{formatCurrency(it.total ?? it.price ?? 0)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <div className="text-sm text-gray-600">Subtotal: {formatCurrency(order.subtotal ?? order.total ?? 0)}</div>
          <div className="text-sm text-gray-600">Shipping: {formatCurrency(order.shipping || 0)}</div>
          <div className="text-lg font-bold">Grand Total: {formatCurrency(order.total ?? order.subtotal ?? 0)}</div>
        </div>
      </div>
    </div>
  )
}

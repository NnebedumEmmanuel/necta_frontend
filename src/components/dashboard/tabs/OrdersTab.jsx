import React, { useState, useEffect } from 'react'
import { Package, Truck, Calendar, MapPin, Info, Copy, ExternalLink } from 'lucide-react'

export default function OrdersTab({ orders = [], initialOrderId = null }) {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // When an initialOrderId is provided by a parent (dashboard), open that order
    if (initialOrderId == null) {
      setSelectedOrder(null)
      return
    }
    const found = (orders || []).find(o => String(o.id) === String(initialOrderId))
    if (found) setSelectedOrder(found)
  }, [initialOrderId, orders])

  const formatCurrency = (value) => {
    const n = Number(value || 0)
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return iso || '-'
    }
  }

  const getStatus = (order) => {
    // Prefer fulfillment status (internal order status) over payment status
    return (order.fulfillmentStatus || order.status || order.paymentStatus || order.payment_status || 'pending').toString().toLowerCase()
  }

  const getStatusBadge = (order) => {
    const s = getStatus(order)
    switch (s) {
      case 'shipped':
        return <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Shipped</span>
      case 'delivered':
        return <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">Delivered</span>
      case 'processing':
        return <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Processing</span>
      case 'cancelled':
        return <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>
      case 'pending':
      default:
        // fall back to payment status label if present
        const pay = (order.paymentStatus || order.payment_status || '').toString()
        return pay ? <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{pay.charAt(0).toUpperCase() + pay.slice(1)}</span> : <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>
    }
  }

  function openOrder(order) {
    setSelectedOrder(order)
  }

  function closeOrder() {
    setSelectedOrder(null)
  }

  const steps = ['pending', 'processing', 'shipped', 'delivered']

  const Stepper = ({ status }) => {
    const idx = Math.max(0, steps.indexOf(status))
    return (
      <div className="flex items-center gap-4 mb-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${i <= idx ? 'bg-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
              {i + 1}
            </div>
            <div className={`text-xs ${i <= idx ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < idx ? 'bg-indigo-600' : 'bg-gray-200'} mx-2`} />}
          </div>
        ))}
      </div>
    )
  }

  if (selectedOrder) {
    const status = getStatus(selectedOrder)
    const tracking = selectedOrder.tracking_number || selectedOrder.trackingNumber || selectedOrder.__raw?.tracking_number
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={closeOrder} className="text-sm text-indigo-600 hover:underline">← Back to Orders</button>
            <h2 className="text-2xl font-bold mt-2">Order #{selectedOrder.orderNumber}</h2>
            <div className="mt-1 text-sm text-gray-600">{getStatusBadge(selectedOrder)}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
            <p className="text-sm text-gray-600 mt-2">Total: {formatCurrency(selectedOrder.total)}</p>
          </div>
        </div>

        <Stepper status={status} />

        { (status === 'shipped' || status === 'delivered') && tracking && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-sm">How to Track Your Shipment</h4>
            </div>

            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium">Step 1:</span> Copy your Tracking Number: <span className="font-medium">{tracking}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(tracking)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        } catch (e) {
                          // fallback: select and prompt
                          console.warn('Clipboard write failed', e)
                        }
                      }}
                      className="inline-flex items-center gap-2 px-2 py-1 bg-white border rounded text-xs"
                      aria-label="Copy tracking number"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </li>
              <li><span className="font-medium">Step 2:</span> Click the "Go to GIG Logistics Tracking" button below.</li>
              <li><span className="font-medium">Step 3:</span> Paste the number on the carrier's website to see the live location.</li>
            </ol>

            <div className="mt-3">
              <a href={`https://giglogistics.com/track?id=${encodeURIComponent(tracking)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                <ExternalLink className="w-4 h-4" />
                Go to GIG Logistics Tracking
              </a>
            </div>

            {copied && <div className="text-xs text-emerald-600 mt-2">Copied to clipboard</div>}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Items</h3>
          <div className="space-y-3">
            {(selectedOrder.items || []).map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded shadow-sm">
                {it.image ? <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-gray-100 rounded" />}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{it.name}</div>
                  <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
                </div>
                <div className="text-sm font-medium">{formatCurrency(it.total || it.price || 0)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="p-6">
      <div className="p-4 border-b mb-4">
        <h2 className="text-xl font-bold">Order History</h2>
        <p className="text-sm text-gray-600">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatus(order)
            const tracking = order.tracking_number || order.trackingNumber || order.__raw?.tracking_number
            return (
              <div key={order.id} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">Order #{order.orderNumber}</p>
                    {getStatusBadge(order)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2"><Calendar className="w-4 h-4 inline mr-1" /> {formatDate(order.createdAt)}</p>
                  <p className="text-sm text-gray-700 mt-3">Items: {order.items?.length || 0} • Total: {formatCurrency(order.total)}</p>
                  {(tracking && (status === 'shipped' || status === 'delivered')) && (
                    <div className="mt-2 text-sm flex items-center gap-3">
                      <div className="text-slate-600">Tracking #: <span className="font-medium">{tracking}</span></div>
                      <a href={`https://giglogistics.com/track?id=${encodeURIComponent(tracking)}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-indigo-600 hover:underline">Track Order</a>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => openOrder(order)}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

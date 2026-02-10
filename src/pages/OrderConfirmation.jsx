import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { useToast } from '@/context/ToastProvider'

const OrderConfirmation = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return navigate('/')
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await orderService.getOrder(id)
        if (!mounted) return
        setOrder(res?.data ?? res)
      } catch (err) {
        console.error('Failed to load order', err)
        showToast?.('Failed to load order details', { type: 'error' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="p-8">Loading order...</div>
  if (!order) return <div className="p-8">Order not found</div>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Thanks — your order is confirmed</h1>
      <p className="mb-2">Order #: <strong>{order.id}</strong></p>
      <p className="mb-2">Status: <strong>{order.payment_status ?? order.status ?? 'pending'}</strong></p>
      <p className="mb-4">Total: <strong>{order.total}</strong></p>
      <div className="space-y-2">
        {(order.items || []).map((it, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <img src={it.image} alt={it.name} className="w-16 h-16 object-cover" />
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm">Qty: {it.quantity} • {it.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderConfirmation

import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import { useCart } from '../../context/useCartHook'
import { useToast } from '@/context/useToastHook'

const PaymentCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verify() {
      try {
        const params = new URLSearchParams(location.search)
        const reference = params.get('reference')
        if (!reference) {
          showToast?.('Missing payment reference', { type: 'error' })
          navigate('/')
          return
        }

        // Call backend verify endpoint which will check Paystack and mark order as paid
        const res = await api.get('/paystack/verify', { params: { reference } })
        const body = res?.data ?? res

        if (body?.success && body?.orderId) {
          // Successful verification: clear cart and navigate to order confirmation
          try { clearCart() } catch (e) { /* non-fatal */ }
          navigate(`/order-confirmation/${body.orderId}`)
          return
        }

        // If not successful, surface a useful message. If Paystack returned a status
        // the backend will include it so we can show appropriate guidance.
        const status = body?.status || 'unknown'
        showToast?.(`Payment verification: ${status}`, { type: 'error' })
        navigate('/')
      } catch (err) {
        console.error('Payment callback verify error', err)
        showToast?.('Failed to verify payment. If you were charged, contact support.', { type: 'error' })
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [location.search])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Verifying payment...</h2>
        {loading && <p className="text-sm text-gray-500">Please wait — we are confirming your payment and finalizing your order.</p>}
      </div>
    </div>
  )
}

export default PaymentCallback

import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastProvider'
import supabase from '@/lib/supabaseClient'

const PaymentCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    async function verify() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams(location.search)
        const reference = params.get('reference')
        console.info('PaymentCallback verify invoked', { reference })
        if (!reference) {
          setError('Missing payment reference in URL.');
          setLoading(false)
          return
        }

        // Log whether user session exists (this helps debug Authorization header presence)
        try {
          const sessionRes = await supabase.auth.getSession()
          const token = sessionRes?.data?.session?.access_token
          console.info('PaymentCallback: supabase session token present?', !!token)
        } catch (sErr) {
          console.warn('Failed to read supabase session for debugging', sErr)
        }

        // Call verify once and handle result safely
        const res = await api.get('/paystack/verify', { params: { reference } })
        const body = res?.data ?? res

        console.info('Paystack verify response (frontend):', body)

        if (body?.success) {
          try { clearCart() } catch (e) { }
          showToast?.('Payment verified. Redirecting to orders...', { type: 'success' })
          navigate('/dashboard?tab=orders&paystatus=success')
          return
        }

        // If verify failed, poll the user's orders for up to 10s to see if webhook finalized the payment.
        const poll = async () => {
          const maxAttempts = 10
          const delayMs = 1000
          for (let i = 0; i < maxAttempts; i++) {
            try {
              const ordersRes = await api.get('/me/orders')
              const orders = ordersRes?.data?.data || []
              const matched = orders.find(o => o.paystack_reference === reference || o.payment_status === 'paid' || (o.status && o.status === 'paid'))
              if (matched) {
                try { clearCart() } catch (e) { }
                showToast?.('Payment confirmed. Redirecting to orders...', { type: 'success' })
                navigate('/dashboard?tab=orders&paystatus=success')
                return true
              }
            } catch (pollErr) {
              // ignore and retry until timeout
            }
            // wait
            await new Promise(r => setTimeout(r, delayMs))
          }
          return false
        }

        const polled = await poll()
        if (!polled) {
          const status = body?.status || body?.error || 'unknown'
          setError(`Payment verification failed: ${status}`)
        }
      } catch (err) {
        console.error('Payment callback verify error', err)
        setError('Failed to verify payment. If you were charged, contact support.')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [location.search])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full text-center p-6">
        <h2 className="text-xl font-semibold mb-2">Verifying payment...</h2>
        {loading && (
          <p className="text-sm text-gray-500">Please wait — we are confirming your payment and finalizing your order.</p>
        )}

        {!loading && error && (
          <div className="mt-4 text-left bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => {
                  // Retry verification
                  setLoading(true)
                  setError(null)
                  // trigger effect by updating location.search manually not needed; just call verify via navigation
                  // simpler: reload the page to re-run the effect (keeps logic minimal and deterministic)
                  window.location.reload()
                }}
              >
                Retry
              </button>
              <button
                className="px-3 py-1 border rounded"
                onClick={() => navigate('/dashboard?tab=orders')}
              >
                Go to Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback

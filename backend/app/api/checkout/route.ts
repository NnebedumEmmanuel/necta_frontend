export {};

// app/api/checkout/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.server'
import axios from 'axios'

export async function POST(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase (orders are persisted server-side)
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  try {
    // Read raw body so we can return a clear 400 for empty/invalid JSON
    const raw = await req.text()
    if (!raw || raw.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Missing request body' }, { status: 400 })
    }

    let body: any
    try {
      body = JSON.parse(raw)
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const { items, email, shipping_address } = body

    if (!items || !Array.isArray(items) || !email) {
      return NextResponse.json({ success: false, error: 'Invalid payload: expected { items: [...], email: "user@example.com" }' }, { status: 400 })
    }

    // Validate items (this is a placeholder — implement stock checks in products service)
    const subtotal = items.reduce((s: number, i: any) => s + (i.qty || 0) * (i.price || 0), 0)

    // create order with pending payment_status
    const { data: order, error } = await db
      .from('orders')
      .insert([
        { items, subtotal, shipping_address, total: subtotal, payment_status: 'pending', email }
      ])
      .select()
      .single()

    if (error) {
      console.error('Create order error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Debug: log received order inputs and computed totals
    console.info('Checkout request body summary:', { itemsCount: items.length, subtotal })

    // Initialize Paystack
    let secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY missing')
      return NextResponse.json({ success: false, error: 'Server misconfiguration: missing PAYSTACK_SECRET_KEY' }, { status: 500 })
    }
    // normalize (strip accidental quotes/newlines)
    secret = String(secret).trim().replace(/^"|"$/g, '')
    // common mistake: using the public key (pk_...) instead of secret (sk_...)
    if (secret.startsWith('pk_')) {
      console.error('PAYSTACK_SECRET_KEY appears to be a public key (pk_...). Use the secret key (sk_test_... or sk_live_...) on the server.')
      return NextResponse.json({ success: false, error: 'Invalid Paystack key: server is using a public key. Use the secret key in PAYSTACK_SECRET_KEY.' }, { status: 500 })
    }

    // amount must be an integer (kobo). Validate order.total
    const total = Number(order.total ?? subtotal ?? 0)
    if (!isFinite(total) || total <= 0) {
      console.error('Invalid order total for checkout', { total, order })
      return NextResponse.json({ success: false, error: 'Invalid order total' }, { status: 400 })
    }
  const amountKobo = Math.round(total * 100)
  console.info('Preparing Paystack initialize', { total, amountKobo, orderId: order.id })

    let initializeRes
    try {
      initializeRes = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amountKobo,
          metadata: { order_id: order.id },
        },
        {
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (err: any) {
      // Surface Paystack error details to the client for debugging (dev only)
      const paystackData = err?.response?.data || { message: err?.message || 'Paystack error' }
      console.error('Paystack initialize error:', paystackData)
      // If Paystack returns an invalid_key validation_error, add a helpful hint
      if (paystackData?.message?.toLowerCase?.().includes('invalid key') || paystackData?.code === 'invalid_Key') {
        console.error('Paystack reported invalid key. Check PAYSTACK_SECRET_KEY and ensure the server uses the secret (sk_...) key, not the public (pk_...) key.')
      }
      const status = err?.response?.status || 500
      return NextResponse.json({ success: false, error: 'Paystack initialization failed', details: paystackData }, { status })
    }

    return NextResponse.json({ success: true, data: { order, paystack: initializeRes.data.data } })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}

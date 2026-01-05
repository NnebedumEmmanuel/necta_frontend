export {};

// app/api/paystack/webhook/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.server'
import axios from 'axios'
import crypto from 'crypto'

export async function POST(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase: webhook updates orders in the DB
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  try {
    const raw = await req.text()

    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature') || req.headers.get('x-paystack-signature'.toLowerCase()) || ''
    // Prefer a dedicated webhook secret, fall back to PAYSTACK_SECRET_KEY if necessary
    let secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || ''
    // normalize and trim accidental quotes/newlines
    secret = String(secret || '').trim().replace(/^"|"$/g, '')

    if (!secret) {
      console.warn('Paystack webhook: no secret configured in PAYSTACK_WEBHOOK_SECRET or PAYSTACK_SECRET_KEY')
      return NextResponse.json({ success: false, error: 'Webhook secret not configured' }, { status: 500 })
    }
    // guard against accidentally using a public key (pk_...) as the webhook/secret
    if (secret.startsWith('pk_')) {
      console.error('Paystack webhook secret appears to be a public key (pk_...). Set PAYSTACK_WEBHOOK_SECRET or PAYSTACK_SECRET_KEY to the secret key (sk_... ).')
      return NextResponse.json({ success: false, error: 'Invalid webhook secret: appears to be a public key. Use a server secret key.' }, { status: 500 })
    }

    const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex')

    if (!signature || signature !== hash) {
      // signature mismatch — log minimal debug info (do NOT log secret or raw body)
      console.warn('Paystack webhook signature mismatch', { headerSignature: signature, computedSignature: hash.slice(0, 16) + '...' })
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(raw)

    // Paystack sends event type and data object
    const event = payload.event || payload.eventType || null
    const data = payload.data || payload

    // For transactions, data.reference contains the reference
    const reference = data.reference || data.transaction || data.id || null

    // If metadata contains order_id, use it
    const orderId = data.metadata?.order_id || data.metadata?.orderId || null

    // Verify transaction with Paystack to be safe
    if (reference) {
      const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      })

      const verified = verifyRes.data

      if (verified && verified.data && verified.data.status === 'success') {
        // mark order as paid if orderId is present
        if (orderId) {
          await db
            .from('orders')
            .update({ payment_status: 'paid', paystack_reference: reference })
            .eq('id', orderId)
        }
      }
    }

    // Acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Paystack webhook error:', err)
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}

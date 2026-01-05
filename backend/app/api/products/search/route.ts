export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.server'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard to ensure the server has Supabase configured. This allows
  // TypeScript to narrow `supabaseAdmin` to non-null for the remainder of
  // the handler and prevents import-time crashes.
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  }
  // Narrowed local reference for TypeScript inference
  const db = supabaseAdmin

  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const category = url.searchParams.get('category')
    const min_price = Number(url.searchParams.get('min_price') || '')
    const max_price = Number(url.searchParams.get('max_price') || '')
    const rating = Number(url.searchParams.get('rating') || '')
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build queries freshly to avoid mutating the supabase query object
    const buildQuery = (includeRating = true) => {
      let qbuilder: any = db.from('products').select('*', { count: 'exact' })
      if (q) {
        qbuilder = qbuilder.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      }
      if (category) qbuilder = qbuilder.eq('category_id', category)
      if (!Number.isNaN(min_price)) qbuilder = qbuilder.gte('price', min_price)
      if (!Number.isNaN(max_price)) qbuilder = qbuilder.lte('price', max_price)
      if (includeRating && !Number.isNaN(rating)) qbuilder = qbuilder.gte('rating', rating)
      return qbuilder
    }

    // Try with rating filter, if provided. If the DB complains the column
    // doesn't exist, retry the query without rating (graceful fallback).
    try {
      const queryWithRating = buildQuery(true)
      const { data, error, count } = await queryWithRating.order('created_at', { ascending: false }).range(from, to)
      if (error) throw error
      return NextResponse.json({ success: true, data, pagination: { page, limit, total: count } })
    } catch (err: any) {
      // If the error is specifically about the missing `rating` column,
      // retry without rating. Otherwise return the error.
      const msg = String(err?.message || err)
      if (msg.includes('rating') || msg.includes('column') && msg.includes('does not exist')) {
        // Retry without rating
        const queryNoRating = buildQuery(false)
        const { data, error, count } = await queryNoRating.order('created_at', { ascending: false }).range(from, to)
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        return NextResponse.json({ success: true, data, pagination: { page, limit, total: count } })
      }
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

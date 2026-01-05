export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.server'
import { requireAuthWithRole } from '../../../../lib/requireAuth'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  await requireAuthWithRole(req, 'admin')
  // Guard supabase presence early
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  }
  const db = supabaseAdmin

  try {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '50')
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await db
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data, pagination: { page, limit, total: count ?? 0 } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx?: { params?: Promise<any> }) {
  await requireAuthWithRole(req, 'admin')
  // Guard supabase presence early
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  }
  const db = supabaseAdmin

  try {
    const body = await req.json()
    const { data, error } = await db.from('products').insert(body).select()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

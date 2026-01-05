export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.server'
import { getUserFromRequest } from '../../../../lib/auth'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase presence
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

  let query = db.from('orders').select('*', { count: 'exact' }).eq('user_id', user.id)
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query.range(from, to)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: count ?? 0 } })
    }

    return NextResponse.json({ success: true, data, pagination: { page, limit, total: count } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

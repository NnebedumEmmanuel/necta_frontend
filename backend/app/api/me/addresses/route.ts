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
    const { data, error } = await db
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase presence
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
  const body = await req.json()
  const payload = { ...body, user_id: user.id }
  const { data, error } = await db.from('addresses').insert(payload).select()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.server'
import { getUserFromRequest } from '../../../../../lib/auth'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  const params = ctx && ctx.params ? await ctx.params : undefined;
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
  const id = params.id
  const { data, error } = await db.from('addresses').select('*').eq('id', id).eq('user_id', user.id).single()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, ctx?: { params?: Promise<any> }) {
  const params = ctx && ctx.params ? await ctx.params : undefined;
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
  const id = params.id
  const body = await req.json()
  const { data, error } = await db.from('addresses').update(body).eq('id', id).eq('user_id', user.id).select()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx?: { params?: Promise<any> }) {
  const params = ctx && ctx.params ? await ctx.params : undefined;
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
  const id = params.id
  const { error } = await db.from('addresses').delete().eq('id', id).eq('user_id', user.id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.server'
import { getUserFromRequest } from '../../../lib/auth'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  // Return the user object and optionally profile data from profiles table
  try {
  const { data: profile, error } = await db.from('profiles').select('*').eq('id', user.id).single()
    if (error) {
      // If profiles table isn't present, return auth user data
      return NextResponse.json({ success: true, data: { user } })
    }
    return NextResponse.json({ success: true, data: { user, profile } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    // Update profiles table (preferred) — fall back to returning error if missing
    const { data, error } = await db.from('profiles').upsert({ id: user.id, ...body })
      .select()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    // Soft-delete profile row if exists
  const { error } = await db.from('profiles').delete().eq('id', user.id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

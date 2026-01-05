import { NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase.server'

export async function requireAdmin(req: Request) {
  // Allow ADMIN_API_KEY header for internal server calls
  const adminKey = process.env.ADMIN_API_KEY
  const provided = req.headers.get('x-admin-api-key')
  if (provided && adminKey && provided === adminKey) return { ok: true }

  // Otherwise expect a Bearer token and verify it's an admin user
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    // Verify token and fetch user
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Supabase not configured on server' }, { status: 500 })
    }
    const db = supabaseAdmin
    const { data, error } = await db.auth.getUser(token as string)
    if (error || !data?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const user = data.user as any
    const isAdmin = (user?.app_metadata?.role === 'admin') || (user?.role === 'admin')
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    return { ok: true, user }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}

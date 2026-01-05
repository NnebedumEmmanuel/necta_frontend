export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.server'
import { getUserFromRequest } from '../../../../../lib/auth'

export async function DELETE(req: NextRequest, ctx?: { params?: Promise<any> }) {
  const params = ctx && ctx.params ? await ctx.params : undefined;

  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const authRes = await getUserFromRequest(req)
  const { user, token } = authRes
  // params may be a Promise in some Next.js runtimes; await before using
  const resolvedParams = params && typeof params.then === 'function' ? await params : params
  const id = resolvedParams?.id
  console.info('Wishlist DELETE request, user:', user ? user.id : null, 'tokenPresent:', !!token, 'params:', resolvedParams)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    if (!id || id === 'undefined') {
      console.warn('Wishlist DELETE called with missing/invalid id param', { id })
      return NextResponse.json({ success: false, error: 'Missing or invalid id parameter' }, { status: 400 })
    }
  const { data, error } = await db.from('wishlist').delete().eq('id', id).eq('user_id', user.id).select()

    if (error) {
      // log the full error object for diagnostics
      console.error('Wishlist delete error:', error)
      const details = { code: (error as any).code || null, message: (error as any).message || String(error), details: (error as any).details || null }
      return NextResponse.json({ success: false, error: error.message || String(error), details }, { status: 500 })
    }

    // If delete succeeded but no rows were removed, return a 404-ish response
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.info('Wishlist delete: no rows deleted (not found or not owned by user)', { id, user: user.id })
      return NextResponse.json({ success: false, error: 'Not found or not owned by user' }, { status: 404 })
    }

    console.info('Wishlist deleted', { id: data[0]?.id || id, user: user.id })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Wishlist DELETE exception:', err)
    return NextResponse.json({ success: false, error: err.message || String(err), details: err }, { status: 500 })
  }
}

// Force Node.js runtime for this route. The Edge runtime disallows many
// Node.js-only APIs and can cause import-time crashes when importing
// server-side helpers (for example, Supabase admin clients or other
// native Node modules). See comments below for details.
export const runtime = 'nodejs'

export {}

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.server'
import { requireAdmin } from '../../../../../lib/adminAuth'

function getAdminDb() {
  // Return the server admin client or null. Do NOT throw here — handlers
  // must perform a runtime guard and return a JSON response so the App
  // Router does not crash during import or request handling.
  return supabaseAdmin
}

export async function GET(req: NextRequest) {
  // Authorize and handle any thrown NextResponse from the helper
  try {
    const auth = await requireAdmin(req)
    if (auth instanceof Response) return auth
    if (!(auth as any).ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  } catch (err: any) {
    if (err instanceof Response) return err
    // Unexpected error during auth check — log and return JSON
    // eslint-disable-next-line no-console
    console.error('[api/products/[id]/related] auth check failed', {
      url: req.url,
      error: err?.message ?? String(err),
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    })
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getAdminDb()
    if (!db) {
      // eslint-disable-next-line no-console
      console.error('[api/products/[id]/related] Supabase admin client not configured')
      return NextResponse.json({ success: false, error: 'Supabase not configured on server' }, { status: 500 })
    }

    const url = new URL(req.url)
    const page = Math.max(1, Number(url.searchParams.get('page') || '1') || 1)
    const limit = Math.min(250, Math.max(1, Number(url.searchParams.get('limit') || '50') || 50))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await db
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[api/products/[id]/related] supabase query error', { url: req.url, error: error?.message ?? error })
      return NextResponse.json({ success: false, error: error?.message ?? 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, pagination: { page, limit, total: count ?? 0 } })
  } catch (err: any) {
    // If a Response was thrown, propagate it. Otherwise return a safe JSON error.
    if (err instanceof Response) return err
    // eslint-disable-next-line no-console
    console.error('[api/products/[id]/related] unexpected error', {
      url: req.url,
      error: err?.message ?? String(err),
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    })
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Authorize
  try {
    const auth = await requireAdmin(req)
    if (auth instanceof Response) return auth
    if (!(auth as any).ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  } catch (err: any) {
    if (err instanceof Response) return err
    // eslint-disable-next-line no-console
    console.error('[api/products/[id]/related] auth check failed (POST)', {
      url: req.url,
      error: err?.message ?? String(err),
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    })
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getAdminDb()
    if (!db) {
      // eslint-disable-next-line no-console
      console.error('[api/products/[id]/related] Supabase admin client not configured (POST)')
      return NextResponse.json({ success: false, error: 'Supabase not configured on server' }, { status: 500 })
    }

    const body = await req.json()

    const { data, error } = await db.from('products').insert(body).select()
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[api/products/[id]/related] insert error', { url: req.url, error: error?.message ?? error })
      return NextResponse.json({ success: false, error: error?.message ?? 'Insert failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    if (err instanceof Response) return err
    // eslint-disable-next-line no-console
    console.error('[api/products/[id]/related] unexpected error (POST)', {
      url: req.url,
      error: err?.message ?? String(err),
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    })
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

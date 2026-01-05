export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.server'
import { getUserFromRequest } from '../../../../lib/auth'

// GET: list wishlist entries with product details + pagination
export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase presence
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const authRes = await getUserFromRequest(req)
  const { user } = authRes
  // log for debugging auth issues
  console.info('Wishlist GET request, user:', user ? user.id : null, 'tokenPresent:', !!authRes.token)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get wishlist items for user with total count
    const { data: items, error, count } = await db
      .from('wishlist')
      .select('id,product_id,created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    const productIds = (items || []).map((i: any) => i.product_id).filter(Boolean)

    let products: any[] = []
    if (productIds.length > 0) {
  const { data: pData, error: perr } = await db.from('products').select('*').in('id', productIds)
      if (perr) return NextResponse.json({ success: false, error: perr.message }, { status: 500 })
      products = pData || []
    }

    // merge product details into items
    const data = (items || []).map((it: any) => ({ ...it, product: products.find((p: any) => p.id === it.product_id) || null }))

    return NextResponse.json({ success: true, data, pagination: { page, limit, total: count ?? 0 } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST: add wishlist item; prevent duplicates
export async function POST(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    console.info('Wishlist POST by user', { userId: user.id, product_id: body?.product_id })
    if (!body || !body.product_id) return NextResponse.json({ success: false, error: 'Missing product_id' }, { status: 400 })

    // check duplicate
  const { data: exists, error: e1 } = await db.from('wishlist').select('id').eq('user_id', user.id).eq('product_id', body.product_id).single()
    if (e1 && (e1 as any).code !== 'PGRST116') {
      // PGRST116: no rows — different Supabase versions may surface different messages; we treat single() errors cautiously
    }
    if (exists) {
      return NextResponse.json({ success: false, error: 'Already in wishlist' }, { status: 409 })
    }
    // validate product exists (avoid FK/constraint errors and surface clear message)
  const { data: product, error: perr } = await db.from('products').select('id').eq('id', body.product_id).single()
    if (perr && (perr as any).code !== 'PGRST116') {
      console.error('Product lookup error before wishlist insert:', perr)
      return NextResponse.json({ success: false, error: perr.message || String(perr), details: { code: (perr as any).code || null } }, { status: 500 })
    }
    if (!product) {
      console.warn('Wishlist insert: product not found', { product_id: body.product_id })
      return NextResponse.json({ success: false, error: 'Invalid product_id: product not found' }, { status: 400 })
    }

    // Ensure a corresponding application user row exists in the `users` table
    // (some schemas have a FK from wishlist.user_id -> users.id). If the auth
    // user exists in Supabase auth but the app profile row is missing, inserting
    // into wishlist will fail with a FK violation (23503). Create a minimal
    // profile row when missing to avoid that.
    try {
  const { data: userRow, error: userRowErr } = await db.from('users').select('id').eq('id', user.id).single()
      if (userRowErr && (userRowErr as any).code !== 'PGRST116') {
        console.error('users table lookup error:', userRowErr)
        return NextResponse.json({ success: false, error: userRowErr.message || String(userRowErr), details: { code: (userRowErr as any).code || null } }, { status: 500 })
      }
      if (!userRow) {
        // insert minimal profile (id + email) — adjust fields as your schema requires
        const profile: any = { id: user.id }
        if (user.email) profile.email = user.email
  const { data: insertedUser, error: insertUserErr } = await db.from('users').insert(profile).select()
        if (insertUserErr) {
          console.error('users insert error while creating missing profile:', insertUserErr)
          return NextResponse.json({ success: false, error: insertUserErr.message || String(insertUserErr), details: { code: (insertUserErr as any).code || null } }, { status: 500 })
        }
        console.info('Created missing users.profile row for user', user.id)
      }
    } catch (userEnsureErr: any) {
      console.error('Error ensuring users profile exists:', userEnsureErr)
      return NextResponse.json({ success: false, error: userEnsureErr.message || String(userEnsureErr) }, { status: 500 })
    }

    const payload = { product_id: body.product_id, user_id: user.id }
  const { data, error } = await db.from('wishlist').insert(payload).select()
    if (error) {
      console.error('Wishlist insert error:', error)
      const details = { code: (error as any).code || null, message: (error as any).message || String(error), details: (error as any).details || null }
      return NextResponse.json({ success: false, error: error.message || String(error), details }, { status: 500 })
    }
    console.info('Wishlist inserted', { id: (data && data[0]?.id) || null, user: user.id, product_id: body.product_id })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Wishlist POST error:', err)
    // Avoid returning raw error objects (they may contain circular refs and break JSON.stringify)
    const safeDetails = err && typeof err === 'object' ? { message: err.message ?? String(err) } : String(err)
    return NextResponse.json({ success: false, error: err?.message ?? String(err), details: safeDetails }, { status: 500 })
  }
}


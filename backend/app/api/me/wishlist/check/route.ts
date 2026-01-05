export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.server'
import { getUserFromRequest } from '../../../../../lib/auth'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Early guard for supabase
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  const db = supabaseAdmin

  const { user } = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const product_id = url.searchParams.get('product_id')
    if (!product_id) return NextResponse.json({ success: false, error: 'Missing product_id' }, { status: 400 })

  const { data, error } = await db.from('wishlist').select('id').eq('user_id', user.id).eq('product_id', product_id).single()
    if (error) {
      // PGRST116 or similar indicates not found
      console.info('Wishlist check: no entry found for user', user.id, 'product', product_id)
      return NextResponse.json({ success: true, present: false })
    }
    // return the id for convenience so clients can delete by entry id
    return NextResponse.json({ success: true, present: !!data, id: data?.id || null })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

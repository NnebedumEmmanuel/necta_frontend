export {};

import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.server'

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Ensure supabase is configured
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  }
  const db = supabaseAdmin

  try {
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      // If the column `is_featured` doesn't exist in the database,
      // return an empty featured list instead of a 500 so the frontend
      // can continue to function until a migration is applied.
      if (error.message && error.message.includes('is_featured')) {
        return NextResponse.json({ success: true, data: [] })
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

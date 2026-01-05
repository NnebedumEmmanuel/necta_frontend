import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.server'
import corsHeaders from '../../../lib/cors'

export async function OPTIONS(req: NextRequest) {
  const headers = {
    ...corsHeaders(req.headers.get('origin') ?? undefined),
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }

  return new NextResponse(null, { status: 204, headers })
}

export async function GET(req: NextRequest) {
  try {
    const headers = {
      ...corsHeaders(req.headers.get('origin') ?? undefined),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }

    if (!supabaseAdmin) {
      console.error('Supabase admin client is not configured on the server')
      return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500, headers })
    }

  const db = supabaseAdmin
  // Order by name ascending to return collections in user-friendly order
  const { data, error } = await db.from('collections').select('id,name,slug').order('name', { ascending: true })
    if (error) {
      console.error('Error fetching collections:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500, headers })
    }

    return NextResponse.json({ collections: data || [] }, { headers })
    } catch (err: any) {
    console.error('Unhandled error in /api/collections:', err?.message || err)
    const headers = {
      ...corsHeaders(undefined),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500, headers })
  }
}

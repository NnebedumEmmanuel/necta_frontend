export {};

// app/api/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from "@/lib/supabase.server";

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  const params = ctx && ctx.params ? await ctx.params : undefined;
  // Early guard for supabase
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500 })
  }

  const db = supabaseAdmin

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/'); 
    // The ID should be the last segment in the path:
    // e.g., ['','api','products','d6fa12a4...'] -> pop() gets the ID
    const id = pathSegments.pop(); 
    
    // Safety check: ensure the ID is present and looks like a UUID (long string)
    if (!id || id.length < 30) {
        return NextResponse.json({ success: false, error: 'Product ID is missing or invalid' }, { status: 400 });
    }

    // Now query Supabase with the manually extracted ID
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET Product Detail Error:", err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}


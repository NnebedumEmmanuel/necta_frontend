export {};

// app/api/products/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.server'
import corsHeaders from '../../../lib/cors'

// Root cause: previously the Supabase client module threw at import time when
// env vars were missing which caused module initialization to fail and
// produced 500s. To prevent that, we guard the client and always return
// structured JSON errors instead of allowing uncaught exceptions.

export async function OPTIONS(req: NextRequest) {
  // Preflight response for CORS
  const headers = corsHeaders(req.headers.get('origin') ?? undefined)
  return new NextResponse(null, { status: 204, headers })
}

export async function GET(req: NextRequest, ctx?: { params?: Promise<any> }) {
  // Top-level try/catch ensures we never leak an uncaught exception to Vercel
  // and that the route always returns JSON (required by the debugging task).
  try {
    const headers = corsHeaders(req.headers.get('origin') ?? undefined)

    // Ensure CORS headers are built for responses

    const url = new URL(req.url)

  // Server-side safety cap for price filters to avoid absurd values
  const MAX_PRICE_CAP = 200000

    // Defensive pagination parsing
    const limitParam = url.searchParams.get('limit')
    const pageParam = url.searchParams.get('page')

    let limit = 20
    if (limitParam != null) {
      const n = Number(limitParam)
      if (!Number.isNaN(n) && n > 0) limit = n
    }

    let page = 1
    if (pageParam != null) {
      const p = Number(pageParam)
      if (!Number.isNaN(p) && p > 0) page = p
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    if (!supabaseAdmin) {
      // eslint-disable-next-line no-console
      console.error('Supabase admin client is not configured on the server')
      return NextResponse.json({ error: 'Supabase not configured on server' }, { status: 500, headers })
    }
    const db = supabaseAdmin

    // Read filters (only include if present)
    const minPriceParam = url.searchParams.get('min_price')
    const maxPriceParam = url.searchParams.get('max_price')
    const ratingParam = url.searchParams.get('min_rating') || url.searchParams.get('rating')
    const brandsParam = url.searchParams.get('brands') || url.searchParams.get('brand')
    const categoriesParam = url.searchParams.get('categories') || url.searchParams.get('category')
    const collectionsParam = url.searchParams.get('collections') || url.searchParams.get('collection')
    const q = url.searchParams.get('q')

    // Helper to split CSV param into array of trimmed non-empty strings
    const splitCsv = (val: string | null): string[] => {
      if (!val) return []
      return String(val).split(',').map(s => s.trim()).filter(Boolean)
    }

    const brandsArr = splitCsv(brandsParam)
    const categoriesArr = splitCsv(categoriesParam)
    const collectionsArr = splitCsv(collectionsParam)

    // Begin building query
    // We need to support optional collection filtering by slug (comma-separated).
    // If a collections filter is provided we must inner-join through
    // product_collections -> collections so only products in the requested
    // collections are returned. If no collections filter is present we must
    // NOT inner-join, otherwise products without collections would be excluded.
    const selectWithCollectionsInner = `*, brands(id,name,slug), categories(id,name,slug), product_collections!inner(collections!inner(id,slug))`
    const selectWithCollectionsLeft = `*, brands(id,name,slug), categories(id,name,slug), product_collections(collections(id,slug))`

    // Resolve collections param to numeric ids where possible (accept slugs or ids).
    // If the caller supplied slugs that don't exist in the DB we can short-circuit
    // and return an empty result set (no products belong to unknown collections).
    let resolvedCollectionIds: number[] = []
    if (collectionsArr.length > 0) {
      const numericIds = collectionsArr.map(v => Number(v)).filter(n => !Number.isNaN(n))
      const slugValues = collectionsArr.filter(v => Number.isNaN(Number(v)))
      resolvedCollectionIds = [...numericIds]

      if (slugValues.length > 0) {
        try {
          const { data: collRows } = await db.from('collections').select('id,slug').in('slug', slugValues)
          if (Array.isArray(collRows) && collRows.length > 0) {
            resolvedCollectionIds.push(...collRows.map(r => r.id))
          }
        } catch (e) {
          // resolution failed - leave resolvedCollectionIds as-is (numeric ids only)
        }
      }

      // If caller requested collections but none resolved to ids, return empty
      // result immediately to avoid running a join that can't match anything.
      if (resolvedCollectionIds.length === 0) {
        return NextResponse.json({ products: [], total: 0 }, { headers })
      }
    }

    // Use a loose type for the query builder to avoid TypeScript narrowing
    // issues when we assign different Postgrest builders conditionally.
    let query: any
    if (resolvedCollectionIds.length > 0) {
      // Inner-join path ensures only products that belong to at least one of
      // the requested collections are returned.
      query = db.from('products').select(selectWithCollectionsInner, { count: 'exact' })
      // Filter on the join table's collection_id column
      query = query.in('product_collections.collection_id', resolvedCollectionIds)
    } else {
      // No collection filter: select left relationship so products without any
      // collection relationship are still returned.
      query = db.from('products').select(selectWithCollectionsLeft, { count: 'exact' })
    }

    // Text search
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    }

    // Price filters
    if (minPriceParam != null && minPriceParam !== '') {
      const v = Number(minPriceParam)
      if (!Number.isNaN(v)) query = query.gte('price', v)
    }

    if (maxPriceParam != null && maxPriceParam !== '') {
      const v = Number(maxPriceParam)
      if (!Number.isNaN(v)) {
        // Clamp the client-supplied max price to the server-side cap
        const capped = Math.min(v, MAX_PRICE_CAP)
        query = query.lte('price', capped)
      }
    }

    // Rating (minimum)
    if (ratingParam != null && ratingParam !== '') {
      const rv = Number(ratingParam)
      if (!Number.isNaN(rv)) {
        // Some schemas may not have rating; guard against DB errors
        try {
          // Apply numeric minimum on rating
          query = query.gte('rating', rv)
          // If a minimum rating greater than 0 is requested, exclude unrated products
          if (rv > 0) {
            // Exclude rows where rating IS NULL
            query = query.not('rating', 'is', null)
          }
        } catch (e) { /* ignore */ }
      }
    }

    // Brand filter: accept numeric ids or slugs. Resolve non-numeric slugs to ids.
    if (brandsArr.length > 0) {
      const numericIds = brandsArr.map(v => Number(v)).filter(n => !Number.isNaN(n))
      const slugValues = brandsArr.filter(v => Number.isNaN(Number(v)))

      let resolvedIds = [...numericIds]
      if (slugValues.length > 0) {
        try {
          const { data: brandRows } = await db.from('brands').select('id,slug').in('slug', slugValues)
          if (Array.isArray(brandRows) && brandRows.length > 0) {
            resolvedIds.push(...brandRows.map(r => r.id))
          }
        } catch (e) {
          // ignore resolution errors and continue with numeric ids only
        }
      }

      if (resolvedIds.length > 0) query = query.in('brand_id', resolvedIds)
    }

    // Category filter: accept numeric ids or slugs. Resolve slugs to ids.
    if (categoriesArr.length > 0) {
      const numericIds = categoriesArr.map(v => Number(v)).filter(n => !Number.isNaN(n))
      const slugValues = categoriesArr.filter(v => Number.isNaN(Number(v)))

      let resolvedIds = [...numericIds]
      if (slugValues.length > 0) {
        try {
          const { data: catRows } = await db.from('categories').select('id,slug').in('slug', slugValues)
          if (Array.isArray(catRows) && catRows.length > 0) {
            resolvedIds.push(...catRows.map(r => r.id))
          }
        } catch (e) {
          // ignore
        }
      }

      if (resolvedIds.length > 0) query = query.in('category_id', resolvedIds)
    }

    // (Collection filter already applied earlier when resolving collection ids.)

    // Execute query with pagination
    try {
      const { data, error, count } = await query.range(from, to)
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Supabase query error:', (error as any)?.message ?? String(error))
        return NextResponse.json({ error: (error as any)?.message ?? String(error) }, { status: 500, headers })
      }

      return NextResponse.json({ products: data || [], total: count ?? 0 }, { headers })
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Exception executing supabase query:', e?.message || e)
      return NextResponse.json({ error: e?.message || String(e) }, { status: 500, headers })
    }

  } catch (err: any) {
    // Final catch-all: ensure we always return JSON
    // eslint-disable-next-line no-console
    console.error('Unhandled exception in /api/products route:', err?.message || err)
    const headers = corsHeaders(undefined)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500, headers })
  }
}

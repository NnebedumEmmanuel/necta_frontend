// lib/related.ts
// Helper to fetch related products by category and price proximity.
import type { SupabaseClient } from '@supabase/supabase-js'

export async function getRelatedProducts(
  supabase: SupabaseClient,
  id: string,
  limit = 12
) {
  if (!id) throw new Error('missing product id')

  // Try maybeSingle() if available, fall back to single()
  const prodQuery = supabase.from('products').select('id,category_id,price').eq('id', id)
  // support both maybeSingle and single for different supabase client shapes
  // @ts-ignore
  const baseRes = typeof prodQuery.maybeSingle === 'function'
    ? await prodQuery.maybeSingle()
    : await prodQuery.single()

  if (!baseRes || baseRes.error) {
    return { success: false, error: baseRes?.error?.message ?? 'Product not found', status: 404 }
  }

  const prod = baseRes.data
  if (!prod) return { success: false, error: 'Product not found', status: 404 }

  const category = prod.category_id
  const price = Number(prod.price || 0)

  // Fetch candidate products in same category excluding the base product
  const { data: candidates, error } = await supabase
    .from('products')
    .select('id,name,price,category_id,slug,images,created_at')
    .eq('category_id', category)
    .neq('id', id)
    .limit(100)

  if (error) return { success: false, error: error.message, status: 500 }

  const list = Array.isArray(candidates) ? candidates : []

  // Sort by absolute price closeness to the base product, fallback to newest
  list.sort((a: any, b: any) => {
    const da = Math.abs((a?.price || 0) - price)
    const db = Math.abs((b?.price || 0) - price)
    if (da === db) {
      const ta = new Date(a?.created_at || 0).getTime()
      const tb = new Date(b?.created_at || 0).getTime()
      return tb - ta
    }
    return da - db
  })

  return { success: true, data: list.slice(0, limit) }
}

export default getRelatedProducts

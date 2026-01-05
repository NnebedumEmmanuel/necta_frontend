import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

// Backend-only seed script. Run only from the backend project.
// This script upserts product records into the `products` table using the Supabase service role key.
// Provide a JSON file containing product objects via the FRONTEND_PRODUCTS_PATH environment variable.

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. Aborting.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  })

  // To seed products, provide a JSON file path via the FRONTEND_PRODUCTS_PATH
  // environment variable. The file should contain either an array of product
  // objects or an object whose exported values are arrays of products.
  const frontendProductsPath = process.env.FRONTEND_PRODUCTS_PATH
  if (!frontendProductsPath) {
    console.error('No FRONTEND_PRODUCTS_PATH provided. Provide a path to a JSON file containing product data (env var FRONTEND_PRODUCTS_PATH). Exiting.')
    process.exit(1)
  }

  if (!fs.existsSync(frontendProductsPath)) {
    console.error('Provided FRONTEND_PRODUCTS_PATH file not found at', frontendProductsPath)
    process.exit(1)
  }

  // Read and parse JSON file (expecting either an array or an object with arrays)
  const raw = fs.readFileSync(frontendProductsPath, 'utf-8')
  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse FRONTEND_PRODUCTS_PATH as JSON. Provide a valid JSON file. Error:', err)
    process.exit(1)
  }

  const productArrays = [] as any[]
  if (Array.isArray(parsed)) {
    productArrays.push(...parsed)
  } else if (typeof parsed === 'object' && parsed !== null) {
    for (const key of Object.keys(parsed)) {
      const val = (parsed as any)[key]
      if (Array.isArray(val)) productArrays.push(...val)
    }
  }

  if (productArrays.length === 0) {
    console.error('No product arrays found in the provided FRONTEND_PRODUCTS_PATH JSON file. Exiting.')
    process.exit(1)
  }

  // Helper to create a URL/slug-friendly string
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

  // Map frontend product shape to backend product record
  const mapped = productArrays.map((p: any) => {
    const priceText = String(p.price || p.priceText || '')
    const oldPriceText = String(p.oldPrice || p.old_price || '')
    const priceNumber = parseFloat((priceText || '').replace(/[^0-9.]/g, '')) || null
    const oldPriceNumber = parseFloat((oldPriceText || '').replace(/[^0-9.]/g, '')) || null

    const images = [] as string[]
    if (p.image) images.push(p.image)
    if (Array.isArray(p.gallery)) images.push(...p.gallery)

    const name = p.name || p.title || 'Untitled Product'
    const slug = p.slug || slugify(name)

    return {
      slug,
      name,
      description: p.description || p.details?.description || null,
      price_text: priceText || null,
      price: priceNumber,
      old_price_text: oldPriceText || null,
      old_price: oldPriceNumber,
      image: p.image || (images[0] ?? null),
      images: images.length ? images : null,
      colors: p.colors ?? null,
      specs: p.specs ?? null,
      details: p.details ?? null,
      reviews: p.reviews ?? null,
    metadata: { importedFrom: process.env.FRONTEND_PRODUCTS_PATH || 'seed_input', sourceId: p.id ?? null },
    }
  })

  // Remove duplicates by slug (keep the first)
  const uniqueBySlug: Record<string, any> = {}
  for (const rec of mapped) {
    if (!rec.slug) continue
    if (!uniqueBySlug[rec.slug]) uniqueBySlug[rec.slug] = rec
  }

  const toUpsert = Object.values(uniqueBySlug)
  console.log(`Preparing to upsert ${toUpsert.length} products to Supabase (products table)`) 

  // Chunk upserts to avoid too large payloads
  const chunkSize = 50
  for (let i = 0; i < toUpsert.length; i += chunkSize) {
    const chunk = toUpsert.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('products')
      .upsert(chunk, { onConflict: 'slug' })

    if (error) {
      console.error('Upsert error for chunk starting at', i, error)
      process.exit(1)
    }
    console.log(`Upserted chunk ${i / chunkSize + 1}: ${chunk.length} records`)
  }

  console.log('Seed complete — products upserted successfully.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed script failed:', err)
  process.exit(1)
})

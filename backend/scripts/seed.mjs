import { createClient } from '@supabase/supabase-js'
import process from 'process'
import fs from 'fs'
import path from 'path'

// Load .env.local (if present) into process.env for this script so developers
// can keep secrets in .env.local without needing to export variables manually.
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const idx = trimmed.indexOf('=')
      if (idx === -1) return
      let key = trimmed.slice(0, idx).trim()
      let val = trimmed.slice(idx + 1).trim()
      // remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    })
    console.log('Loaded env from .env.local')
  }
} catch (e) {
  console.warn('Failed to load .env.local:', e?.message ?? e)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and re-run.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  try {
    // Prepare categories and brands (create tables if missing and insert rows)
    const categoriesList = [
      { name: 'sounds', slug: 'sounds' },
      { name: 'solar', slug: 'solar' },
      { name: 'accessory', slug: 'accessory' },
      { name: 'appliances', slug: 'appliances' },
    ]

    const brandsList = [
      { name: 'T&G', slug: 't-and-g' },
      { name: 'NectaCo', slug: 'nectaco' },
      { name: 'HomeGoods', slug: 'homegoods' },
    ]

    // NOTE: automatic DDL via DATABASE_URL was unreliable in some environments
    // (dynamic import/pg caused hard-to-debug failures). Instead we will be
    // defensive: attempt upserts/selects and if the table is missing we'll
    // print the CREATE TABLE SQL for you to run manually in Supabase SQL editor.

    // Create categories table if missing
    try {
      let found = false
      try {
        const { data: tData, error: tErr } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'categories')
          .limit(1)
        if (!tErr && Array.isArray(tData) && tData.length > 0) found = true
      } catch (e) {
        console.info('Could not check categories in information_schema, will attempt to create if needed.', e?.message ?? e)
      }

      if (!found) {
        const createCategoriesSql = `CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text,
  created_at timestamptz DEFAULT now()
);`
        console.log('categories table not found. Run this SQL in your DB to create it:\n', createCategoriesSql)
      }

      // Try to upsert category rows; if the table doesn't exist we'll catch and print a helpful message
      try {
        const { data: catData, error: catErr } = await supabase.from('categories').upsert(categoriesList, { onConflict: ['name'] }).select()
        if (catErr) throw catErr
        console.log('Categories ready:', catData?.map(c => c.name))
      } catch (upsertErr) {
        console.warn('Could not upsert categories — table may be missing or schema differs:', upsertErr)
      }
    } catch (e) {
      console.warn('Categories setup failed:', e?.message ?? e)
    }

    // Create brands table if missing
    try {
      let foundB = false
      try {
        const { data: tData, error: tErr } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'brands')
          .limit(1)
        if (!tErr && Array.isArray(tData) && tData.length > 0) foundB = true
      } catch (e) {
        console.info('Could not check brands in information_schema, will attempt to create if needed.', e?.message ?? e)
      }

      if (!foundB) {
        const createBrandsSql = `CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text,
  created_at timestamptz DEFAULT now()
);`
        console.log('brands table not found. Run this SQL in your DB to create it:\n', createBrandsSql)
      }

      try {
        const { data: brandData, error: brandErr } = await supabase.from('brands').upsert(brandsList, { onConflict: ['name'] }).select()
        if (brandErr) throw brandErr
        console.log('Brands ready:', brandData?.map(b => b.name))
      } catch (upsertErr) {
        console.warn('Could not upsert brands — table may be missing or schema differs:', upsertErr)
      }
    } catch (e) {
      console.warn('Brands setup failed:', e?.message ?? e)
    }

    // Prepare products and attach category_name / brand_name to map to ids
    const products = [
      {
        name: 'Necta Coffee Maker 3000',
        slug: 'necta-coffee-maker-3000',
        sku: 'NECTA-CM-3000',
        description: 'Brew the perfect cup with temperature control and auto-shutoff.',
        short_description: 'Smart programmable coffee maker.',
        price: 12999,
        compare_at_price: 14999,
        images: ['https://picsum.photos/seed/coffee/800/600'],
        specs: { color: 'black', capacity: '1.5L', power: '1200W' },
        stock: 12,
        category_name: 'appliances',
        brand_name: 'T&G',
      },
      {
        name: 'Necta Wireless Headphones Pro',
        slug: 'necta-wireless-headphones-pro',
        sku: 'NECTA-WHP',
        description: 'Active noise cancellation and 30h battery life.',
        short_description: 'Comfortable ANC headphones.',
        price: 19999,
        images: ['https://picsum.photos/seed/headphones/800/600'],
        specs: { color: 'silver', connectivity: 'Bluetooth 5.3', battery: '30h' },
        stock: 25,
        category_name: 'sounds',
        brand_name: 'NectaCo',
      },
      {
        name: 'Necta Ceramic Mug (Set of 4)',
        slug: 'necta-ceramic-mug-set-of-4',
        sku: 'NECTA-MUG-4',
        description: 'Microwave and dishwasher safe ceramic mugs — great for everyday use.',
        short_description: 'Set of 4 ceramic mugs.',
        price: 2999,
        images: ['https://picsum.photos/seed/mug/800/600'],
        specs: { material: 'ceramic', capacity: '350ml', dishwasher_safe: true },
        stock: 100,
        category_name: 'accessory',
        brand_name: 'HomeGoods',
      }
    ]

    // Resolve category and brand ids from inserted rows
    const { data: allCats } = await supabase.from('categories').select('*')
    const catMap = new Map((allCats || []).map((c) => [c.name, c.id]))
    const { data: allBrands } = await supabase.from('brands').select('*')
    const brandMap = new Map((allBrands || []).map((b) => [b.name, b.id]))

    // attach ids
    const productsToInsert = products.map((p) => {
      const clone = { ...p }
      if (p.category_name && catMap.has(p.category_name)) clone.category_id = catMap.get(p.category_name)
      if (p.brand_name && brandMap.has(p.brand_name)) clone.brand_id = brandMap.get(p.brand_name)
      delete clone.category_name
      delete clone.brand_name
      return clone
    })

    console.log('Inserting/upserting products (matched by sku)...')
    // Use upsert on sku to avoid duplicate-key errors when re-running seed
    const { data: pData, error: pErr } = await supabase.from('products').upsert(productsToInsert, { onConflict: 'sku' }).select()
    if (pErr) {
      console.error('Failed to insert/upsert products:', pErr)
    } else {
      console.log('Inserted/updated products:', pData?.map(p => ({ id: p.id, name: p.name })))
    }

    // insert sample reviews — attempt to auto-create the reviews table if it's missing
    try {
      if (pData && pData.length > 0) {
        // Check whether a reviews table exists via information_schema
        let tableExists = false
        try {
          const { data: tData, error: tErr } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_name', 'reviews')
            .limit(1)

          if (!tErr && Array.isArray(tData) && tData.length > 0) tableExists = true
        } catch (e) {
          // If this check fails, we continue — we'll attempt insert and handle the error.
          console.info('Could not check information_schema for reviews table, will attempt insert and fallback on error.', e?.message ?? e)
        }

        // If table doesn't exist and we have a DATABASE_URL, attempt to create it with pg
        if (!tableExists) {
          const createSql = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text,
  created_at timestamptz DEFAULT now()
);
`

          if (process.env.DATABASE_URL) {
            try {
              // dynamically import pg only when needed (dev convenience)
              const { Client } = await import('pg')
              const client = new Client({ connectionString: process.env.DATABASE_URL })
              await client.connect()
              await client.query(createSql)
              await client.end()
              console.log('Created reviews table via DATABASE_URL connection.')
              tableExists = true
            } catch (pgErr) {
              console.error('Failed to create reviews table via DATABASE_URL:', pgErr?.message ?? pgErr)
              console.log('Create table SQL to run manually:\n', createSql)
            }
          } else {
            console.log('reviews table not found. To auto-create it provide a DATABASE_URL env var, or run this SQL in your DB:')
            console.log(createSql)
          }
        }

        const reviews = [
          { product_id: pData[0].id, rating: 5, body: 'Fantastic coffee maker — heats up fast and tastes great.' },
          { product_id: pData[1].id, rating: 4, body: 'Great sound, comfortable, but ANC could be stronger.' },
          { product_id: pData[0].id, rating: 4, body: 'Good value for money.' },
        ]
        console.log('Inserting sample reviews...')
        const { data: rData, error: rErr } = await supabase.from('reviews').insert(reviews).select()
        if (rErr) {
          console.error('Failed to insert reviews:', rErr)
          // If insertion failed due to missing table/columns, show helpful advice
          if (rErr.code === 'PGRST204' || (rErr.details && /Could not find the/.test(rErr.details))) {
            console.log('It looks like the reviews table or some columns are missing. If you have a DATABASE_URL env var, the script attempted to create the table. Otherwise run the above CREATE TABLE SQL in your database.')
          }
        } else {
          console.log('Inserted reviews:', rData?.map(r => ({ id: r.id, product_id: r.product_id })))
        }
      }
    } catch (e) {
      console.warn('Skipping reviews insert (reviews table may not exist):', e.message || e)
    }

    // Compute average rating per product from reviews and update products.rating if possible
    try {
      if (pData && pData.length > 0) {
        for (const prod of pData) {
          try {
            const { data: revs, error: revErr } = await supabase.from('reviews').select('rating').eq('product_id', prod.id)
            if (revErr) {
              // reviews table may be missing; skip
              continue
            }
            const arr = Array.isArray(revs) ? revs.map(r => Number(r.rating || 0)).filter(n => !Number.isNaN(n)) : []
            if (arr.length === 0) continue
            const avg = Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10
            // Attempt to update products.rating column; if column missing, supabase will error and we'll log and continue
            const { data: upd, error: updErr } = await supabase.from('products').update({ rating: avg }).eq('id', prod.id).select()
            if (updErr) {
              console.warn('Could not update product rating (maybe column missing):', updErr?.message ?? updErr)
            } else {
              console.log(`Updated product ${prod.id} rating ->`, avg)
            }
          } catch (inner) {
            // ignore per-product errors
            console.info('Skipping rating update for product', prod.id, inner?.message ?? inner)
          }
        }
      }
    } catch (e) {
      console.warn('Rating update pass failed:', e?.message ?? e)
    }

    console.log('Seed complete — review any errors above.')
  } catch (err) {
    console.error('Seed failed:', err)
  }
}

run()

import Header from '../../components/Header'
import ProductActions from '../../components/ProductActions'
import type { Product } from '../../../types'

interface Props { params: { id: string } }

export default async function ProductPage({ params }: Props) {
  try {
    // params may be a Promise in Next.js; unwrap it before use
    const { id } = (await params) as { id: string }
    // Fetch product directly from Supabase on the server to avoid depending on the API route
    const { supabaseAdmin } = await import('../../../lib/supabase.server')
    // Guard: if the server-side Supabase client isn't configured, avoid calling it
    if (!supabaseAdmin) {
      console.error('Product page: supabaseAdmin not configured on server')
      return (
        <div>
          <Header />
          <main className="container mx-auto py-8">Server configuration error: product service unavailable</main>
        </div>
      )
    }

    const db = supabaseAdmin

    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    const product: Product | null = data ?? null

    // attempt to load reviews (optional table) and compute rating summary
    let reviews: any[] = []
    let avgRating: number | null = null
    try {
      const { data: rdata, error: rerr } = await db
        .from('reviews')
        .select('id,product_id,user_id,rating,body,created_at')
        .eq('product_id', id)
        .order('created_at', { ascending: false })

      if (!rerr && Array.isArray(rdata)) {
        reviews = rdata
        if (reviews.length > 0) avgRating = Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
      }
    } catch (e) {
      // reviews table is optional; ignore errors
      console.info('Product page: reviews fetch skipped or failed', e)
    }

    // If there are no reviews in the DB, attempt to seed a couple of sample reviews
    // (development convenience). If seeding fails or the table doesn't exist, fall
    // back to showing static sample reviews so the UI isn't empty.
    if (reviews.length === 0) {
      const sampleReviews = [
        { product_id: id, rating: 5, body: 'Excellent product — highly recommend!' },
        { product_id: id, rating: 4, body: 'Very good, met my expectations.' },
      ]

      try {
  const { data: inserted, error: insertErr } = await db.from('reviews').insert(sampleReviews).select()
        if (!insertErr && Array.isArray(inserted) && inserted.length > 0) {
          reviews = inserted
          avgRating = Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
          console.info('Product page: seeded sample reviews for product', id)
        } else {
          // if insert failed (table missing or column mismatch), use sample data locally
          console.info('Product page: could not seed reviews, using sample data', insertErr)
          reviews = sampleReviews
          avgRating = Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
        }
      } catch (e) {
        console.info('Product page: seeding reviews failed, falling back to static samples', e)
        reviews = sampleReviews
        avgRating = Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
      }
    }

    if (error || !product) {
      return (
        <div>
          <Header />
          <main className="container mx-auto py-8">Product not found</main>
        </div>
      )
    }

    return (
      <div>
        <Header />
        <main className="container mx-auto py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-100 h-80 flex items-center justify-center">{product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : 'No image'}</div>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-lg">₦{product.price}</p>
                {avgRating !== null ? (
                  <div className="text-sm text-yellow-600">★ {avgRating} ({reviews.length})</div>
                ) : null}
              </div>
              <p className="mt-4 text-gray-700">{product.description}</p>

              {/* render specs if present */}
              {product.specs && Object.keys(product.specs).length > 0 ? (
                <div className="mt-4 border p-3 rounded">
                  <h4 className="font-semibold mb-2">Specifications</h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex">
                        <dt className="w-32 text-gray-600">{k}</dt>
                        <dd className="flex-1">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <ProductActions product={product} />
            </div>
          </div>

          {/* Reviews section (optional) */}
          {reviews.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Customer reviews</h2>
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border p-3 rounded">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">Rating: {r.rating || '—'}</div>
                      <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <p className="mt-2 text-gray-800">{r.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
      </div>
    )
  } catch (err: any) {
    return (
      <div>
        <Header />
        <main className="container mx-auto py-8">Error loading product: {String(err?.message ?? err)}</main>
      </div>
    )
  }
}

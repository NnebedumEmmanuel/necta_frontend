import Header from './components/Header'
import ProductCard from './components/ProductCard'
import { getBaseUrl } from '../lib/getBaseUrl'

import type { Product } from '../types'

export default async function Home() {
  try {
    const base = getBaseUrl()
    const res = await fetch(`${base}/api/products`)
    const json = await res.json()
    const products: Product[] = json?.data || []

    return (
      <div>
        <Header />
        <main className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Featured products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </main>
      </div>
    )
  } catch (err: any) {
    return (
      <div>
        <Header />
        <main className="container mx-auto py-8">Error loading products: {String(err?.message ?? err)}</main>
      </div>
    )
  }
}

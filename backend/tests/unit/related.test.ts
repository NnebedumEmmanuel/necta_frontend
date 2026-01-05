import { getRelatedProducts } from '../../lib/related'

// Mock supabase client with a minimal from().select().eq().neq().limit() chain
class MockQuery {
  table: string
  filters: Record<string, any>
  constructor(table: string) {
    this.table = table
    this.filters = {}
  }
  select(_sel: string) {
    return this
  }
  eq(k: string, v: any) {
    this.filters[k] = v
    return this
  }
  neq(k: string, v: any) {
    this.filters[k] = v
    return this
  }
  maybeSingle() {
    if (this.filters['id']) {
      const p = { id: this.filters['id'], category_id: 'cat1', price: 100 }
      return Promise.resolve({ data: p, error: null })
    }
    return Promise.resolve({ data: null, error: null })
  }
  single() {
    return this.maybeSingle()
  }
  limit(_n: number) {
    // Return promise-like result for awaiting
    // If filter id present -> return single product
    // If id filter present and category filter NOT present -> single
    if (this.filters['id'] && !this.filters['category_id']) {
      const p = { id: this.filters['id'], category_id: 'cat1', price: 100 }
      return Promise.resolve({ data: p, error: null })
    }

    // Otherwise return candidate list (exclude id filter if present)
    const candidates = [
      { id: 'a', price: 102, category_id: 'cat1', created_at: '2025-01-01' },
      { id: 'b', price: 95, category_id: 'cat1', created_at: '2025-02-01' },
      { id: 'c', price: 300, category_id: 'cat1', created_at: '2024-12-01' },
      { id: 'd', price: 99, category_id: 'cat1', created_at: '2025-03-01' },
    ]
    return Promise.resolve({ data: candidates, error: null })
  }
}

const mockSupabase = {
  from(table: string) {
    return new MockQuery(table)
  }
}

describe('getRelatedProducts', () => {
  test('returns related products sorted by price closeness and excludes base product', async () => {
  const res = await getRelatedProducts(mockSupabase as any, 'base-id', 3)
  // debug on failure
  // eslint-disable-next-line no-console
  console.log('related res:', JSON.stringify(res))
  expect(res.success).toBe(true)
  expect(Array.isArray(res.data)).toBe(true)
  expect(res.data).toBeDefined()
  // Given our candidate list, diffs: a=2, b=5, c=200, d=1 -> d is closest
  expect(res.data![0].id).toBe('d')
  // ensure base-id not included
  expect(res.data!.find((x: any) => x.id === 'base-id')).toBeUndefined()
  })
})

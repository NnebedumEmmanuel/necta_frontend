export interface Product {
  id: string
  sku?: string
  name: string
  slug?: string
  description?: string
  short_description?: string | null
  price: number
  compare_at_price?: number | null
  category_id?: string
  images?: string[]
  specs?: Record<string, any>
  stock?: number
  status?: string
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
}

export interface Order {
  id: string
  items: any[]
  subtotal: number
  total: number
  payment_status: string
}

export interface User {
  id: string
  email: string
  name?: string
}

"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { items } = useCart()
  const [count, setCount] = useState(0)
  const { items: wishItems } = useWishlist()
  const { user, signOut } = useAuth()

  useEffect(() => {
    setCount(items.reduce((s, i) => s + i.qty, 0))
  }, [items])

  return (
    <header className="bg-white shadow p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">NECTA</Link>
        <nav className="space-x-4 flex items-center">
          <Link href="/products" className="text-gray-700">Products</Link>
          <Link href="/wishlist" className="text-gray-700 ml-4">Wishlist</Link>
          <Link href="/cart" className="text-gray-700 ml-4">Cart ({count})</Link>
          {user ? (
            <button onClick={() => signOut()} className="ml-4 text-sm text-gray-700">Sign out</button>
          ) : (
            <Link href="/login" className="ml-4 text-sm text-gray-700">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

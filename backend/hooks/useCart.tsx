"use client"
import { useEffect, useState, useRef } from 'react'
import { CartItem } from '../types'

const STORAGE_KEY = 'necta_cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]) 

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch (e) {
      setItems([])
    }
  }, [])

  const suppressRef = useRef(false)

  // persist helper: write storage and notify other instances. We set suppressRef
  // to avoid the reload handler from re-dispatching.
  function persist(nextItems: CartItem[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems)) } catch (e) {}
    // avoid loops when other instances read and set state
    try { window.dispatchEvent(new CustomEvent('necta_cart_updated')) } catch (e) {}
  }

  // listen for cart updates fired by other hook instances in this tab
  useEffect(() => {
    function handler() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        // mark that the upcoming setItems originates from a storage reload so
        // we don't dispatch another 'necta_cart_updated' event and cause a loop
        suppressRef.current = true
        setItems(raw ? JSON.parse(raw) : [])
      } catch (e) { /* ignore */ }
    }
    window.addEventListener('necta_cart_updated', handler)
    return () => window.removeEventListener('necta_cart_updated', handler)
  }, [])

  function add(item: CartItem) {
    setItems((prev) => {
      console.log('useCart.add', item)
      const found = prev.find((p) => p.id === item.id)
      let next: CartItem[]
      if (found) next = prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + item.qty } : p)
      else next = [...prev, item]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) {}
      try { setTimeout(() => window.dispatchEvent(new CustomEvent('necta_cart_updated')), 0) } catch (e) {}
      return next
    })
  }

  function remove(id: string) {
    console.log('useCart.remove', id)
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) {}
      try { setTimeout(() => window.dispatchEvent(new CustomEvent('necta_cart_updated')), 0) } catch (e) {}
      return next
    })
  }

  function updateQty(id: string, qty: number) {
    console.log('useCart.updateQty', id, qty)
    setItems((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, qty } : p)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) {}
      try { setTimeout(() => window.dispatchEvent(new CustomEvent('necta_cart_updated')), 0) } catch (e) {}
      return next
    })
  }

  function clear() {
    setItems(() => {
      const next: CartItem[] = []
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) {}
      try { setTimeout(() => window.dispatchEvent(new CustomEvent('necta_cart_updated')), 0) } catch (e) {}
      return next
    })
  }

  return { items, add, remove, updateQty, clear }
}

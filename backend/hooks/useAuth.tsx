"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.client'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // check session on mount
    supabase.auth.getSession().then((r: any) => {
      const session = r?.data?.session ?? null
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
    }).catch(() => {})

    const { data: listener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
    })

    return () => { listener?.subscription?.unsubscribe?.() }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() { await supabase.auth.signOut(); setUser(null); setToken(null) }

  return { user, token, signIn, signOut }
}

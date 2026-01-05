// supabaseClient.js - lightweight Supabase client for the frontend
import { createClient } from '@supabase/supabase-js'

// Vite exposes env via import.meta.env.VITE_*
const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!url || !anonKey) {
  // Warn in dev but avoid throwing so the app can still be opened for non-auth flows
  // eslint-disable-next-line no-console
  console.warn('[supabaseClient] missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY; auth will not work until configured')
}

const supabase = createClient(url, anonKey, { auth: { persistSession: true } })

export default supabase

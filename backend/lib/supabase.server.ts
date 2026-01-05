import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { optional, required } from './env'

// IMPORTANT: Previously this module threw an Error at import-time when the
// required server env vars were missing. That caused any route importing
// `supabaseAdmin` to crash during module initialization (500s). To avoid
// serverless/edge-time crashes we no longer throw at import-time. Instead
// export a nullable client and let callers handle the missing configuration
// gracefully. This keeps the server route handlers from failing to import
// and gives us a chance to return structured JSON errors.

// Prefer the NEXT_PUBLIC_* names for compatibility with existing dev setups,
// but allow fallback to non-prefixed names if present. We intentionally use
// `optional()` so we don't throw at import-time. Missing required vars will
// be surfaced later when callers use `getAdminDb()` which calls `required()`
// and therefore fails fast with a readable message.
const SUPABASE_URL = optional('NEXT_PUBLIC_SUPABASE_URL') || optional('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = optional('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_ANON_KEY = optional('NEXT_PUBLIC_SUPABASE_ANON_KEY') || optional('SUPABASE_ANON_KEY')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Do not throw here; keep the module safe to import in serverless runtimes.
  // Warn so logs include a readable hint when variables are missing.
  // eslint-disable-next-line no-console
  console.warn('[lib/supabase] Supabase server env vars missing; supabaseAdmin will be null. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for server operations.')
}

// Cached nullable admin client for callers that check `supabaseAdmin`.
export let supabaseAdmin: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null

// Lazy initializer that callers can use when they want the client and want
// strict validation (it will throw with a readable error if env vars are
// missing). This is useful in scripts or runtime paths where failing fast
// is preferable to continuing with a null client.
export function getAdminDb(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin

  // Will throw with a readable message and Vercel guidance if missing.
  const url = required('NEXT_PUBLIC_SUPABASE_URL') || required('SUPABASE_URL')
  const key = required('SUPABASE_SERVICE_ROLE_KEY')

  supabaseAdmin = createClient(url, key, { auth: { persistSession: false } })
  return supabaseAdmin
}

/**
 * Verify a JWT (Bearer) token with Supabase and return the user object or null.
 * This is a small wrapper that normalizes different supabase-js response shapes
 * across versions. It never persists state; it only verifies the token.
 */
export async function verifyJwt(token: string): Promise<{ user: any | null; error?: any }>
{
  if (!token) return { user: null }

  // If the admin client was not configured at import-time we return a
  // normalized error. Callers that want a stricter failure can use
  // `getAdminDb()` to throw earlier.
  if (!supabaseAdmin) {
    return { user: null, error: new Error('Supabase not configured on server') }
  }

  try {
    // supabase-js v2: supabase.auth.getUser(token) returns { data: { user }, error }
    // some versions/patches may expose user directly. Be defensive.
    // @ts-ignore - some shapes are not typed the same across versions
    const res = await (supabaseAdmin as any).auth.getUser(token)
    const user = res?.data?.user ?? res?.user ?? null
    const error = res?.error ?? null
    if (error) return { user: null, error }
    return { user }
  } catch (err) {
    // fallback: if getUser threw, return null with the error
    return { user: null, error: err }
  }
}

/**
 * Convenience wrapper used by server routes to assert and return the verified
 * user or throw an Error. Use inside try/catch in your route handlers.
 */
export async function requireVerifiedJwt(token: string) {
  const { user, error } = await verifyJwt(token)
  if (error || !user) throw error || new Error('Invalid token')
  return user
}

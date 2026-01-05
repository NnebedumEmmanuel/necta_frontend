// lib/supabase.client.ts
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Avoid throwing at module evaluation time. In the App Router
// server build the module may be imported while bundling or SSR; throwing
// here prevents server components that import client components from
// loading. Instead, create the browser client lazily and only throw when
// the client is actually used on the server.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!url || !anonKey) {
  // warn but don't throw so client code can start in dev without env vars
  // eslint-disable-next-line no-console
  console.warn('Supabase client missing NEXT_PUBLIC env variables')
}

// Lazy instance created in the browser on first access
let _client: any = null

function ensureBrowser() {
  if (typeof window === 'undefined') {
    // Don't throw synchronously. Log an error and allow callers to handle the
    // absence of a browser client at runtime. Throwing here can cause the
    // App Router to return 500s during import or handler execution.
    // eslint-disable-next-line no-console
    console.error(
      'supabase.client was used on the server. Use supabaseAdmin from lib/supabase.server in server code (app/api/*) to ensure operations use the SUPABASE_SERVICE_ROLE_KEY.'
    )
    return false
  }
  return true
}

function getClient() {
  if (!ensureBrowser()) return null
  if (!_client) _client = createClient(url, anonKey)
  return _client
}

// Export a proxy so importing this module does not construct the client or
// throw on the server. Accessing any property will attempt to resolve the
// real client and therefore will throw if used server-side.
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      const client = getClient()
      if (!client) {
        // Return a function that, when invoked, returns a rejected Promise.
        // This avoids synchronous throws at property access time while still
        // surfacing a runtime error when the method is used on the server.
        return (..._args: any[]) =>
          Promise.reject(
            new Error(
              'supabase.client is not available on the server. Use supabaseAdmin in server code.'
            )
          )
      }

      const value = (client as any)[prop]
      if (typeof value === 'function') return value.bind(client)
      return value
    },
    // allow function-call style in some patterns
    apply(_target, _thisArg, args) {
      const client = getClient()
      if (!client) {
        return Promise.reject(
          new Error('supabase.client is not available on the server. Use supabaseAdmin in server code.')
        )
      }
      return (client as any).apply(_thisArg, args)
    },
  }
) as any

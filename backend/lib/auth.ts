import { NextResponse } from 'next/server'
import { verifyJwt } from './supabase.server'

type AuthResult = { user: any | null; token: string | null }

/**
 * Extract Bearer token from Authorization header and validate with Supabase.
 * Returns { user, token } — user is null when invalid.
 */
export async function getUserFromRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  // debug: log whether an authorization header was present
  console.info('getUserFromRequest: authorization header present:', !!authHeader, authHeader ? authHeader.slice(0, 40) + '...' : '')
  if (!token) return { user: null, token: null }

  try {
    const { user, error } = await verifyJwt(token)
    if (error) {
      console.warn('getUserFromRequest: verifyJwt returned error', error)
      return { user: null, token }
    }
    if (user && !user.id) {
      console.warn('getUserFromRequest: resolved user object has no id, treating as unauthenticated', user)
      return { user: null, token }
    }
    return { user, token }
  } catch (err: any) {
    console.error('getUserFromRequest: error while verifying token', err)
    return { user: null, token }
  }
}

export function requireUserOrThrow(res: { user: any | null }) {
  if (!res.user) throw new NextResponse(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 })
}

export default getUserFromRequest

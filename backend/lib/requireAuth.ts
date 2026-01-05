import { NextResponse } from 'next/server'
import { supabaseAdmin, verifyJwt, getAdminDb } from './supabase.server'

/**
 * Extracts a Bearer token from the Authorization header.
 */
export function getBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization') || ''
  if (!auth) return null
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

/**
 * Verify the request has a valid Supabase JWT and return the user object.
 * On failure this function throws a NextResponse with 401 so callers can
 * either `throw` or return directly in App Router API routes.
 */
export async function requireAuth(req: Request) {
  const token = getBearerToken(req)
  if (!token) {
    throw NextResponse.json({ success: false, error: 'Unauthorized: missing token' }, { status: 401 })
  }

  // Prefer the verifyJwt helper which normalizes supabase-js shapes.
  const { user, error } = await verifyJwt(token)
  if (error || !user) {
    // log on server for debugging token issues
    // eslint-disable-next-line no-console
    console.warn('requireAuth: token verification failed', { error: error ?? null })
    throw NextResponse.json({ success: false, error: 'Unauthorized: invalid token' }, { status: 401 })
  }

  return user
}

/**
 * Convenience for routes that want { user, token } shape similar to older helper.
 */
export async function getUserFromRequestOrNull(req: Request) {
  const token = getBearerToken(req)
  if (!token) return { user: null, token: null }
  const { user } = await verifyJwt(token)
  return { user, token }
}

/**
 * Require authentication and check that the user's profile has one of the
 * allowed roles. If the role is missing or doesn't match, throw a 403.
 *
 * Usage in App Router route handlers:
 *   const { user, role } = await requireAuthWithRole(req, ['admin'])
 */
export async function requireAuthWithRole(req: Request, allowedRoles: string | string[]) {
  // First ensure token is valid and get the user
  const user = await requireAuth(req)

  // Normalize allowedRoles to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  // Ensure we have an admin client to read the profiles table
  let db = supabaseAdmin
  try {
    if (!db) db = getAdminDb()
  } catch (err) {
    // Server misconfiguration: return 500 to indicate admin client missing
    // eslint-disable-next-line no-console
    console.error('requireAuthWithRole: admin DB not configured', err)
    throw NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const { data, error } = await db.from('profiles').select('role').eq('id', user.id).single()
    if (error) {
      // If profiles table missing or query failed, treat as forbidden
      // eslint-disable-next-line no-console
      console.warn('requireAuthWithRole: failed to read profile role', { error })
      throw NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const userRole = data?.role ?? null
    if (!userRole || !roles.includes(userRole)) {
      throw NextResponse.json({ success: false, error: 'Forbidden: insufficient role' }, { status: 403 })
    }

    return { user, role: userRole }
  } catch (err) {
    // If err is already a NextResponse (thrown above) rethrow it; otherwise return 403
    if (err instanceof NextResponse) throw err
    // eslint-disable-next-line no-console
    console.error('requireAuthWithRole unexpected error', err)
    throw NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
}

export default requireAuth

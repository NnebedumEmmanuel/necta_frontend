/**
 * CORS helper for Next.js App Router handlers.
 *
 * Returns a plain object of headers suitable for passing to NextResponse.
 *
 * Notes:
 * - Allows methods: GET, POST, PUT, DELETE, OPTIONS
 * - Allows headers: Content-Type, Authorization
 * - Defaults to allowing all origins in development.
 * - For now, production also allows all origins; tighten later when requirements are set.
 */

export function corsHeaders(origin?: string): Record<string, string> {
  // Default policy for now: allow all origins. We keep an explicit origin parameter
  // so callers can set a specific value if desired in the future.
  const allowedOrigin = origin ?? '*';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    // Keep credentials allowed; callers can remove this header if not needed.
    'Access-Control-Allow-Credentials': 'true'
  };
}

export default corsHeaders;

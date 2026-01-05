// lib/getBaseUrl.ts
// Helper to construct an absolute URL for server-side fetch calls.
export function getBaseUrl() {
  // Prefer an explicit public app URL in env (set this for deployments)
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  if (publicUrl) {
    // If VERCEL_URL (no protocol) was provided, ensure https:// prefix
    if (!publicUrl.startsWith('http')) return `https://${publicUrl}`
    return publicUrl
  }

  // Fallback to localhost during local development
  const port = process.env.PORT || '3000'
  return `http://localhost:${port}`
}

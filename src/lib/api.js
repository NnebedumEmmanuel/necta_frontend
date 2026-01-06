import axios from 'axios'

// Prefer an explicit backend host when provided via Vite env (VITE_API_BASE_URL).
// If not set, fall back to a same-origin relative '/api' so dev proxy can be used.
const RAW_API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL)
  : ''

// Production-safe API base:
// - If VITE_API_BASE_URL is set, use that origin + '/api' suffix (e.g. https://necta-backend.vercel.app/api)
// - Otherwise fall back to '/api' so the Vite dev proxy can forward requests in development
export const API_BASE_URL = RAW_API_BASE ? `${RAW_API_BASE.replace(/\/$/, '')}/api` : '/api'

if (!RAW_API_BASE) {
  // eslint-disable-next-line no-console
  console.info(`api: using relative API base '${API_BASE_URL}' (no VITE_API_BASE_URL). Set VITE_API_BASE_URL to target a remote backend.`)
} else {
  // eslint-disable-next-line no-console
  console.info(`api: using backend base ${API_BASE_URL}`)
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Helper to attach bearer token to requests. Accepts a token string.
export function attachAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

// Response helper: normalize errors
export function handleApiError(error) {
  if (error.response) {
    const msg = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data)
    return new Error(msg || 'API request failed')
  } else if (error.request) {
    return new Error('Network error. Please check your connection.')
  }
  return error
}

export default { api, attachAuthToken, handleApiError }


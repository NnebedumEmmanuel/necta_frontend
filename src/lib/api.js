import axios from 'axios'

// Vite environment variable for backend base URL
// Use import.meta.env.VITE_API_BASE_URL — do NOT use process.env or NEXT_ prefixed vars
const RAW_API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL)
  : ''

export const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '');

if (!API_BASE_URL) {
  // Make missing configuration loudly visible in the console
  console.error('VITE_API_BASE_URL is not defined — API requests will fail. Set VITE_API_BASE_URL in your .env')
}

// Create axios instance. We'll prefer passing absolute URLs when calling endpoints so
// that axios is always calling the exact backend. Still configure defaults here.
export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
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


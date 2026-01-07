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
  // Allow sending cookies for same-origin requests if your backend uses
  // session cookies for authentication. This does not affect Authorization
  // header usage — that still requires adding the token to headers.
  withCredentials: true,
})

// Helper to attach bearer token to requests. Accepts a token string.
export function attachAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

// Response helper: normalize errors
export function handleApiError(error) {
  // Normalize axios errors into a predictable shape. Callers can inspect
  // err.status and err.data to decide how to proceed.
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;
    const message = data?.message || data?.error || (typeof data === 'string' ? data : JSON.stringify(data)) || 'API request failed';
    const err = new Error(message);
    err.status = status;
    err.data = data;
    return err;
  } else if (error?.request) {
    const err = new Error('Network error. Please check your connection.');
    err.status = null;
    err.data = null;
    return err;
  }
  return error;
}

export default { api, attachAuthToken, handleApiError }


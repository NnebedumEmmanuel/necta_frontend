import axios from 'axios'
import supabase from './supabaseClient'

const RAW_API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL)
  : ''

// - If VITE_API_BASE_URL is set, use that origin + '/api' suffix (e.g. https://necta-backend.vercel.app/api)
export const API_BASE_URL = RAW_API_BASE ? `${RAW_API_BASE.replace(/\/$/, '')}/api` : '/api'

if (!RAW_API_BASE) {
  // eslint-disable-next-line no-console
  console.info(`api: using relative API base '${API_BASE_URL}' (no VITE_API_BASE_URL). Set VITE_API_BASE_URL to target a remote backend.`)
} else {
  // eslint-disable-next-line no-console
  console.info(`api: using backend base ${API_BASE_URL}`)
}

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: true,
})
// authApi: credentialed client used for authenticated/admin endpoints.
// Attach Supabase access token (if any) to every request using an interceptor.
// This reads the current session via supabase.auth.getSession() and sets
// Authorization: Bearer <access_token> when present. If no session exists,
// requests proceed without the header.

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  // Important: do NOT send credentials to public endpoints (CORS wildcard)
  withCredentials: false,
})

// Keep `api` name for backwards compatibility with existing imports that
// expect a credentialed client. Export `api` as the auth client.
export { authApi as api }

// local binding named `api` for convenience & default export consumers
const api = authApi

// Attach interceptor only to the credentialed/auth client (authApi)
authApi.interceptors.request.use(async (config) => {
  try {
    if (!supabase || !supabase.auth || typeof supabase.auth.getSession !== 'function') return config
    const sessionRes = await supabase.auth.getSession()
    const token = sessionRes?.data?.session?.access_token
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (err) {
    // If anything goes wrong, don't block the request; proceed without token
    // eslint-disable-next-line no-console
    console.warn('api interceptor: failed to attach supabase token', err)
  }
  return config
}, (error) => Promise.reject(error))

export function attachAuthToken(token) {
  if (token) authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete authApi.defaults.headers.common['Authorization']
}

export function handleApiError(error) {
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


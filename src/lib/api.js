import axios from 'axios'

const TOKEN_KEY = 'necta_auth_token'

const RAW_API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL)
  : ''

function normalizeApiBase(rawBase) {
  if (!rawBase) return '/api'
  const trimmed = rawBase.replace(/\/+$/, '')
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

export const API_BASE_URL = normalizeApiBase(RAW_API_BASE)

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: false,
})

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
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (err) {
    console.warn('api interceptor: failed to attach auth token', err)
  }
  return config
}, (error) => Promise.reject(error))

export function attachAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {}

  if (token) {
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete authApi.defaults.headers.common['Authorization']
  }
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


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
  withCredentials: false,
})

// Keep `api` name for backwards compatibility
export { authApi as api }
const api = authApi

// Request Interceptor: Attach bearer token securely
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

// GLOBAL RESPONSE INTERCEPTOR: Catch structured failures gracefully
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intercept 401/403 Session Expired errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem(TOKEN_KEY)
        window.location.href = '/login'
      }
    }
    return Promise.reject(handleApiError(error))
  }
)

publicApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(handleApiError(error))
)

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
    const status = error.response.status
    const data = error.response.data
    
    // Extract deep error message strings or structured validations from backend
    const message = data?.message || data?.error || (typeof data === 'string' ? data : null) || 'Something went wrong.'
    const validationErrors = data?.errors || null

    const err = new Error(message)
    err.status = status
    err.data = data
    err.validationErrors = validationErrors
    return err
  } else if (error?.request) {
    const err = new Error('Network error. Check your connection or server status.')
    err.status = null
    err.data = null
    return err
  }
  return error
}

export default { api, publicApi, attachAuthToken, handleApiError }
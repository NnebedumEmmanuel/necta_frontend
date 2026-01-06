import axios from 'axios'

// Use a same-origin relative API base so the browser issues same-origin requests
// (no CORS required). Keep a small exported `API_BASE_URL` for code that builds
// URLs with fetch() — it points to '/api'. Do not include absolute backend URLs
// in browser code.
export const API_BASE_URL = '/api'

export const api = axios.create({
  // baseURL is relative; axios will prepend it to request paths.
  baseURL: API_BASE_URL,
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


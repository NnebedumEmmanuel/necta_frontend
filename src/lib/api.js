import axios from 'axios'

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

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: true,
})

export function attachAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
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


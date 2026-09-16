import axios from 'axios'
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/config/api'
import { normalizeApiError } from '@/api/errors'

export const API_UNAUTHORIZED_EVENT = 'maintops-api:unauthorized'
export const AUTH_TOKEN_STORAGE_KEY = 'maintops.auth.token'
export const AUTH_TOKEN_TYPE_STORAGE_KEY = 'maintops.auth.token_type'
export const AUTH_USER_STORAGE_KEY = 'maintops.auth.user'

const isBrowser = () => typeof window !== 'undefined'

export const getStoredToken = () =>
  isBrowser()
    ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
      window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    : null

export const getStoredTokenType = () =>
  isBrowser()
    ? window.localStorage.getItem(AUTH_TOKEN_TYPE_STORAGE_KEY) ??
      window.sessionStorage.getItem(AUTH_TOKEN_TYPE_STORAGE_KEY) ??
      'Bearer'
    : 'Bearer'

export const setStoredToken = (token: string, tokenType = 'Bearer', remember = true) => {
  if (!isBrowser()) {
    return
  }

  clearStoredAuth()
  const storage = remember ? window.localStorage : window.sessionStorage

  storage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  storage.setItem(AUTH_TOKEN_TYPE_STORAGE_KEY, tokenType)
}

export const clearStoredAuth = () => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_TOKEN_TYPE_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_TOKEN_TYPE_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

const emitUnauthorized = (error: unknown) => {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(API_UNAUTHORIZED_EVENT, { detail: { error } }))
  }
}

export const onApiUnauthorized = (handler: (error: unknown) => void) => {
  if (!isBrowser()) {
    return () => undefined
  }

  const listener = (event: Event) => {
    handler((event as CustomEvent<{ error: unknown }>).detail.error)
  }

  window.addEventListener(API_UNAUTHORIZED_EVENT, listener)

  return () => window.removeEventListener(API_UNAUTHORIZED_EVENT, listener)
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getStoredToken()

  config.headers.set('Accept-Language', 'es')
  config.headers.set('X-Locale', 'es')

  if (token) {
    config.headers.set('Authorization', `${getStoredTokenType()} ${token}`)
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = normalizeApiError(error)

    if (apiError.status === 401) {
      clearStoredAuth()
      emitUnauthorized(apiError)
    }

    return Promise.reject(apiError)
  },
)

export const unwrapApiData = <T>(payload: { data?: T } | T): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}

export default http

import axios from 'axios'
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/config/api.js'
import { normalizeApiError } from '@/api/errors.js'

export const API_UNAUTHORIZED_EVENT = 'maintops-api:unauthorized'
export const AUTH_TOKEN_STORAGE_KEY = 'maintops.auth.token'
export const AUTH_TOKEN_TYPE_STORAGE_KEY = 'maintops.auth.token_type'
export const AUTH_USER_STORAGE_KEY = 'maintops.auth.user'

const isBrowser = () => typeof window !== 'undefined'

export const getStoredToken = () => {
  if (!isBrowser()) {
    return null
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export const getStoredTokenType = () => {
  if (!isBrowser()) {
    return 'Bearer'
  }

  return window.localStorage.getItem(AUTH_TOKEN_TYPE_STORAGE_KEY) || 'Bearer'
}

export const setStoredToken = (token, tokenType = 'Bearer') => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(AUTH_TOKEN_TYPE_STORAGE_KEY, tokenType)
}

export const clearStoredAuth = () => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_TOKEN_TYPE_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

const setAuthorizationHeader = (headers, value) => {
  if (typeof headers?.set === 'function') {
    headers.set('Authorization', value)
    return headers
  }

  return {
    ...headers,
    Authorization: value,
  }
}

const emitUnauthorized = (error) => {
  if (!isBrowser()) {
    return
  }

  window.dispatchEvent(
    new CustomEvent(API_UNAUTHORIZED_EVENT, {
      detail: { error },
    }),
  )
}

export const onApiUnauthorized = (handler) => {
  if (!isBrowser()) {
    return () => undefined
  }

  const listener = (event) => {
    handler(event.detail.error)
  }

  window.addEventListener(API_UNAUTHORIZED_EVENT, listener)

  return () => {
    window.removeEventListener(API_UNAUTHORIZED_EVENT, listener)
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
})

export const unwrapApiData = (
  response,
  fallbackMessage = 'The API response does not contain data.',
) => {
  const payload =
    response &&
    typeof response === 'object' &&
    'config' in response &&
    'status' in response
      ? response.data
      : response

  if (payload?.data === undefined) {
    throw new Error(payload?.message || fallbackMessage)
  }

  return payload.data
}

http.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers = setAuthorizationHeader(config.headers, `${getStoredTokenType()} ${token}`)
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

export default http

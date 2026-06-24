const trimTrailingSlash = (value) => value.trim().replace(/\/+$/, '')

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
)

export const REQUEST_TIMEOUT_MS = 15000

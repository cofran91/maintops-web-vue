/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {number | null} status
 * @property {string} [code]
 * @property {Record<string, string[]>} [errors]
 * @property {*} [data]
 * @property {boolean} isNetworkError
 */

export const DEFAULT_API_ERROR_MESSAGE = 'An unexpected error occurred.'

export const API_NETWORK_ERROR_MESSAGE =
  'The MaintOps API is unreachable. Check the service URL and confirm the service is running.'

export const API_TIMEOUT_ERROR_MESSAGE =
  'The request timed out. Confirm the service is available and try again.'

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

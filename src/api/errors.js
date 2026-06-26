import axios from 'axios'
import {
  API_NETWORK_ERROR_MESSAGE,
  API_TIMEOUT_ERROR_MESSAGE,
  DEFAULT_API_ERROR_MESSAGE,
} from '@/types/errors.js'

const isRecord = (value) => typeof value === 'object' && value !== null
const timeoutErrorCodes = new Set(['ECONNABORTED', 'ETIMEDOUT'])

const getMessage = (data) => {
  if (typeof data === 'string' && data.trim() !== '') {
    return data
  }

  if (!isRecord(data) || typeof data.message !== 'string') {
    return undefined
  }

  return data.message
}

const getCode = (data) => {
  if (!isRecord(data) || typeof data.code !== 'string') {
    return undefined
  }

  return data.code
}

const normalizeValidationErrors = (errors) => {
  if (!isRecord(errors)) {
    return undefined
  }

  const normalized = {}

  Object.entries(errors).forEach(([field, messages]) => {
    if (typeof messages === 'string') {
      normalized[field] = [messages]
      return
    }

    if (Array.isArray(messages)) {
      const stringMessages = messages.filter((message) => typeof message === 'string')

      if (stringMessages.length > 0) {
        normalized[field] = stringMessages
      }
    }
  })

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

const getValidationErrors = (data) => {
  if (!isRecord(data)) {
    return undefined
  }

  return normalizeValidationErrors(data.errors)
}

const getTransportErrorMessage = (error) => {
  if (error.response !== undefined) {
    return undefined
  }

  return timeoutErrorCodes.has(error.code) ? API_TIMEOUT_ERROR_MESSAGE : API_NETWORK_ERROR_MESSAGE
}

export const isApiError = (error) =>
  isRecord(error) &&
  typeof error.message === 'string' &&
  (typeof error.status === 'number' || error.status === null) &&
  typeof error.isNetworkError === 'boolean'

export const normalizeApiError = (error) => {
  if (isApiError(error)) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    return {
      message:
        getMessage(data) ??
        getTransportErrorMessage(error) ??
        error.message ??
        DEFAULT_API_ERROR_MESSAGE,
      status: error.response?.status ?? null,
      code: getCode(data) ?? error.code,
      errors: getValidationErrors(data),
      data,
      isNetworkError: error.response === undefined,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_API_ERROR_MESSAGE,
      status: null,
      isNetworkError: false,
    }
  }

  return {
    message: DEFAULT_API_ERROR_MESSAGE,
    status: null,
    isNetworkError: false,
  }
}

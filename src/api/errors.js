import axios from 'axios'
import { hasTranslation, t } from '@/i18n/index.js'

const isRecord = (value) => typeof value === 'object' && value !== null
const timeoutErrorCodes = new Set(['ECONNABORTED', 'ETIMEDOUT'])

const getCode = (data) => {
  if (!isRecord(data)) {
    return undefined
  }

  if (typeof data.code === 'string') {
    return data.code
  }

  if (isRecord(data.detail) && typeof data.detail.code === 'string') {
    return data.detail.code
  }

  return undefined
}

const translatedCodeMessage = (code, params = undefined) => {
  if (typeof code !== 'string') {
    return undefined
  }

  const key = `api.codes.${code}`

  return hasTranslation(key) ? t(key, params) : undefined
}

const getMessage = (data) => {
  if (typeof data === 'string' && data.trim() !== '') {
    return data
  }

  if (!isRecord(data)) {
    return undefined
  }

  if (typeof data.message === 'string') {
    return data.message
  }

  if (typeof data.detail === 'string') {
    return data.detail
  }

  if (isRecord(data.detail) && typeof data.detail.message === 'string') {
    return data.detail.message
  }

  return translatedCodeMessage(getCode(data), isRecord(data.detail) ? data.detail : data)
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

  if (isRecord(data.detail) && Array.isArray(data.detail.errors)) {
    return normalizeStructuredValidationErrors(data.detail.errors)
  }

  return normalizeValidationErrors(data.errors)
}

const validationErrorMessage = (error) => {
  const type = typeof error.type === 'string' ? error.type : 'default'
  const key = `api.validation.${type}`

  return hasTranslation(key) ? t(key, error.context) : t('api.validation.default')
}

const normalizeStructuredValidationErrors = (errors) => {
  const normalized = {}

  errors.forEach((error) => {
    if (!isRecord(error) || typeof error.field !== 'string' || error.field === '') {
      return
    }

    normalized[error.field] = [validationErrorMessage(error)]
  })

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

const getTransportErrorMessage = (error) => {
  if (error.response !== undefined) {
    return undefined
  }

  return timeoutErrorCodes.has(error.code) ? t('api.errors.timeout') : t('api.errors.network')
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
        t('api.errors.default'),
      status: error.response?.status ?? null,
      code: getCode(data) ?? error.code,
      errors: getValidationErrors(data),
      data,
      isNetworkError: error.response === undefined,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || t('api.errors.default'),
      status: null,
      isNetworkError: false,
    }
  }

  return {
    message: t('api.errors.default'),
    status: null,
    isNetworkError: false,
  }
}

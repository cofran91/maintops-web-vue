import axios from 'axios'
import { hasTranslation, t } from '@/i18n'

export interface ApiError {
  message: string
  status: number | null
  code?: string
  errors?: Record<string, string[]>
  data?: unknown
  isNetworkError: boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const timeoutErrorCodes = new Set(['ECONNABORTED', 'ETIMEDOUT'])

const getCode = (data: unknown) => {
  if (!isRecord(data)) return undefined
  if (typeof data.code === 'string') return data.code
  return isRecord(data.detail) && typeof data.detail.code === 'string'
    ? data.detail.code
    : undefined
}

const translatedCodeMessage = (code?: string, params?: Record<string, unknown>) => {
  if (!code) return undefined
  const key = `api.codes.${code}`
  return hasTranslation(key) ? t(key, params) : undefined
}

const getMessage = (data: unknown): string | undefined => {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (!isRecord(data)) {
    return undefined
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail
  }

  if (isRecord(data.detail) && typeof data.detail.message === 'string') {
    return data.detail.message
  }

  return translatedCodeMessage(
    getCode(data),
    isRecord(data.detail) ? data.detail : data,
  )
}

const validationErrorMessage = (error: Record<string, unknown>) => {
  const type = typeof error.type === 'string' ? error.type : 'default'
  const key = `api.validation.${type}`
  return hasTranslation(key)
    ? t(key, isRecord(error.context) ? error.context : undefined)
    : t('api.validation.default')
}

const getStructuredValidationErrors = (errors: unknown[]) => {
  const normalized: Record<string, string[]> = {}

  errors.forEach((error) => {
    if (!isRecord(error) || typeof error.field !== 'string' || !error.field) return
    normalized[error.field] = [validationErrorMessage(error)]
  })

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

const getValidationErrors = (data: unknown): Record<string, string[]> | undefined => {
  if (!isRecord(data)) {
    return undefined
  }

  if (isRecord(data.detail) && Array.isArray(data.detail.errors)) {
    return getStructuredValidationErrors(data.detail.errors)
  }

  if (!isRecord(data.errors)) return undefined

  const errors: Record<string, string[]> = {}

  Object.entries(data.errors).forEach(([field, messages]) => {
    if (typeof messages === 'string') {
      errors[field] = [messages]
    } else if (Array.isArray(messages)) {
      const validMessages = messages.filter((message): message is string => typeof message === 'string')

      if (validMessages.length > 0) {
        errors[field] = validMessages
      }
    }
  })

  return Object.keys(errors).length > 0 ? errors : undefined
}

export const isApiError = (error: unknown): error is ApiError =>
  isRecord(error) &&
  typeof error.message === 'string' &&
  (typeof error.status === 'number' || error.status === null) &&
  typeof error.isNetworkError === 'boolean'

export const normalizeApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const isTimeout = timeoutErrorCodes.has(error.code ?? '')

    return {
      message:
        getMessage(data) ??
        (isTimeout
          ? t('api.errors.timeout')
          : error.response
            ? error.message || t('api.errors.default')
            : t('api.errors.network')),
      status: error.response?.status ?? null,
      code: getCode(data) ?? error.code,
      errors: getValidationErrors(data),
      data,
      isNetworkError: error.response === undefined,
    }
  }

  return {
    message: error instanceof Error && error.message ? error.message : t('api.errors.default'),
    status: null,
    isNetworkError: false,
  }
}

import axios from 'axios'

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

  return undefined
}

const getValidationErrors = (data: unknown): Record<string, string[]> | undefined => {
  if (!isRecord(data) || !isRecord(data.errors)) {
    return undefined
  }

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
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'

    return {
      message:
        getMessage(data) ??
        (isTimeout
          ? 'La solicitud tardó demasiado. Intenta nuevamente.'
          : error.response
            ? 'No fue posible completar la solicitud.'
            : 'No fue posible conectarse con el servidor.'),
      status: error.response?.status ?? null,
      code: isRecord(data) && typeof data.code === 'string' ? data.code : error.code,
      errors: getValidationErrors(data),
      data,
      isNetworkError: error.response === undefined,
    }
  }

  return {
    message: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
    status: null,
    isNetworkError: false,
  }
}

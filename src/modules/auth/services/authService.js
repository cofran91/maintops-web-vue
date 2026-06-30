import http, { unwrapApiData } from '@/api/http.js'
import { t } from '@/i18n/index.js'

const unwrapApiMessage = (response, fallbackMessage) => response?.data?.message || fallbackMessage

export const login = async (credentials) => {
  const response = await http.post('/auth/login', credentials)

  return unwrapApiData(response)
}

export const requestPasswordReset = async (payload) => {
  const response = await http.post('/auth/forgot-password', payload)

  return unwrapApiMessage(response, t('auth.forgotPassword.successFallback'))
}

export const resetPassword = async (payload) => {
  const response = await http.post('/auth/reset-password', payload)

  return unwrapApiMessage(response, t('auth.resetPassword.successFallback'))
}

export const fetchCurrentUser = async () => {
  const response = await http.get('/auth/me')

  return unwrapApiData(response)
}

export const logout = async () => {
  await http.post('/auth/logout')
}

export const updateLanguage = async (locale) => {
  const response = await http.patch('/auth/language', { locale })

  return unwrapApiData(response)
}

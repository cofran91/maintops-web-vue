import http, { unwrapApiData } from '@/api/http'
import { t } from '@/i18n'
import type { LoginCredentials, LoginResponse, AuthUser } from '@/types/auth'
import type { PasswordResetPayload, PasswordResetRequest } from '@/types/auth'

interface ApiResponse<T> {
  data: T
  message?: string
}

export const login = async (credentials: LoginCredentials) => {
  const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', credentials)

  return unwrapApiData<LoginResponse>(response.data)
}

export const requestPasswordReset = async (payload: PasswordResetRequest) => {
  const response = await http.post<{ message?: string }>('/auth/forgot-password', payload)

  return response.data.message || t('auth.forgotPassword.successFallback')
}

export const resetPassword = async (payload: PasswordResetPayload) => {
  const response = await http.post<{ message?: string }>('/auth/reset-password', payload)

  return response.data.message || t('auth.resetPassword.successFallback')
}

export const fetchCurrentUser = async () => {
  const response = await http.get<ApiResponse<AuthUser>>('/auth/me')

  return unwrapApiData<AuthUser>(response.data)
}

export const logout = async () => {
  await http.post('/auth/logout')
}

export const updateLanguage = async (locale: string) => {
  const response = await http.patch<ApiResponse<{ locale: string }>>('/auth/language', { locale })

  return unwrapApiData<{ locale: string }>(response.data)
}

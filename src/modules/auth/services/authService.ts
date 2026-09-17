import http, { unwrapApiData } from '@/api/http'
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

  return response.data.message || 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
}

export const resetPassword = async (payload: PasswordResetPayload) => {
  const response = await http.post<{ message?: string }>('/auth/reset-password', payload)

  return response.data.message || 'Tu contraseña fue actualizada correctamente.'
}

export const fetchCurrentUser = async () => {
  const response = await http.get<ApiResponse<AuthUser>>('/auth/me')

  return unwrapApiData<AuthUser>(response.data)
}

export const logout = async () => {
  await http.post('/auth/logout')
}

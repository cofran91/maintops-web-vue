import http, { unwrapApiData } from '@/api/http'
import type { LoginCredentials, LoginResponse, AuthUser } from '@/types/auth'

interface ApiResponse<T> {
  data: T
  message?: string
}

export const login = async (credentials: LoginCredentials) => {
  const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', credentials)

  return unwrapApiData<LoginResponse>(response.data)
}

export const fetchCurrentUser = async () => {
  const response = await http.get<ApiResponse<AuthUser>>('/auth/me')

  return unwrapApiData<AuthUser>(response.data)
}

export const logout = async () => {
  await http.post('/auth/logout')
}

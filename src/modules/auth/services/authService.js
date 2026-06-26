import http, { unwrapApiData } from '@/api/http.js'

const unwrapApiMessage = (response, fallbackMessage) => response?.data?.message || fallbackMessage

export const login = async (credentials) => {
  const response = await http.post('/auth/login', credentials)

  return unwrapApiData(response)
}

export const requestPasswordReset = async (payload) => {
  const response = await http.post('/auth/forgot-password', payload)

  return unwrapApiMessage(response, 'If the email exists, a password reset link will be sent.')
}

export const resetPassword = async (payload) => {
  const response = await http.post('/auth/reset-password', payload)

  return unwrapApiMessage(response, 'Password updated successfully.')
}

export const fetchCurrentUser = async () => {
  const response = await http.get('/auth/me')

  return unwrapApiData(response)
}

export const logout = async () => {
  await http.post('/auth/logout')
}

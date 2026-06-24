import http, { unwrapApiData } from '@/api/http.js'

export const login = async (credentials) => {
  const response = await http.post('/auth/login', credentials)

  return unwrapApiData(response)
}

export const fetchCurrentUser = async () => {
  const response = await http.get('/auth/me')

  return unwrapApiData(response)
}

export const logout = async () => {
  await http.post('/auth/logout')
}

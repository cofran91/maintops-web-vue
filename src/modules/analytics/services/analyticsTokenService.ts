import http, { unwrapApiData } from '@/api/http'

interface ServiceTokenResponse {
  data: {
    token: string
    token_type?: string
    expires_in?: number
    audience?: string
  }
}

export const analyticsTokenApi = {
  async issue() {
    const response = await http.post<ServiceTokenResponse>('/auth/service-token', {
      audience: 'analytics',
    })

    return unwrapApiData(response.data)
  },
}

export default analyticsTokenApi

import http, { unwrapApiData } from '@/api/http'
import type { RealtimeToken } from '@/types/realtime'

interface ApiResponse<T> {
  data: T
  message?: string
}

export const realtimeTokenApi = {
  async issue() {
    const response = await http.post<ApiResponse<RealtimeToken>>('/auth/service-token', {
      audience: 'realtime',
    })

    return unwrapApiData<RealtimeToken>(response.data)
  },
}

export default realtimeTokenApi

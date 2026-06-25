import http, { unwrapApiData } from '@/api/http.js'

const ENDPOINT = '/auth/realtime-token'

export const realtimeTokenApi = {
  async issue() {
    const response = await http.post(ENDPOINT)

    return unwrapApiData(response.data, 'The realtime token could not be issued.')
  },
}

export default realtimeTokenApi

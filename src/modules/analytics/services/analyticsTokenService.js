import http, { unwrapApiData } from '@/api/http.js'

const ENDPOINT = '/auth/service-token'

export const analyticsTokenApi = {
  async issue() {
    const response = await http.post(ENDPOINT, { audience: 'analytics' })

    return unwrapApiData(response.data, 'The Analytics token could not be issued.')
  },
}

export default analyticsTokenApi

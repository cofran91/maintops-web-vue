import http, { unwrapApiData } from '@/api/http.js'

const ENDPOINT = '/dashboard'

export const dashboardApi = {
  async summary(config = {}) {
    const response = await http.get(ENDPOINT, config)

    return unwrapApiData(response.data, 'The operational dashboard could not be loaded.')
  },
}

export default dashboardApi

import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'

const ENDPOINT = '/audits'

export const auditsApi = {
  async index(params = {}) {
    const response = await http.get(ENDPOINT, {
      params: buildIndexParams(params),
    })

    return normalizePaginatedData(
      unwrapApiData(response.data, 'Audit records could not be loaded.'),
    )
  },
}

export default auditsApi

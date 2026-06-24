import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'

const ENDPOINT = '/workshops'

export const workshopsApi = {
  async index(params = {}) {
    const response = await http.get(ENDPOINT, {
      params: buildIndexParams(params),
    })

    return normalizePaginatedData(
      unwrapApiData(response.data, 'Workshops could not be loaded.'),
    )
  },

  async show(id) {
    const response = await http.get(`${ENDPOINT}/${id}`)

    return unwrapApiData(response.data, 'The selected workshop could not be loaded.')
  },
}

export default workshopsApi

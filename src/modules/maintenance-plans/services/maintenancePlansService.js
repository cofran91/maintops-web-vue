import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'

const ENDPOINT = '/maintenance-plans'

export const maintenancePlansApi = {
  async index(params = {}) {
    const response = await http.get(ENDPOINT, {
      params: buildIndexParams(params),
    })

    return normalizePaginatedData(
      unwrapApiData(response.data, 'Maintenance plans could not be loaded.'),
    )
  },

  async show(id) {
    const response = await http.get(`${ENDPOINT}/${id}`)

    return unwrapApiData(response.data, 'The selected maintenance plan could not be loaded.')
  },

  async create(payload) {
    const response = await http.post(ENDPOINT, payload)

    return unwrapApiData(response.data, 'The maintenance plan could not be created.')
  },

  async update(id, payload) {
    const response = await http.patch(`${ENDPOINT}/${id}`, payload)

    return unwrapApiData(response.data, 'The maintenance plan could not be updated.')
  },

  async remove(id) {
    await http.delete(`${ENDPOINT}/${id}`)
  },
}

export default maintenancePlansApi

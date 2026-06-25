import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'

const ENDPOINT = '/maintenance-order-items'

export const maintenanceOrderItemsApi = {
  async index(params = {}) {
    const response = await http.get(ENDPOINT, {
      params: buildIndexParams(params),
    })

    return normalizePaginatedData(
      unwrapApiData(response.data, 'Maintenance order items could not be loaded.'),
    )
  },

  async show(id) {
    const response = await http.get(`${ENDPOINT}/${id}`)

    return unwrapApiData(response.data, 'The selected order item could not be loaded.')
  },

  async update(id, payload) {
    const response = await http.patch(`${ENDPOINT}/${id}`, payload)

    return unwrapApiData(response.data, 'The order item could not be updated.')
  },
}

export default maintenanceOrderItemsApi

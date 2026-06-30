import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'
import { t } from '@/i18n/index.js'

const ENDPOINT = '/maintenance-order-items'

export const maintenanceOrderItemsApi = {
  async index(params = {}) {
    const response = await http.get(ENDPOINT, {
      params: buildIndexParams(params),
    })

    return normalizePaginatedData(
      unwrapApiData(response.data, t('orders.items.errors.load')),
    )
  },

  async show(id) {
    const response = await http.get(`${ENDPOINT}/${id}`)

    return unwrapApiData(response.data, t('orders.items.errors.show'))
  },

  async update(id, payload) {
    const response = await http.patch(`${ENDPOINT}/${id}`, payload)

    return unwrapApiData(response.data, t('orders.items.errors.update'))
  },
}

export default maintenanceOrderItemsApi

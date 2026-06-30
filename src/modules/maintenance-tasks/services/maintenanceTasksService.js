import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'
import { t } from '@/i18n/index.js'

const ENDPOINT = '/maintenance-tasks'

export const maintenanceTasksApi = {
  async index(params = {}) {
    const response = await http.get(ENDPOINT, {
      params: buildIndexParams(params),
    })

    return normalizePaginatedData(
      unwrapApiData(response.data, t('maintenanceTasks.errors.load')),
    )
  },

  async show(id) {
    const response = await http.get(`${ENDPOINT}/${id}`)

    return unwrapApiData(response.data, t('maintenanceTasks.errors.show'))
  },

  async create(payload) {
    const response = await http.post(ENDPOINT, payload)

    return unwrapApiData(response.data, t('maintenanceTasks.errors.create'))
  },

  async update(id, payload) {
    const response = await http.patch(`${ENDPOINT}/${id}`, payload)

    return unwrapApiData(response.data, t('maintenanceTasks.errors.update'))
  },

  async remove(id) {
    await http.delete(`${ENDPOINT}/${id}`)
  },
}

export default maintenanceTasksApi

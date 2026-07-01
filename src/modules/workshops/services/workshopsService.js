import http, { unwrapApiData } from '@/api/http.js'
import { downloadBlobResponse } from '@/api/files.js'
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

  async create(payload) {
    const response = await http.post(ENDPOINT, payload)

    return unwrapApiData(response.data, 'The workshop could not be created.')
  },

  async update(id, payload) {
    const response = await http.patch(`${ENDPOINT}/${id}`, payload)

    return unwrapApiData(response.data, 'The workshop could not be updated.')
  },

  async remove(id) {
    await http.delete(`${ENDPOINT}/${id}`)
  },

  async exportWorkshops() {
    const response = await http.get(`${ENDPOINT}/export`, {
      responseType: 'blob',
    })

    downloadBlobResponse(response, 'workshops.xlsx')
  },

  async importWorkshops(file) {
    const formData = new FormData()

    formData.append('file', file)

    const response = await http.post(`${ENDPOINT}/import`, formData)

    return unwrapApiData(response.data, 'Workshops could not be imported.')
  },
}

export default workshopsApi

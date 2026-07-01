import http, { unwrapApiData } from '@/api/http.js'
import { downloadBlobResponse } from '@/api/files.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/workshops'

export const workshopsApi = {
  ...createResourceService({
    endpoint: ENDPOINT,
    messages: {
      load: 'Workshops could not be loaded.',
      show: 'The selected workshop could not be loaded.',
      create: 'The workshop could not be created.',
      update: 'The workshop could not be updated.',
    },
  }),

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

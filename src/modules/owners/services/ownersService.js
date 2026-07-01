import http, { unwrapApiData } from '@/api/http.js'
import { downloadBlobResponse } from '@/api/files.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/owners'

export const ownersApi = {
  ...createResourceService({
    endpoint: ENDPOINT,
    messages: {
      load: 'Owners could not be loaded.',
      show: 'The selected owner could not be loaded.',
      create: 'The owner could not be created.',
      update: 'The owner could not be updated.',
    },
  }),

  async exportOwners() {
    const response = await http.get(`${ENDPOINT}/export`, {
      responseType: 'blob',
    })

    downloadBlobResponse(response, 'owners.xlsx')
  },

  async importOwners(file) {
    const formData = new FormData()

    formData.append('file', file)

    const response = await http.post(`${ENDPOINT}/import`, formData)

    return unwrapApiData(response.data, 'Owners could not be imported.')
  },
}

export default ownersApi

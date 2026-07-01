import http, { unwrapApiData } from '@/api/http.js'
import { downloadBlobResponse } from '@/api/files.js'
import { t } from '@/i18n/index.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/vehicles'

export const vehiclesApi = {
  ...createResourceService({
    endpoint: ENDPOINT,
    messages: {
      load: () => t('vehicles.errors.load'),
      show: () => t('vehicles.errors.show'),
      create: () => t('vehicles.errors.create'),
      update: () => t('vehicles.errors.update'),
    },
  }),

  async exportVehicles() {
    const response = await http.get(`${ENDPOINT}/export`, {
      responseType: 'blob',
    })

    downloadBlobResponse(response, 'vehicles.xlsx')
  },

  async importVehicles(file) {
    const formData = new FormData()

    formData.append('file', file)

    const response = await http.post(`${ENDPOINT}/import`, formData)

    return unwrapApiData(response.data, t('vehicles.errors.import'))
  },
}

export default vehiclesApi

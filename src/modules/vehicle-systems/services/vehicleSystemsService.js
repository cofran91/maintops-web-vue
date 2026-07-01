import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/vehicle-systems'

export const vehicleSystemsApi = createResourceService({
  endpoint: ENDPOINT,
  methods: ['index'],
  messages: {
    load: 'Vehicle systems could not be loaded.',
  },
})

export default vehicleSystemsApi

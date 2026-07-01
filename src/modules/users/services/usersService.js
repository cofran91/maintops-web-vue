import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/users'

export const usersApi = createResourceService({
  endpoint: ENDPOINT,
  messages: {
    load: 'Users could not be loaded.',
    show: 'The selected user could not be loaded.',
    create: 'The user could not be created.',
    update: 'The user could not be updated.',
  },
})

export default usersApi

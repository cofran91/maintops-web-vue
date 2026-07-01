import { t } from '@/i18n/index.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/maintenance-plans'

export const maintenancePlansApi = createResourceService({
  endpoint: ENDPOINT,
  messages: {
    load: () => t('maintenancePlans.errors.load'),
    show: () => t('maintenancePlans.errors.show'),
    create: () => t('maintenancePlans.errors.create'),
    update: () => t('maintenancePlans.errors.update'),
  },
})

export default maintenancePlansApi

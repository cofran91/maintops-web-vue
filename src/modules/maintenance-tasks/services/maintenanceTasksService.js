import { t } from '@/i18n/index.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/maintenance-tasks'

export const maintenanceTasksApi = createResourceService({
  endpoint: ENDPOINT,
  messages: {
    load: () => t('maintenanceTasks.errors.load'),
    show: () => t('maintenanceTasks.errors.show'),
    create: () => t('maintenanceTasks.errors.create'),
    update: () => t('maintenanceTasks.errors.update'),
  },
})

export default maintenanceTasksApi

import { t } from '@/i18n/index.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/maintenance-orders'

export const maintenanceOrdersApi = createResourceService({
  endpoint: ENDPOINT,
  methods: ['index', 'show', 'create', 'update'],
  messages: {
    load: () => t('orders.errors.load'),
    show: () => t('orders.errors.show'),
    create: () => t('orders.errors.create'),
    update: () => t('orders.errors.update'),
  },
})

export default maintenanceOrdersApi

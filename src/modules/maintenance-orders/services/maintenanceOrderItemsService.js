import { t } from '@/i18n/index.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/maintenance-order-items'

export const maintenanceOrderItemsApi = createResourceService({
  endpoint: ENDPOINT,
  methods: ['index', 'show', 'update'],
  messages: {
    load: () => t('orders.items.errors.load'),
    show: () => t('orders.items.errors.show'),
    update: () => t('orders.items.errors.update'),
  },
})

export default maintenanceOrderItemsApi

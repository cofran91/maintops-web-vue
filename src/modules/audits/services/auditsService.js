import { t } from '@/i18n/index.js'
import { createResourceService } from '@/modules/shared/services/createResourceService.js'

const ENDPOINT = '/audits'

export const auditsApi = createResourceService({
  endpoint: ENDPOINT,
  methods: ['index'],
  messages: {
    load: () => t('audits.errors.load'),
  },
})

export default auditsApi

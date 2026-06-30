import http, { unwrapApiData } from '@/api/http.js'
import { t } from '@/i18n/index.js'

const ENDPOINT = '/auth/service-token'

export const analyticsTokenApi = {
  async issue() {
    const response = await http.post(ENDPOINT, { audience: 'analytics' })

    return unwrapApiData(response.data, t('analytics.errors.tokenIssue'))
  },
}

export default analyticsTokenApi

import http, { unwrapApiData } from '@/api/http.js'
import { t } from '@/i18n/index.js'

const ENDPOINT = '/auth/service-token'

export const realtimeTokenApi = {
  async issue() {
    const response = await http.post(ENDPOINT, { audience: 'realtime' })

    return unwrapApiData(response.data, t('realtime.errors.tokenIssueFailed'))
  },
}

export default realtimeTokenApi

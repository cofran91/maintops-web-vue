import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'
import { t } from '@/i18n/index.js'

const ENDPOINT = '/audits'

export const auditsApi = {
  async index(params = {}) {
    const response = await http.get(ENDPOINT, {
      params: buildIndexParams(params),
    })

    return normalizePaginatedData(
      unwrapApiData(response.data, t('audits.errors.load')),
    )
  },
}

export default auditsApi

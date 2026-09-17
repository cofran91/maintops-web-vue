import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type { AuditFilters, AuditPage } from '@/types/audit'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface AuditQuery extends Partial<AuditFilters> {
  page?: number
  per_page?: number
}

export const auditsApi = {
  async index(query: AuditQuery = {}, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<AuditPage>>('/audits', {
      ...config,
      params: {
        search: query.search?.trim() || undefined,
        event: query.event || undefined,
        user_id: query.user_id || undefined,
        url: query.url?.trim() || undefined,
        tags: query.tags?.trim() || undefined,
        created_from: query.created_from || undefined,
        created_to: query.created_to || undefined,
        page: query.page || 1,
        per_page: query.per_page || 15,
      },
    })

    return unwrapApiData<AuditPage>(response.data)
  },
}

export default auditsApi

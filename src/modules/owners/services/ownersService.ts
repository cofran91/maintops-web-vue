import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type { OwnerPage } from '@/types/owner'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface OwnerQuery {
  search?: string
  is_active?: boolean
  page?: number
  per_page?: number
}

export const ownersApi = {
  async index(query: OwnerQuery = {}, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<OwnerPage>>('/owners', {
      ...config,
      params: {
        search: query.search || undefined,
        is_active: query.is_active,
        page: query.page || 1,
        per_page: query.per_page || 100,
      },
    })

    return unwrapApiData<OwnerPage>(response.data)
  },
}

export default ownersApi

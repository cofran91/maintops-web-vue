import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type { OwnerPage } from '@/types/owner'

interface ApiResponse<T> {
  data: T
  message?: string
}

export const ownersApi = {
  async index(config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<OwnerPage>>('/owners', {
      ...config,
      params: {
        is_active: true,
        page: 1,
        per_page: 100,
      },
    })

    return unwrapApiData<OwnerPage>(response.data)
  },
}

export default ownersApi

import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type {
  MaintenanceOrderFilters,
  MaintenanceOrderPage,
} from '@/types/maintenanceOrder'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface MaintenanceOrderQuery extends MaintenanceOrderFilters {
  page: number
  per_page: number
}

export const maintenanceOrdersApi = {
  async index(query: MaintenanceOrderQuery, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<MaintenanceOrderPage>>('/maintenance-orders', {
      ...config,
      params: query,
    })

    return unwrapApiData<MaintenanceOrderPage>(response.data)
  },
}

export default maintenanceOrdersApi

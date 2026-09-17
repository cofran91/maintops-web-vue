import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type {
  MaintenanceOrderFilters,
  MaintenanceOrder,
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

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<MaintenanceOrder>>(`/maintenance-orders/${id}`, config)

    return unwrapApiData<MaintenanceOrder>(response.data)
  },
}

export default maintenanceOrdersApi

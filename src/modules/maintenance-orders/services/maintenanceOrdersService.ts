import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type {
  MaintenanceOrderCreatePayload,
  MaintenanceOrderAssignmentPayload,
  MaintenanceOrderItemsPayload,
  MaintenanceOrderFilters,
  MaintenanceOrder,
  MaintenanceOrderItemStatus,
  MaintenanceOrderPage,
} from '@/types/maintenanceOrder'
import type { MaintenanceOrderAction } from '@/modules/maintenance-orders/utils/orderStatusRules'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface MaintenanceOrderQuery extends Partial<MaintenanceOrderFilters> {
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

  async create(payload: MaintenanceOrderCreatePayload) {
    const response = await http.post<ApiResponse<MaintenanceOrder>>('/maintenance-orders', payload)

    return unwrapApiData<MaintenanceOrder>(response.data)
  },

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<MaintenanceOrder>>(`/maintenance-orders/${id}`, config)

    return unwrapApiData<MaintenanceOrder>(response.data)
  },

  async updateStatus(id: string | number, status: MaintenanceOrderAction) {
    const response = await http.patch<ApiResponse<MaintenanceOrder>>(`/maintenance-orders/${id}`, {
      status,
    })

    return unwrapApiData<MaintenanceOrder>(response.data)
  },

  async assign(id: string | number, payload: MaintenanceOrderAssignmentPayload) {
    const response = await http.patch<ApiResponse<MaintenanceOrder>>(`/maintenance-orders/${id}`, payload)

    return unwrapApiData<MaintenanceOrder>(response.data)
  },

  async addItems(id: string | number, payload: MaintenanceOrderItemsPayload) {
    const response = await http.post<ApiResponse<MaintenanceOrder>>(`/maintenance-orders/${id}/items`, payload)

    return unwrapApiData<MaintenanceOrder>(response.data)
  },

  async removeItem(itemId: string | number) {
    await http.delete(`/maintenance-order-items/${itemId}`)
  },

  async updateItemStatus(id: string | number, status: MaintenanceOrderItemStatus) {
    const response = await http.patch(`/maintenance-order-items/${id}`, { status })

    return unwrapApiData(response.data)
  },
}

export default maintenanceOrdersApi

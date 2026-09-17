import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type {
  MaintenanceTask,
  MaintenanceTaskFilters,
  MaintenanceTaskPage,
  MaintenanceTaskPayload,
} from '@/types/maintenanceTask'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface MaintenanceTaskQuery extends Partial<MaintenanceTaskFilters> {
  page?: number
  per_page?: number
}

export const maintenanceTasksApi = {
  async index(query: MaintenanceTaskQuery = {}, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<MaintenanceTaskPage>>('/maintenance-tasks', {
      ...config,
      params: {
        search: query.search || undefined,
        vehicle_system_id: query.vehicle_system_id || undefined,
        status: query.status || undefined,
        is_active: query.is_active === 'active' ? true : query.is_active === 'inactive' ? false : undefined,
        page: query.page || 1,
        per_page: query.per_page || 15,
      },
    })

    return unwrapApiData<MaintenanceTaskPage>(response.data)
  },

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<MaintenanceTask>>(`/maintenance-tasks/${id}`, config)
    return unwrapApiData<MaintenanceTask>(response.data)
  },

  async create(payload: MaintenanceTaskPayload) {
    const response = await http.post<ApiResponse<MaintenanceTask>>('/maintenance-tasks', payload)
    return unwrapApiData<MaintenanceTask>(response.data)
  },

  async update(id: string | number, payload: MaintenanceTaskPayload) {
    const response = await http.put<ApiResponse<MaintenanceTask>>(`/maintenance-tasks/${id}`, payload)
    return unwrapApiData<MaintenanceTask>(response.data)
  },

  async remove(id: string | number) {
    await http.delete(`/maintenance-tasks/${id}`)
  },
}

export default maintenanceTasksApi

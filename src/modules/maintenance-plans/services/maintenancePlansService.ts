import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type {
  MaintenancePlan,
  MaintenancePlanFilters,
  MaintenancePlanPage,
  MaintenancePlanPayload,
} from '@/types/maintenancePlan'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface MaintenancePlanQuery extends Partial<MaintenancePlanFilters> {
  page?: number
  per_page?: number
}

export const maintenancePlansApi = {
  async index(query: MaintenancePlanQuery = {}, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<MaintenancePlanPage>>('/maintenance-plans', {
      ...config,
      params: {
        search: query.search || undefined,
        name: query.name || undefined,
        code: query.code || undefined,
        is_active:
          query.is_active === 'active' ? true : query.is_active === 'inactive' ? false : undefined,
        task_id: query.task_id || undefined,
        recommended_interval_days_from: query.recommended_interval_days_from || undefined,
        recommended_interval_days_to: query.recommended_interval_days_to || undefined,
        recommended_interval_km_from: query.recommended_interval_km_from || undefined,
        recommended_interval_km_to: query.recommended_interval_km_to || undefined,
        created_from: query.created_from || undefined,
        created_to: query.created_to || undefined,
        page: query.page || 1,
        per_page: query.per_page || 15,
      },
    })

    return unwrapApiData<MaintenancePlanPage>(response.data)
  },

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<MaintenancePlan>>(`/maintenance-plans/${id}`, config)

    return unwrapApiData<MaintenancePlan>(response.data)
  },

  async create(payload: MaintenancePlanPayload) {
    const response = await http.post<ApiResponse<MaintenancePlan>>('/maintenance-plans', payload)

    return unwrapApiData<MaintenancePlan>(response.data)
  },

  async update(id: string | number, payload: MaintenancePlanPayload) {
    const response = await http.put<ApiResponse<MaintenancePlan>>(`/maintenance-plans/${id}`, payload)

    return unwrapApiData<MaintenancePlan>(response.data)
  },

  async remove(id: string | number) {
    await http.delete(`/maintenance-plans/${id}`)
  },
}

export default maintenancePlansApi

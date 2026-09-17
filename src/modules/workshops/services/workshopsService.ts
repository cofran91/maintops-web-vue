import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type { Workshop, WorkshopFilters, WorkshopPage } from '@/types/workshop'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface WorkshopQuery extends Partial<WorkshopFilters> {
  is_active?: boolean
  page?: number
  per_page?: number
}

export const workshopsApi = {
  async index(query: WorkshopQuery = {}, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<WorkshopPage>>('/workshops', {
      ...config,
      params: {
        search: query.search || undefined,
        city: query.city || undefined,
        is_active: query.is_active,
        page: query.page || 1,
        per_page: query.per_page || 100,
      },
    })

    return unwrapApiData<WorkshopPage>(response.data)
  },

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<Workshop>>(`/workshops/${id}`, config)

    return unwrapApiData<Workshop>(response.data)
  },
}

export default workshopsApi

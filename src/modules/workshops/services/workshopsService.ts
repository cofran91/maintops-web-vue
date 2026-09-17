import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import { downloadBlobResponse } from '@/api/files'
import type { ImportSummary } from '@/types/import'
import type { Workshop, WorkshopFilters, WorkshopPage, WorkshopPayload } from '@/types/workshop'

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
        name: query.name || undefined,
        code: query.code || undefined,
        city: query.city || undefined,
        phone: query.phone || undefined,
        email: query.email || undefined,
        is_active: query.is_active,
        manager_user_id: query.manager_user_id || undefined,
        vehicle_system_id: query.vehicle_system_id || undefined,
        created_from: query.created_from || undefined,
        created_to: query.created_to || undefined,
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

  async create(payload: WorkshopPayload) {
    const response = await http.post<ApiResponse<Workshop>>('/workshops', payload)

    return unwrapApiData<Workshop>(response.data)
  },

  async update(id: string | number, payload: WorkshopPayload) {
    const response = await http.put<ApiResponse<Workshop>>(`/workshops/${id}`, payload)

    return unwrapApiData<Workshop>(response.data)
  },

  async remove(id: string | number) {
    await http.delete(`/workshops/${id}`)
  },

  async exportWorkshops() {
    const response = await http.get('/workshops/export', { responseType: 'blob' })

    downloadBlobResponse(response, 'workshops.xlsx')
  },

  async importWorkshops(file: File): Promise<ImportSummary> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await http.post<ApiResponse<ImportSummary>>('/workshops/import', formData)

    return unwrapApiData<ImportSummary>(response.data)
  },
}

export default workshopsApi

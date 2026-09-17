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

  async create(payload: WorkshopPayload) {
    const response = await http.post<ApiResponse<Workshop>>('/workshops', payload)

    return unwrapApiData<Workshop>(response.data)
  },

  async update(id: string | number, payload: WorkshopPayload) {
    const response = await http.put<ApiResponse<Workshop>>(`/workshops/${id}`, payload)

    return unwrapApiData<Workshop>(response.data)
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

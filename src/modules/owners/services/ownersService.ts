import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import { downloadBlobResponse } from '@/api/files'
import type { ImportSummary } from '@/types/import'
import type { Owner, OwnerPage, OwnerPayload } from '@/types/owner'

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

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<Owner>>(`/owners/${id}`, config)

    return unwrapApiData<Owner>(response.data)
  },

  async create(payload: OwnerPayload) {
    const response = await http.post<ApiResponse<Owner>>('/owners', payload)

    return unwrapApiData<Owner>(response.data)
  },

  async update(id: string | number, payload: OwnerPayload) {
    const response = await http.put<ApiResponse<Owner>>(`/owners/${id}`, payload)

    return unwrapApiData<Owner>(response.data)
  },

  async remove(id: string | number) {
    await http.delete(`/owners/${id}`)
  },

  async exportOwners() {
    const response = await http.get('/owners/export', { responseType: 'blob' })

    downloadBlobResponse(response, 'owners.xlsx')
  },

  async importOwners(file: File): Promise<ImportSummary> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await http.post<ApiResponse<ImportSummary>>('/owners/import', formData)

    return unwrapApiData<ImportSummary>(response.data)
  },
}

export default ownersApi

import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type { Vehicle, VehicleFilters, VehiclePage, VehiclePayload } from '@/types/vehicle'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface VehicleQuery extends Partial<VehicleFilters> {
  page: number
  per_page: number
}

export const vehiclesApi = {
  async index(query: Partial<VehicleQuery> = {}, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<VehiclePage>>('/vehicles', {
      ...config,
      params: {
        search: query.search || undefined,
        brand: query.brand || undefined,
        model: query.model || undefined,
        year: query.year || undefined,
        page: query.page || 1,
        per_page: query.per_page || 100,
      },
    })

    return unwrapApiData<VehiclePage>(response.data)
  },

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<Vehicle>>(`/vehicles/${id}`, config)

    return unwrapApiData<Vehicle>(response.data)
  },

  async create(payload: VehiclePayload) {
    const response = await http.post<ApiResponse<Vehicle>>('/vehicles', payload)

    return unwrapApiData<Vehicle>(response.data)
  },

  async update(id: string | number, payload: VehiclePayload) {
    const response = await http.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, payload)

    return unwrapApiData<Vehicle>(response.data)
  },

  async remove(id: string | number) {
    await http.delete(`/vehicles/${id}`)
  },
}

export default vehiclesApi

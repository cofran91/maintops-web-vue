import http, { unwrapApiData } from '@/api/http'
import type { VehicleSystemPage } from '@/types/vehicleSystem'

interface ApiResponse<T> {
  data: T
  message?: string
}

export const vehicleSystemsApi = {
  async index() {
    const response = await http.get<ApiResponse<VehicleSystemPage>>('/vehicle-systems', {
      params: { page: 1, per_page: 100 },
    })

    return unwrapApiData<VehicleSystemPage>(response.data)
  },
}

export default vehicleSystemsApi

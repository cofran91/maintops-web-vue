import http, { unwrapApiData } from '@/api/http'
import type { MaintenanceOrderPagination, MaintenanceOrderVehicle } from '@/types/maintenanceOrder'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface VehiclePage {
  items: MaintenanceOrderVehicle[]
  pagination: MaintenanceOrderPagination
}

export const vehiclesApi = {
  async index(search = '') {
    const response = await http.get<ApiResponse<VehiclePage>>('/vehicles', {
      params: {
        search: search || undefined,
        page: 1,
        per_page: 100,
      },
    })

    return unwrapApiData<VehiclePage>(response.data)
  },
}

export default vehiclesApi

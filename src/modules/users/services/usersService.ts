import http, { unwrapApiData } from '@/api/http'
import type { MaintenanceOrderPagination, MaintenanceOrderPerson } from '@/types/maintenanceOrder'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface UserPage {
  items: MaintenanceOrderPerson[]
  pagination: MaintenanceOrderPagination
}

export const usersApi = {
  async advisors() {
    const response = await http.get<ApiResponse<UserPage>>('/users', {
      params: {
        role: 'advisor',
        is_active: true,
        page: 1,
        per_page: 100,
      },
    })

    return unwrapApiData<UserPage>(response.data)
  },
}

export default usersApi

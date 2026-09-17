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
  async byRole(role: 'advisor' | 'workshop_manager' | 'technician') {
    const response = await http.get<ApiResponse<UserPage>>('/users', {
      params: {
        role,
        is_active: true,
        page: 1,
        per_page: 100,
      },
    })

    return unwrapApiData<UserPage>(response.data)
  },

  async advisors() {
    return usersApi.byRole('advisor')
  },

  async workshopManagers() {
    return usersApi.byRole('workshop_manager')
  },

  async technicians() {
    return usersApi.byRole('technician')
  },
}

export default usersApi

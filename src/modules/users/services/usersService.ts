import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type { User, UserFilters, UserPage, UserPayload } from '@/types/user'

interface ApiResponse<T> {
  data: T
  message?: string
}

interface UserQuery extends Partial<UserFilters> {
  page?: number
  per_page?: number
}

export const usersApi = {
  async index(query: UserQuery = {}, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<UserPage>>('/users', {
      ...config,
      params: {
        search: query.search || undefined,
        role: query.role || undefined,
        is_active:
          query.status === 'active' ? true : query.status === 'inactive' ? false : undefined,
        page: query.page || 1,
        per_page: query.per_page || 15,
      },
    })

    return unwrapApiData<UserPage>(response.data)
  },

  async byRole(role: 'advisor' | 'workshop_manager' | 'technician') {
    return usersApi.index({ role, status: 'active', page: 1, per_page: 100 })
  },

  async show(id: string | number, config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<User>>(`/users/${id}`, config)

    return unwrapApiData<User>(response.data)
  },

  async create(payload: UserPayload) {
    const response = await http.post<ApiResponse<User>>('/users', payload)

    return unwrapApiData<User>(response.data)
  },

  async update(id: string | number, payload: UserPayload) {
    const response = await http.put<ApiResponse<User>>(`/users/${id}`, payload)

    return unwrapApiData<User>(response.data)
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

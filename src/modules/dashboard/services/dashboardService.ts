import type { AxiosRequestConfig } from 'axios'
import http, { unwrapApiData } from '@/api/http'
import type { DashboardSummary } from '@/types/dashboard'

interface ApiResponse<T> {
  data: T
  message?: string
}

export const dashboardApi = {
  async summary(config: AxiosRequestConfig = {}) {
    const response = await http.get<ApiResponse<DashboardSummary>>('/dashboard', config)

    return unwrapApiData<DashboardSummary>(response.data)
  },
}

export default dashboardApi

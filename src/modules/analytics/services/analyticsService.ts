import axios, { type AxiosRequestConfig } from 'axios'
import { normalizeApiError } from '@/api/errors'
import { integrations } from '@/config/integrations'
import type {
  AnalyticsEndpointResponse,
  AnalyticsFilters,
  AnalyticsOverview,
} from '@/types/analytics'
import analyticsTokenApi from './analyticsTokenService'

const requestParams = (filters: AnalyticsFilters, forecast = false) => ({
  ...(filters.start_date ? { start_date: filters.start_date } : {}),
  ...(filters.end_date ? { end_date: filters.end_date } : {}),
  ...(filters.technician_id ? { technician_id: filters.technician_id } : {}),
  ...(filters.workshop_id ? { workshop_id: filters.workshop_id } : {}),
  ...(forecast && filters.horizon_days ? { horizon_days: filters.horizon_days } : {}),
})

const analyticsRequest = async (
  token: { token: string; token_type?: string },
  endpoint: string,
  filters: AnalyticsFilters,
  config?: AxiosRequestConfig,
) => {
  if (!integrations.analyticsBaseUrl) {
    throw new Error('El servicio de analítica no está configurado.')
  }

  try {
    const response = await axios.get<AnalyticsEndpointResponse>(
      `${integrations.analyticsBaseUrl}/analytics/${endpoint}`,
      {
        ...config,
        params: requestParams(filters, ['workload-forecast', 'risk-alerts', 'recommendations'].includes(endpoint)),
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'es',
          'X-Locale': 'es',
          Authorization: `${token.token_type ?? 'Bearer'} ${token.token}`,
          ...config?.headers,
        },
      },
    )

    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

const withToken = (endpoint: string, filters: AnalyticsFilters, config?: AxiosRequestConfig) =>
  analyticsTokenApi.issue().then((token) => analyticsRequest(token, endpoint, filters, config))

export const analyticsApi = {
  technicianEfficiency: (filters: AnalyticsFilters = {}, config?: AxiosRequestConfig) =>
    withToken('technician-efficiency', filters, config),
  workshopBottlenecks: (filters: AnalyticsFilters = {}, config?: AxiosRequestConfig) =>
    withToken('workshop-bottlenecks', filters, config),
  workloadForecast: (filters: AnalyticsFilters = {}, config?: AxiosRequestConfig) =>
    withToken('workload-forecast', filters, config),
  riskAlerts: (filters: AnalyticsFilters = {}, config?: AxiosRequestConfig) =>
    withToken('risk-alerts', filters, config),
  recommendations: (filters: AnalyticsFilters = {}, config?: AxiosRequestConfig) =>
    withToken('recommendations', filters, config),
  async overview(filters: AnalyticsFilters = {}, config?: AxiosRequestConfig): Promise<AnalyticsOverview> {
    const token = await analyticsTokenApi.issue()
    const [technicianEfficiency, workshopBottlenecks, workloadForecast, riskAlerts, recommendations] =
      await Promise.all([
        analyticsRequest(token, 'technician-efficiency', filters, config),
        analyticsRequest(token, 'workshop-bottlenecks', filters, config),
        analyticsRequest(token, 'workload-forecast', filters, config),
        analyticsRequest(token, 'risk-alerts', filters, config),
        analyticsRequest(token, 'recommendations', filters, config),
      ])

    return { technicianEfficiency, workshopBottlenecks, workloadForecast, riskAlerts, recommendations }
  },
}

export default analyticsApi

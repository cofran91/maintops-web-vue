import axios from 'axios'
import { normalizeApiError } from '@/api/errors.js'
import { integrations } from '@/config/integrations.js'
import analyticsTokenApi from '@/modules/analytics/services/analyticsTokenService.js'

const observedParams = (filters = {}) => ({
  ...(filters.start_date ? { start_date: filters.start_date } : {}),
  ...(filters.end_date ? { end_date: filters.end_date } : {}),
  ...(filters.technician_id ? { technician_id: filters.technician_id } : {}),
  ...(filters.workshop_id ? { workshop_id: filters.workshop_id } : {}),
})

const workloadParams = (filters = {}) => ({
  ...(filters.horizon_days ? { horizon_days: filters.horizon_days } : {}),
  ...(filters.workshop_id ? { workshop_id: filters.workshop_id } : {}),
})

const analyticsRequest = async (analyticsToken, endpoint, params = {}) => {
  const baseUrl = integrations.analyticsBaseUrl

  if (baseUrl === null) {
    throw new Error('Analytics is not configured for this environment.')
  }

  try {
    const response = await axios.get(`${baseUrl}/analytics/${endpoint}`, {
      params,
      headers: {
        Accept: 'application/json',
        Authorization: `${analyticsToken.token_type ?? 'Bearer'} ${analyticsToken.token}`,
      },
    })

    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

const withToken = async (request) => request(await analyticsTokenApi.issue())

export const analyticsApi = {
  technicianEfficiency(filters = {}) {
    return withToken((token) =>
      analyticsRequest(token, 'technician-efficiency', observedParams(filters)),
    )
  },

  workshopBottlenecks(filters = {}) {
    return withToken((token) =>
      analyticsRequest(token, 'workshop-bottlenecks', observedParams(filters)),
    )
  },

  workloadForecast(filters = {}) {
    return withToken((token) =>
      analyticsRequest(token, 'workload-forecast', workloadParams(filters)),
    )
  },

  riskAlerts(filters = {}) {
    return withToken((token) => analyticsRequest(token, 'risk-alerts', workloadParams(filters)))
  },

  recommendations(filters = {}) {
    return withToken((token) =>
      analyticsRequest(token, 'recommendations', workloadParams(filters)),
    )
  },

  async overview(filters = {}) {
    const token = await analyticsTokenApi.issue()
    const technicianEfficiency = analyticsRequest(
      token,
      'technician-efficiency',
      observedParams(filters),
    )
    const workshopBottlenecks = analyticsRequest(
      token,
      'workshop-bottlenecks',
      observedParams(filters),
    )
    const workloadForecast = analyticsRequest(
      token,
      'workload-forecast',
      workloadParams(filters),
    )
    const riskAlerts = analyticsRequest(token, 'risk-alerts', workloadParams(filters))
    const recommendations = analyticsRequest(
      token,
      'recommendations',
      workloadParams(filters),
    )

    const [
      technicianEfficiencyResponse,
      workshopBottlenecksResponse,
      workloadForecastResponse,
      riskAlertsResponse,
      recommendationsResponse,
    ] = await Promise.all([
      technicianEfficiency,
      workshopBottlenecks,
      workloadForecast,
      riskAlerts,
      recommendations,
    ])

    return {
      technicianEfficiency: technicianEfficiencyResponse,
      workshopBottlenecks: workshopBottlenecksResponse,
      workloadForecast: workloadForecastResponse,
      riskAlerts: riskAlertsResponse,
      recommendations: recommendationsResponse,
    }
  },
}

export default analyticsApi

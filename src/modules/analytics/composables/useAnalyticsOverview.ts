import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { normalizeApiError } from '@/api/errors'
import { integrations } from '@/config/integrations'
import analyticsApi from '@/modules/analytics/services/analyticsService'
import { useAuthStore } from '@/stores/auth'

const positiveInteger = (value: unknown) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const canceled = (error: unknown) => {
  if (!error || typeof error !== 'object') return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || ['AbortError', 'CanceledError'].includes(requestError.name ?? '')
}

export const useAnalyticsOverview = () => {
  const authStore = useAuthStore()
  const loading = ref(false)
  const errorMessage = ref('')
  const overview = ref<Awaited<ReturnType<typeof analyticsApi.overview>> | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const filters = reactive({ startDate: '', endDate: '', technicianId: '', workshopId: '', horizonDays: 14 })
  let controller: AbortController | null = null

  const scopedWorkshopId = computed(() => {
    const user = authStore.user as (typeof authStore.user & { workshop_id?: number; workshop?: { id?: number } }) | null
    return user?.workshop_id ?? user?.workshop?.id ?? null
  })
  const canEditWorkshopFilter = computed(() => scopedWorkshopId.value === null)
  const analyticsEnabled = computed(() => Boolean(integrations.analyticsBaseUrl))
  const requestFilters = computed(() => ({
    ...(filters.startDate ? { start_date: filters.startDate } : {}),
    ...(filters.endDate ? { end_date: filters.endDate } : {}),
    ...(positiveInteger(filters.technicianId) ? { technician_id: positiveInteger(filters.technicianId)! } : {}),
    ...(positiveInteger(filters.workshopId) ? { workshop_id: positiveInteger(filters.workshopId)! } : {}),
    ...(positiveInteger(filters.horizonDays) ? { horizon_days: positiveInteger(filters.horizonDays)! } : {}),
  }))

  const technicianMetrics = computed(() => overview.value?.technicianEfficiency.technicians ?? [])
  const workshopMetrics = computed(() => overview.value?.workshopBottlenecks.workshops ?? [])
  const forecasts = computed(() => overview.value?.workloadForecast.forecasts ?? [])
  const alerts = computed(() => overview.value?.riskAlerts.alerts ?? [])
  const recommendations = computed(() => overview.value?.recommendations.recommendations ?? [])
  const observedSample = computed(() => overview.value?.technicianEfficiency.sample ?? null)

  const fetchAnalytics = async () => {
    if (!analyticsEnabled.value) return
    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      overview.value = await analyticsApi.overview(requestFilters.value, { signal: nextController.signal })
      lastUpdated.value = new Date()
    } catch (error) {
      if (!canceled(error)) errorMessage.value = normalizeApiError(error).message
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const resetFilters = () => {
    filters.startDate = ''
    filters.endDate = ''
    filters.technicianId = ''
    filters.workshopId = scopedWorkshopId.value === null ? '' : String(scopedWorkshopId.value)
    filters.horizonDays = 14
    void fetchAnalytics()
  }

  watch(scopedWorkshopId, (value) => {
    if (value !== null) filters.workshopId = String(value)
  }, { immediate: true })

  onBeforeUnmount(() => controller?.abort())

  return {
    alerts, analyticsEnabled, canEditWorkshopFilter, errorMessage, fetchAnalytics, filters,
    forecasts, lastUpdated, loading, observedSample, overview, recommendations, resetFilters,
    technicianMetrics, workshopMetrics,
  }
}

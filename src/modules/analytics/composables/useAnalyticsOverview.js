import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { canViewAnalytics } from '@/auth/permissions.js'
import { isAnalyticsEnabled } from '@/config/integrations.js'
import { normalizeApiError } from '@/api/errors.js'
import analyticsApi from '@/modules/analytics/services/analyticsService.js'
import { useAuthStore } from '@/stores/auth.js'

const numericFilter = (value) => {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function useAnalyticsOverview() {
  const authStore = useAuthStore()
  const { t } = useI18n()

  const loading = ref(false)
  const errorMessage = ref('')
  const overview = ref(null)
  const filters = reactive({
    startDate: '',
    endDate: '',
    technicianId: '',
    workshopId: '',
    horizonDays: 14,
  })

  const scopedWorkshopId = computed(() =>
    authStore.user?.workshop_id ?? authStore.user?.workshop?.id ?? null,
  )
  const canUseAnalytics = computed(() => canViewAnalytics(authStore.roles))
  const canEditWorkshopFilter = computed(() => scopedWorkshopId.value === null)
  const analyticsEnabled = isAnalyticsEnabled
  const technicianMetrics = computed(() => overview.value?.technicianEfficiency?.technicians ?? [])
  const workshopMetrics = computed(() => overview.value?.workshopBottlenecks?.workshops ?? [])
  const forecasts = computed(() => overview.value?.workloadForecast?.forecasts ?? [])
  const alerts = computed(() => overview.value?.riskAlerts?.alerts ?? [])
  const recommendations = computed(() => overview.value?.recommendations?.recommendations ?? [])
  const observedSample = computed(() => overview.value?.technicianEfficiency?.sample ?? null)

  const requestFilters = () => ({
    ...(filters.startDate ? { start_date: filters.startDate } : {}),
    ...(filters.endDate ? { end_date: filters.endDate } : {}),
    ...(numericFilter(filters.technicianId) ? { technician_id: numericFilter(filters.technicianId) } : {}),
    ...(numericFilter(filters.workshopId) ? { workshop_id: numericFilter(filters.workshopId) } : {}),
    ...(numericFilter(filters.horizonDays) ? { horizon_days: numericFilter(filters.horizonDays) } : {}),
  })

  const setFilter = (key, value) => {
    filters[key] = value
  }

  const resetFilters = () => {
    filters.startDate = ''
    filters.endDate = ''
    filters.technicianId = ''
    filters.workshopId = scopedWorkshopId.value === null ? '' : String(scopedWorkshopId.value)
    filters.horizonDays = 14
    void fetchAnalytics()
  }

  async function fetchAnalytics() {
    if (!analyticsEnabled || !canUseAnalytics.value) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      overview.value = await analyticsApi.overview(requestFilters())
    } catch (error) {
      const apiError = normalizeApiError(error)

      errorMessage.value = apiError.message || t('analytics.errors.load')
    } finally {
      loading.value = false
    }
  }

  watch(
    scopedWorkshopId,
    (workshopId) => {
      if (workshopId !== null) {
        filters.workshopId = String(workshopId)
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    if (analyticsEnabled && canUseAnalytics.value) {
      void fetchAnalytics()
    }
  })

  return {
    alerts,
    analyticsEnabled,
    canEditWorkshopFilter,
    canUseAnalytics,
    errorMessage,
    fetchAnalytics,
    filters,
    forecasts,
    loading,
    observedSample,
    overview,
    recommendations,
    resetFilters,
    setFilter,
    technicianMetrics,
    workshopMetrics,
  }
}

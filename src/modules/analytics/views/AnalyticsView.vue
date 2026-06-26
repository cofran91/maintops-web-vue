<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { mdiChartLine, mdiRefresh } from '@mdi/js'
import { canViewAnalytics } from '@/auth/permissions.js'
import { isAnalyticsEnabled } from '@/config/integrations.js'
import { normalizeApiError } from '@/api/errors.js'
import analyticsApi from '@/modules/analytics/services/analyticsService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

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

const scopedWorkshopId = computed(() => authStore.user?.workshop_id ?? authStore.user?.workshop?.id ?? null)
const canUseAnalytics = computed(() => canViewAnalytics(authStore.roles))
const canEditWorkshopFilter = computed(() => scopedWorkshopId.value === null)
const analyticsEnabled = isAnalyticsEnabled
const technicianMetrics = computed(() => overview.value?.technicianEfficiency?.technicians ?? [])
const workshopMetrics = computed(() => overview.value?.workshopBottlenecks?.workshops ?? [])
const forecasts = computed(() => overview.value?.workloadForecast?.forecasts ?? [])
const alerts = computed(() => overview.value?.riskAlerts?.alerts ?? [])
const recommendations = computed(() => overview.value?.recommendations?.recommendations ?? [])
const observedSample = computed(() => overview.value?.technicianEfficiency?.sample ?? null)

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

const requestFilters = () => ({
  ...(filters.startDate ? { start_date: filters.startDate } : {}),
  ...(filters.endDate ? { end_date: filters.endDate } : {}),
  ...(numericFilter(filters.technicianId) ? { technician_id: numericFilter(filters.technicianId) } : {}),
  ...(numericFilter(filters.workshopId) ? { workshop_id: numericFilter(filters.workshopId) } : {}),
  ...(numericFilter(filters.horizonDays) ? { horizon_days: numericFilter(filters.horizonDays) } : {}),
})

const numericFilter = (value) => {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
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
    errorMessage.value = apiError.message || 'Analytics could not be loaded.'
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void fetchAnalytics()
}

const minutes = (value) => `${number(value)} min`
const ratio = (value) => (value === null || value === undefined ? '-' : number(value, 3))
const number = (value, fractionDigits = 0) => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return '-'
  }

  return new Intl.NumberFormat('en', {
    maximumFractionDigits: fractionDigits,
  }).format(parsed)
}

const scopeLabel = (scope) => {
  if (!scope) {
    return 'Scope unavailable'
  }

  const type = scope.scope ?? scope.type ?? 'global'

  return type === 'workshop' && scope.workshop_id
    ? `Workshop ${scope.workshop_id}`
    : 'Global'
}

const dateRangeLabel = (period) => {
  if (!period) {
    return 'Selected period'
  }

  return `${period.start_date} to ${period.end_date}`
}

const horizonLabel = (horizon) => {
  if (!horizon) {
    return 'Selected horizon'
  }

  return `${horizon.start_date} to ${horizon.end_date}`
}

const confidenceColor = (level) => {
  const colors = {
    high: 'success',
    medium: 'warning',
    low: 'danger',
  }

  return colors[level] ?? 'neutral'
}

const severityColor = (severity) => {
  const colors = {
    high: 'danger',
    medium: 'warning',
    info: 'info',
  }

  return colors[severity] ?? 'neutral'
}

const priorityColor = (priority) => {
  const colors = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }

  return colors[priority] ?? 'neutral'
}

const humanize = (value) =>
  String(value ?? '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      title="Analytics"
      subtitle="Review observed efficiency, workload forecasts, risks, and recommendations."
      eyebrow="Administrative analytics"
      :icon="mdiChartLine"
    >
      <template #actions>
        <BaseButton
          color="info"
          :icon="mdiRefresh"
          label="Refresh"
          :disabled="loading || !analyticsEnabled || !canUseAnalytics"
          @click="fetchAnalytics"
        />
      </template>

      <AppEmptyState
        v-if="!canUseAnalytics"
        title="Analytics is restricted"
        description="Analytics is available only to administrative users."
      />

      <AppEmptyState
        v-else-if="!analyticsEnabled"
        title="Analytics is not configured"
        description="Set VITE_ANALYTICS_BASE_URL to enable administrative analytics."
      />

      <template v-else>
        <CardBox class="mb-6">
          <form class="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:items-end" @submit.prevent="applyFilters">
            <FormField label="Start date">
              <FormControl v-model="filters.startDate" name="start_date" type="date" />
            </FormField>
            <FormField label="End date">
              <FormControl v-model="filters.endDate" name="end_date" type="date" />
            </FormField>
            <FormField label="Technician ID">
              <FormControl
                v-model="filters.technicianId"
                name="technician_id"
                inputmode="numeric"
                placeholder="Any"
              />
            </FormField>
            <FormField label="Workshop ID">
              <FormControl
                v-if="canEditWorkshopFilter"
                v-model="filters.workshopId"
                name="workshop_id"
                inputmode="numeric"
                placeholder="Any"
              />
              <input
                v-else
                :value="filters.workshopId"
                class="h-12 w-full rounded-sm border border-gray-700 bg-gray-100 px-3 py-2
                  text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                disabled
              />
            </FormField>
            <FormField label="Forecast days">
              <FormControl v-model="filters.horizonDays" name="horizon_days" type="number" />
            </FormField>
            <div class="flex flex-wrap gap-2 lg:col-span-5 lg:justify-end">
              <BaseButton color="whiteDark" label="Reset" :disabled="loading" @click="resetFilters" />
              <BaseButton color="info" label="Apply" type="submit" :disabled="loading" />
            </div>
          </form>
        </CardBox>

        <NotificationBar v-if="errorMessage" color="danger">
          {{ errorMessage }}
        </NotificationBar>

        <NotificationBar v-if="loading" color="info">
          Loading Analytics data...
        </NotificationBar>

        <div v-if="overview" class="space-y-6">
          <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CardBox>
              <p class="text-sm font-semibold text-gray-500 dark:text-slate-400">
                Observed sample
              </p>
              <p class="mt-3 text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {{ number(observedSample?.activities) }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {{ number(observedSample?.comparable_completed_activities) }} comparable activities
              </p>
            </CardBox>
            <CardBox>
              <p class="text-sm font-semibold text-gray-500 dark:text-slate-400">
                Scope
              </p>
              <p class="mt-3 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                {{ scopeLabel(overview.technicianEfficiency.scope) }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {{ dateRangeLabel(overview.technicianEfficiency.period) }}
              </p>
            </CardBox>
            <CardBox>
              <p class="text-sm font-semibold text-gray-500 dark:text-slate-400">
                Forecast horizon
              </p>
              <p class="mt-3 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                {{ number(overview.workloadForecast.horizon_days) }} days
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {{ horizonLabel(forecasts[0]?.horizon) }}
              </p>
            </CardBox>
          </section>

          <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CardBox>
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Technician efficiency
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    Actual duration compared with planned duration.
                  </p>
                </div>
                <AppBadge :label="scopeLabel(overview.technicianEfficiency.scope)" color="info" />
              </div>
              <div v-if="technicianMetrics.length > 0" class="space-y-3">
                <article
                  v-for="metric in technicianMetrics"
                  :key="metric.technician_id"
                  class="rounded-lg border border-gray-100 p-4 dark:border-slate-800"
                >
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="font-semibold text-gray-900 dark:text-slate-100">
                      Technician {{ metric.technician_id }}
                    </h3>
                    <AppBadge
                      :label="metric.actual_vs_planned.sufficient_data ? 'Sufficient' : 'Limited'"
                      :color="metric.actual_vs_planned.sufficient_data ? 'success' : 'warning'"
                    />
                  </div>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Actual</dt>
                      <dd class="font-semibold">{{ minutes(metric.actual_vs_planned.actual_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Planned</dt>
                      <dd class="font-semibold">{{ minutes(metric.actual_vs_planned.planned_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Variance</dt>
                      <dd class="font-semibold">{{ minutes(metric.actual_vs_planned.variance_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Ratio</dt>
                      <dd class="font-semibold">{{ ratio(metric.actual_vs_planned.actual_to_planned_ratio) }}</dd>
                    </div>
                  </dl>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                No technician efficiency data for the selected filters.
              </p>
            </CardBox>

            <CardBox>
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Workshop bottlenecks
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    Scheduled queues, active work, cancellations, and duration variance.
                  </p>
                </div>
                <AppBadge :label="scopeLabel(overview.workshopBottlenecks.scope)" color="info" />
              </div>
              <div v-if="workshopMetrics.length > 0" class="space-y-3">
                <article
                  v-for="metric in workshopMetrics"
                  :key="metric.workshop_id"
                  class="rounded-lg border border-gray-100 p-4 dark:border-slate-800"
                >
                  <h3 class="font-semibold text-gray-900 dark:text-slate-100">
                    Workshop {{ metric.workshop_id }}
                  </h3>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Active</dt>
                      <dd class="font-semibold">{{ number(metric.active_activities.count) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Scheduled</dt>
                      <dd class="font-semibold">{{ number(metric.scheduled_queue.count) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Cancelled</dt>
                      <dd class="font-semibold">{{ number(metric.cancellations.count) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Ratio</dt>
                      <dd class="font-semibold">{{ ratio(metric.actual_vs_planned.actual_to_planned_ratio) }}</dd>
                    </div>
                  </dl>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                No workshop bottleneck data for the selected filters.
              </p>
            </CardBox>
          </section>

          <section>
            <CardBox>
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Workload forecast
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    Read-only workload projection against available technician capacity.
                  </p>
                </div>
                <AppBadge :label="overview.workloadForecast.algorithm_version" color="neutral" />
              </div>
              <div v-if="forecasts.length > 0" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <article
                  v-for="forecast in forecasts"
                  :key="forecast.workshop_id"
                  class="rounded-lg border border-gray-100 p-4 dark:border-slate-800"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-slate-100">
                        Workshop {{ forecast.workshop_id }}
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-slate-400">
                        {{ horizonLabel(forecast.horizon) }}
                      </p>
                    </div>
                    <AppBadge
                      :label="humanize(forecast.confidence.level)"
                      :color="confidenceColor(forecast.confidence.level)"
                    />
                  </div>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Capacity</dt>
                      <dd class="font-semibold">{{ minutes(forecast.capacity.minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Projected</dt>
                      <dd class="font-semibold">{{ minutes(forecast.forecast.projected_workload_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Unallocated</dt>
                      <dd class="font-semibold">{{ minutes(forecast.forecast.projected_unallocated_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">Utilization</dt>
                      <dd class="font-semibold">{{ ratio(forecast.forecast.utilization_ratio) }}</dd>
                    </div>
                  </dl>
                  <p
                    v-if="!forecast.confidence.data_sufficient"
                    class="mt-4 text-sm text-yellow-700 dark:text-yellow-300"
                  >
                    {{ forecast.confidence.reasons.join(' ') || 'Forecast confidence is limited.' }}
                  </p>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                No workload forecast data for the selected filters.
              </p>
            </CardBox>
          </section>

          <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CardBox>
              <div class="mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Risk alerts
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  Capacity, utilization, overdue work, and input-quality risks.
                </p>
              </div>
              <div v-if="alerts.length > 0" class="space-y-3">
                <article
                  v-for="alert in alerts"
                  :key="`${alert.workshop_id}-${alert.id}`"
                  class="rounded-lg border border-gray-100 p-4 dark:border-slate-800"
                >
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="font-semibold text-gray-900 dark:text-slate-100">
                      {{ humanize(alert.id) }}
                    </h3>
                    <AppBadge :label="humanize(alert.severity)" :color="severityColor(alert.severity)" />
                  </div>
                  <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
                    {{ alert.explanation }}
                  </p>
                  <p class="mt-3 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                    Workshop {{ alert.workshop_id }} · {{ horizonLabel(alert.horizon) }}
                  </p>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                No workload risks for the selected filters.
              </p>
            </CardBox>

            <CardBox>
              <div class="mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Recommendations
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  Review-only guidance; no orders, assignments, or statuses are changed.
                </p>
              </div>
              <div v-if="recommendations.length > 0" class="space-y-3">
                <article
                  v-for="item in recommendations"
                  :key="`${item.workshop_id}-${item.id}`"
                  class="rounded-lg border border-gray-100 p-4 dark:border-slate-800"
                >
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="font-semibold text-gray-900 dark:text-slate-100">
                      {{ humanize(item.id) }}
                    </h3>
                    <AppBadge :label="humanize(item.priority)" :color="priorityColor(item.priority)" />
                  </div>
                  <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
                    {{ item.suggested_review }}
                  </p>
                  <p class="mt-3 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                    Workshop {{ item.workshop_id }} · Automatic action: {{ item.automatic_action ? 'yes' : 'no' }}
                  </p>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                No recommendations for the selected filters.
              </p>
            </CardBox>
          </section>
        </div>
      </template>
    </AppPage>
  </LayoutAuthenticated>
</template>

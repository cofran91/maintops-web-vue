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
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { locale, t, te } = useI18n()

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
    errorMessage.value = apiError.message || t('analytics.errors.load')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void fetchAnalytics()
}

const minutes = (value) => t('analytics.units.minutes', { value: number(value) })
const ratio = (value) => (value === null || value === undefined ? '-' : number(value, 3))
const number = (value, fractionDigits = 0) => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return '-'
  }

  return new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: fractionDigits,
  }).format(parsed)
}

const scopeLabel = (scope) => {
  if (!scope) {
    return t('analytics.scope.unavailable')
  }

  const type = scope.scope ?? scope.type ?? 'global'

  return type === 'workshop' && scope.workshop_id
    ? t('analytics.scope.workshop', { id: scope.workshop_id })
    : t('analytics.scope.global')
}

const dateRangeLabel = (period) => {
  if (!period) {
    return t('common.selectedPeriod')
  }

  return t('analytics.labels.dateRange', {
    end: period.end_date,
    start: period.start_date,
  })
}

const horizonLabel = (horizon) => {
  if (!horizon) {
    return t('common.selectedHorizon')
  }

  return t('analytics.labels.dateRange', {
    end: horizon.end_date,
    start: horizon.start_date,
  })
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

const normalizeAnalyticsCode = (code, prefix = '') => {
  const value = String(code ?? '')

  return prefix && value.startsWith(prefix) ? value.slice(prefix.length) : value
}

const analyticsTranslationKey = (value) => String(value ?? '').replaceAll('-', '_')

const translateAnalyticsCode = (namespace, code, params = {}) => {
  const key = `analytics.${namespace}.${code}`

  return code && te(key) ? t(key, params) : humanize(code)
}

const translateAnalyticsTitle = (namespace, code, prefix = '') => {
  const normalized = normalizeAnalyticsCode(code, prefix)
  const key = `analytics.${namespace}.${analyticsTranslationKey(normalized)}`

  return normalized && te(key) ? t(key) : humanize(normalized)
}

const confidenceLabel = (level) => translateAnalyticsCode('confidence', level)
const statusLabel = (value) => translateAnalyticsCode('status', value)
const algorithmLabel = (algorithm) => translateAnalyticsTitle('algorithms', algorithm)
const alertTitle = (alert) =>
  translateAnalyticsTitle('alertTitles', alert.id, 'analytics_alert_')
const recommendationTitle = (item) =>
  translateAnalyticsTitle(
    'recommendationTitles',
    item.id,
    'analytics_recommendation_',
  )
const alertExplanation = (alert) =>
  translateAnalyticsCode('alerts', alert.explanation_code ?? alert.explanation, alert.facts)
const recommendationText = (item) =>
  translateAnalyticsCode(
    'recommendations',
    item.suggested_review_code ?? item.suggested_review,
    item.facts,
  )
const confidenceText = (forecast) => {
  const reasonCodes = forecast.confidence.reason_codes ?? forecast.confidence.reasons ?? []
  const translatedReasons = reasonCodes.map((reason) =>
    translateAnalyticsCode('confidenceReasons', reason, forecast),
  )

  return translatedReasons.join(' ') || t('analytics.confidence.limited')
}
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('analytics.page.title')"
      :subtitle="t('analytics.page.subtitle')"
      :eyebrow="t('analytics.page.eyebrow')"
      :icon="mdiChartLine"
    >
      <template #actions>
        <BaseButton
          color="info"
          :icon="mdiRefresh"
          :label="t('common.actions.refresh')"
          :disabled="loading || !analyticsEnabled || !canUseAnalytics"
          @click="fetchAnalytics"
        />
      </template>

      <AppEmptyState
        v-if="!canUseAnalytics"
        :title="t('analytics.page.restrictedTitle')"
        :description="t('analytics.page.restrictedDescription')"
      />

      <AppEmptyState
        v-else-if="!analyticsEnabled"
        :title="t('analytics.page.unavailableTitle')"
        :description="t('analytics.page.unavailableDescription')"
      />

      <template v-else>
        <CardBox class="mb-6">
          <form class="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:items-end" @submit.prevent="applyFilters">
            <FormField :label="t('analytics.filters.startDate')">
              <FormControl v-model="filters.startDate" name="start_date" type="date" />
            </FormField>
            <FormField :label="t('analytics.filters.endDate')">
              <FormControl v-model="filters.endDate" name="end_date" type="date" />
            </FormField>
            <FormField :label="t('analytics.filters.technicianId')">
              <FormControl
                v-model="filters.technicianId"
                name="technician_id"
                inputmode="numeric"
                :placeholder="t('analytics.filters.any')"
              />
            </FormField>
            <FormField :label="t('analytics.filters.workshopId')">
              <FormControl
                v-if="canEditWorkshopFilter"
                v-model="filters.workshopId"
                name="workshop_id"
                inputmode="numeric"
                :placeholder="t('analytics.filters.any')"
              />
              <input
                v-else
                :value="filters.workshopId"
                class="h-12 w-full rounded-sm border border-gray-700 bg-gray-100 px-3 py-2
                  text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                disabled
              />
            </FormField>
            <FormField :label="t('analytics.filters.forecastDays')">
              <FormControl v-model="filters.horizonDays" name="horizon_days" type="number" />
            </FormField>
            <div class="flex flex-wrap gap-2 lg:col-span-5 lg:justify-end">
              <BaseButton
                color="whiteDark"
                :label="t('common.actions.reset')"
                :disabled="loading"
                @click="resetFilters"
              />
              <BaseButton color="info" :label="t('common.actions.apply')" type="submit" :disabled="loading" />
            </div>
          </form>
        </CardBox>

        <NotificationBar v-if="errorMessage" color="danger">
          {{ errorMessage }}
        </NotificationBar>

        <NotificationBar v-if="loading" color="info">
          {{ t('analytics.states.loading') }}
        </NotificationBar>

        <div v-if="overview" class="space-y-6">
          <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CardBox>
              <p class="text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('analytics.labels.observedSample') }}
              </p>
              <p class="mt-3 text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {{ number(observedSample?.activities) }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {{
                  t('analytics.labels.comparableActivities', {
                    count: number(observedSample?.comparable_completed_activities),
                  })
                }}
              </p>
            </CardBox>
            <CardBox>
              <p class="text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('analytics.labels.scope') }}
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
                {{ t('analytics.labels.forecastHorizon') }}
              </p>
              <p class="mt-3 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                {{ t('analytics.units.days', { count: number(overview.workloadForecast.horizon_days) }) }}
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
                    {{ t('analytics.sections.technicianTitle') }}
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    {{ t('analytics.sections.technicianDescription') }}
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
                      {{ t('analytics.filters.technicianId') }} {{ metric.technician_id }}
                    </h3>
                    <AppBadge
                      :label="
                        metric.actual_vs_planned.sufficient_data
                          ? t('analytics.status.sufficient')
                          : t('analytics.status.limited')
                      "
                      :color="metric.actual_vs_planned.sufficient_data ? 'success' : 'warning'"
                    />
                  </div>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.active') }}</dt>
                      <dd class="font-semibold">{{ minutes(metric.actual_vs_planned.actual_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.planned') }}</dt>
                      <dd class="font-semibold">{{ minutes(metric.actual_vs_planned.planned_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.variance') }}</dt>
                      <dd class="font-semibold">{{ minutes(metric.actual_vs_planned.variance_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.ratio') }}</dt>
                      <dd class="font-semibold">{{ ratio(metric.actual_vs_planned.actual_to_planned_ratio) }}</dd>
                    </div>
                  </dl>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('analytics.states.noTechnicianData') }}
              </p>
            </CardBox>

            <CardBox>
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    {{ t('analytics.sections.workshopTitle') }}
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    {{ t('analytics.sections.workshopDescription') }}
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
                    {{ t('analytics.scope.workshop', { id: metric.workshop_id }) }}
                  </h3>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.actual') }}</dt>
                      <dd class="font-semibold">{{ number(metric.active_activities.count) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.scheduled') }}</dt>
                      <dd class="font-semibold">{{ number(metric.scheduled_queue.count) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.cancelled') }}</dt>
                      <dd class="font-semibold">{{ number(metric.cancellations.count) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.ratio') }}</dt>
                      <dd class="font-semibold">{{ ratio(metric.actual_vs_planned.actual_to_planned_ratio) }}</dd>
                    </div>
                  </dl>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('analytics.states.noWorkshopData') }}
              </p>
            </CardBox>
          </section>

          <section>
            <CardBox>
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    {{ t('analytics.sections.forecastTitle') }}
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-slate-400">
                    {{ t('analytics.sections.forecastDescription') }}
                  </p>
                </div>
                <AppBadge
                  :label="algorithmLabel(overview.workloadForecast.algorithm_version)"
                  color="neutral"
                />
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
                        {{ t('analytics.scope.workshop', { id: forecast.workshop_id }) }}
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-slate-400">
                        {{ horizonLabel(forecast.horizon) }}
                      </p>
                    </div>
                    <AppBadge
                      :label="confidenceLabel(forecast.confidence.level)"
                      :color="confidenceColor(forecast.confidence.level)"
                    />
                  </div>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.capacity') }}</dt>
                      <dd class="font-semibold">{{ minutes(forecast.capacity.minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.projected') }}</dt>
                      <dd class="font-semibold">{{ minutes(forecast.forecast.projected_workload_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.unallocated') }}</dt>
                      <dd class="font-semibold">{{ minutes(forecast.forecast.projected_unallocated_minutes) }}</dd>
                    </div>
                    <div>
                      <dt class="text-gray-500 dark:text-slate-400">{{ t('analytics.labels.utilization') }}</dt>
                      <dd class="font-semibold">{{ ratio(forecast.forecast.utilization_ratio) }}</dd>
                    </div>
                  </dl>
                  <p
                    v-if="!forecast.confidence.data_sufficient"
                    class="mt-4 text-sm text-yellow-700 dark:text-yellow-300"
                  >
                    {{ confidenceText(forecast) }}
                  </p>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('analytics.states.noWorkloadData') }}
              </p>
            </CardBox>
          </section>

          <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CardBox>
              <div class="mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {{ t('analytics.sections.risksTitle') }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {{ t('analytics.sections.risksDescription') }}
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
                      {{ alertTitle(alert) }}
                    </h3>
                    <AppBadge :label="statusLabel(alert.severity)" :color="severityColor(alert.severity)" />
                  </div>
                  <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
                    {{ alertExplanation(alert) }}
                  </p>
                  <p class="mt-3 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                    {{ t('analytics.scope.workshop', { id: alert.workshop_id }) }} ·
                    {{ horizonLabel(alert.horizon) }}
                  </p>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('analytics.states.noRisks') }}
              </p>
            </CardBox>

            <CardBox>
              <div class="mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {{ t('analytics.sections.recommendationsTitle') }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {{ t('analytics.sections.recommendationsDescription') }}
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
                      {{ recommendationTitle(item) }}
                    </h3>
                    <AppBadge :label="statusLabel(item.priority)" :color="priorityColor(item.priority)" />
                  </div>
                  <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
                    {{ recommendationText(item) }}
                  </p>
                  <p class="mt-3 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                    {{ t('analytics.scope.workshop', { id: item.workshop_id }) }} ·
                    {{ t('analytics.labels.automaticAction') }}:
                    {{ item.automatic_action ? t('common.yes') : t('common.no') }}
                  </p>
                </article>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('analytics.states.noRecommendations') }}
              </p>
            </CardBox>
          </section>
        </div>
      </template>
    </AppPage>
  </LayoutAuthenticated>
</template>

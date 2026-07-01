<script setup>
import { useI18n } from 'vue-i18n'
import CardBox from '@/components/CardBox.vue'
import { formatAnalyticsNumber } from '@/modules/analytics/utils/analyticsFormatters.js'
import {
  dateRangeLabel,
  horizonLabel,
  scopeLabel,
} from '@/modules/analytics/utils/analyticsLabels.js'

defineProps({
  overview: {
    type: Object,
    required: true,
  },
  observedSample: {
    type: Object,
    default: null,
  },
  forecasts: {
    type: Array,
    required: true,
  },
})

const { locale, t } = useI18n()
const number = (value) => formatAnalyticsNumber(value, locale.value)
</script>

<template>
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
        {{ scopeLabel(overview.technicianEfficiency.scope, t) }}
      </p>
      <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
        {{ dateRangeLabel(overview.technicianEfficiency.period, t) }}
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
        {{ horizonLabel(forecasts[0]?.horizon, t) }}
      </p>
    </CardBox>
  </section>
</template>

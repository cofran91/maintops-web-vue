<script setup>
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/ui/AppBadge.vue'
import CardBox from '@/components/CardBox.vue'
import {
  confidenceColor,
  formatAnalyticsMinutes,
  formatAnalyticsRatio,
} from '@/modules/analytics/utils/analyticsFormatters.js'
import {
  algorithmLabel,
  confidenceLabel,
  confidenceText,
  horizonLabel,
} from '@/modules/analytics/utils/analyticsLabels.js'

defineProps({
  forecasts: {
    type: Array,
    required: true,
  },
  algorithmVersion: {
    type: String,
    default: '',
  },
})

const { locale, t, te } = useI18n()
const minutes = (value) => formatAnalyticsMinutes(value, locale.value, t)
const ratio = (value) => formatAnalyticsRatio(value, locale.value)
</script>

<template>
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
        <AppBadge :label="algorithmLabel(algorithmVersion, t, te)" color="neutral" />
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
                {{ horizonLabel(forecast.horizon, t) }}
              </p>
            </div>
            <AppBadge
              :label="confidenceLabel(forecast.confidence.level, t, te)"
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
            {{ confidenceText(forecast, t, te) }}
          </p>
        </article>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-slate-400">
        {{ t('analytics.states.noWorkloadData') }}
      </p>
    </CardBox>
  </section>
</template>

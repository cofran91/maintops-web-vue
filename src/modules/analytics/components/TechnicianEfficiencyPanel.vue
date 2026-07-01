<script setup>
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/ui/AppBadge.vue'
import CardBox from '@/components/CardBox.vue'
import {
  formatAnalyticsMinutes,
  formatAnalyticsRatio,
} from '@/modules/analytics/utils/analyticsFormatters.js'
import { scopeLabel } from '@/modules/analytics/utils/analyticsLabels.js'

defineProps({
  metrics: {
    type: Array,
    required: true,
  },
  scope: {
    type: Object,
    default: null,
  },
})

const { locale, t } = useI18n()
const minutes = (value) => formatAnalyticsMinutes(value, locale.value, t)
const ratio = (value) => formatAnalyticsRatio(value, locale.value)
</script>

<template>
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
      <AppBadge :label="scopeLabel(scope, t)" color="info" />
    </div>
    <div v-if="metrics.length > 0" class="space-y-3">
      <article
        v-for="metric in metrics"
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
</template>

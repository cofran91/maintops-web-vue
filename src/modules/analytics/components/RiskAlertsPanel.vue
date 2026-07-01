<script setup>
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/ui/AppBadge.vue'
import CardBox from '@/components/CardBox.vue'
import { severityColor } from '@/modules/analytics/utils/analyticsFormatters.js'
import {
  alertExplanation,
  alertTitle,
  horizonLabel,
  statusLabel,
} from '@/modules/analytics/utils/analyticsLabels.js'

defineProps({
  alerts: {
    type: Array,
    required: true,
  },
})

const { t, te } = useI18n()
</script>

<template>
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
            {{ alertTitle(alert, t, te) }}
          </h3>
          <AppBadge
            :label="statusLabel(alert.severity, t, te)"
            :color="severityColor(alert.severity)"
          />
        </div>
        <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
          {{ alertExplanation(alert, t, te) }}
        </p>
        <p class="mt-3 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
          {{ t('analytics.scope.workshop', { id: alert.workshop_id }) }} ·
          {{ horizonLabel(alert.horizon, t) }}
        </p>
      </article>
    </div>
    <p v-else class="text-sm text-gray-500 dark:text-slate-400">
      {{ t('analytics.states.noRisks') }}
    </p>
  </CardBox>
</template>

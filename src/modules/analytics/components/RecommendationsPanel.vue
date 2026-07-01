<script setup>
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/ui/AppBadge.vue'
import CardBox from '@/components/CardBox.vue'
import { priorityColor } from '@/modules/analytics/utils/analyticsFormatters.js'
import {
  recommendationText,
  recommendationTitle,
  statusLabel,
} from '@/modules/analytics/utils/analyticsLabels.js'

defineProps({
  recommendations: {
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
            {{ recommendationTitle(item, t, te) }}
          </h3>
          <AppBadge
            :label="statusLabel(item.priority, t, te)"
            :color="priorityColor(item.priority)"
          />
        </div>
        <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
          {{ recommendationText(item, t, te) }}
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
</template>

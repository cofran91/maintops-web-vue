<script setup lang="ts">
import { mdiDotsHorizontal } from '@mdi/js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StatusBreakdown } from '@/types/dashboard'

const props = defineProps<{
  statuses: StatusBreakdown[]
  total: number
}>()

const { t } = useI18n()

const donutGradient = computed(() => {
  if (props.total === 0 || props.statuses.length === 0) {
    return '#e9edf4'
  }

  let start = 0
  const segments = props.statuses.map((status) => {
    const end = start + status.value
    const segment = `${status.color} ${start}% ${end}%`
    start = end
    return segment
  })

  return `conic-gradient(${segments.join(', ')})`
})
</script>

<template>
  <article class="dashboard-card status-card">
    <div class="card-heading">
      <div>
        <h2>{{ t('dashboard.orderStatus') }}</h2>
        <p>{{ t('dashboard.currentDistribution') }}</p>
      </div>
      <button :aria-label="t('common.moreOptions')" class="icon-action" type="button">
        <v-icon :icon="mdiDotsHorizontal" size="20" />
      </button>
    </div>

    <div class="donut-wrap">
      <div :style="{ background: donutGradient }" class="donut-chart">
        <div><strong>{{ total }}</strong><span>{{ t('common.total') }}</span></div>
      </div>
    </div>

    <div class="status-list">
      <div v-for="status in statuses" :key="status.label" class="status-item">
        <span class="status-name"><i :style="{ background: status.color }" />{{ status.label }}</span>
        <span><strong>{{ status.count }}</strong><small>{{ status.value }}%</small></span>
      </div>
    </div>
  </article>
</template>

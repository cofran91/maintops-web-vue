<script setup lang="ts">
import { mdiDotsHorizontal } from '@mdi/js'
import { computed } from 'vue'
import type { StatusBreakdown } from '@/types/dashboard'

const props = defineProps<{
  statuses: StatusBreakdown[]
  total: number
}>()

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
        <h2>Estado de órdenes</h2>
        <p>Distribución actual</p>
      </div>
      <button aria-label="Más opciones" class="icon-action" type="button">
        <v-icon :icon="mdiDotsHorizontal" size="20" />
      </button>
    </div>

    <div class="donut-wrap">
      <div :style="{ background: donutGradient }" class="donut-chart">
        <div><strong>{{ total }}</strong><span>Total</span></div>
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

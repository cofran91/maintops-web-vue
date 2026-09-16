<script setup lang="ts">
import { mdiDotsHorizontal } from '@mdi/js'
import type { StatusBreakdown } from '@/types/dashboard'

defineProps<{
  statuses: StatusBreakdown[]
}>()
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
      <div class="donut-chart">
        <div><strong>57</strong><span>Total</span></div>
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

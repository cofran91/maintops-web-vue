<script setup lang="ts">
import { mdiGarageVariant, mdiWrenchClockOutline } from '@mdi/js'
import type { WorkshopBottleneckMetric } from '@/types/analytics'

defineProps<{ metrics: WorkshopBottleneckMetric[] }>()
const number = (value: unknown) => Number.isFinite(Number(value)) ? new Intl.NumberFormat('es-CO').format(Number(value)) : '—'
const ratio = (value: unknown) => value === null || value === undefined ? '—' : (Number(value) * 100).toFixed(1) + '%'
</script>

<template>
  <v-card class="analytics-panel" elevation="0">
    <v-card-item>
      <template #prepend><v-avatar color="teal" variant="tonal"><v-icon :icon="mdiGarageVariant" /></v-avatar></template>
      <v-card-title>Cuellos de botella por taller</v-card-title>
      <v-card-subtitle>Señales observadas de carga, cola y cancelaciones.</v-card-subtitle>
    </v-card-item>
    <v-divider />
    <v-card-text v-if="metrics.length" class="analytics-metric-list">
      <article v-for="metric in metrics" :key="metric.workshop_id" class="analytics-workshop-row">
        <div class="analytics-workshop-row__identity"><span class="analytics-entity-icon analytics-entity-icon--teal"><v-icon :icon="mdiWrenchClockOutline" size="17" /></span><strong>Taller #{{ metric.workshop_id }}</strong></div>
        <div class="analytics-workshop-row__stats"><span><small>En proceso</small><strong>{{ number(metric.active_activities?.count) }}</strong></span><span><small>En cola</small><strong>{{ number(metric.scheduled_queue?.count) }}</strong></span><span><small>Canceladas</small><strong>{{ number(metric.cancellations?.count) }}</strong></span><span><small>Ratio real/plan</small><strong>{{ ratio(metric.actual_vs_planned?.actual_to_planned_ratio) }}</strong></span></div>
      </article>
    </v-card-text>
    <v-card-text v-else class="analytics-empty-panel">No hay datos de talleres para el periodo seleccionado.</v-card-text>
  </v-card>
</template>

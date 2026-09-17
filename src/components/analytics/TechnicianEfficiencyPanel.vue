<script setup lang="ts">
import { mdiAccountHardHatOutline, mdiSpeedometer } from '@mdi/js'
import type { TechnicianEfficiencyMetric } from '@/types/analytics'

defineProps<{ metrics: TechnicianEfficiencyMetric[] }>()

const number = (value: unknown) => Number.isFinite(Number(value)) ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(Number(value)) : '—'
const ratio = (value: unknown) => value === null || value === undefined ? '—' : number(Number(value) * 100) + '%'
</script>

<template>
  <v-card class="analytics-panel" elevation="0">
    <v-card-item>
      <template #prepend><v-avatar color="indigo" variant="tonal"><v-icon :icon="mdiAccountHardHatOutline" /></v-avatar></template>
      <v-card-title>Eficiencia por técnico</v-card-title>
      <v-card-subtitle>Comparación entre duración real y tiempo planificado.</v-card-subtitle>
    </v-card-item>
    <v-divider />
    <v-card-text v-if="metrics.length" class="analytics-metric-list">
      <article v-for="metric in metrics" :key="metric.technician_id" class="analytics-metric-row">
        <div class="analytics-metric-row__title"><span class="analytics-entity-icon"><v-icon :icon="mdiSpeedometer" size="17" /></span><strong>Técnico #{{ metric.technician_id }}</strong><v-chip :color="metric.actual_vs_planned?.sufficient_data ? 'success' : 'warning'" label size="x-small" variant="tonal">{{ metric.actual_vs_planned?.sufficient_data ? 'Muestra suficiente' : 'Muestra limitada' }}</v-chip></div>
        <div class="analytics-metric-row__values"><span><small>Real</small><strong>{{ number(metric.actual_vs_planned?.actual_minutes) }} min</strong></span><span><small>Planificado</small><strong>{{ number(metric.actual_vs_planned?.planned_minutes) }} min</strong></span><span><small>Variación</small><strong>{{ number(metric.actual_vs_planned?.variance_minutes) }} min</strong></span><span><small>Ratio</small><strong>{{ ratio(metric.actual_vs_planned?.actual_to_planned_ratio) }}</strong></span></div>
      </article>
    </v-card-text>
    <v-card-text v-else class="analytics-empty-panel">No hay datos de técnicos para el periodo seleccionado.</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { mdiChartTimelineVariant, mdiTrendingUp } from '@mdi/js'
import type { AnalyticsForecast } from '@/types/analytics'

defineProps<{ forecasts: AnalyticsForecast[]; algorithmVersion?: string }>()
const number = (value: unknown) => Number.isFinite(Number(value)) ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(Number(value)) : '—'
const percentage = (value: unknown) => value === null || value === undefined ? '—' : (Number(value) * 100).toFixed(1) + '%'
</script>

<template>
  <v-card class="analytics-panel" elevation="0">
    <v-card-item>
      <template #prepend><v-avatar color="purple" variant="tonal"><v-icon :icon="mdiChartTimelineVariant" /></v-avatar></template>
      <v-card-title>Pronóstico de carga</v-card-title>
      <v-card-subtitle>Proyección transparente para apoyar la revisión operativa.</v-card-subtitle>
      <template #append><v-chip v-if="algorithmVersion" label size="small" variant="tonal">{{ algorithmVersion }}</v-chip></template>
    </v-card-item>
    <v-divider />
    <v-card-text v-if="forecasts.length" class="analytics-forecast-grid">
      <article v-for="forecast in forecasts" :key="forecast.workshop_id" class="analytics-forecast-card">
        <div class="analytics-forecast-card__heading"><span><strong>Taller #{{ forecast.workshop_id }}</strong><small>{{ forecast.horizon?.start_date }} — {{ forecast.horizon?.end_date }}</small></span><v-chip :color="forecast.confidence?.level === 'high' ? 'success' : forecast.confidence?.level === 'medium' ? 'warning' : 'info'" label size="x-small" variant="tonal">Confianza {{ forecast.confidence?.level || 'n/d' }}</v-chip></div>
        <div class="analytics-forecast-card__bar"><span :style="{ width: String(Math.min(Number(forecast.forecast?.utilization_ratio ?? 0) * 100, 100)) + '%' }" /></div>
        <div class="analytics-forecast-card__metrics"><span><small>Capacidad</small><strong>{{ number(forecast.capacity?.minutes) }} min</strong></span><span><small>Carga proyectada</small><strong>{{ number(forecast.forecast?.projected_workload_minutes) }} min</strong></span><span><small>Utilización</small><strong><v-icon :icon="mdiTrendingUp" size="14" />{{ percentage(forecast.forecast?.utilization_ratio) }}</strong></span></div>
        <v-alert v-if="Number(forecast.forecast?.projected_unallocated_minutes ?? 0) > 0" class="mt-4" density="compact" type="warning" variant="tonal">{{ number(forecast.forecast?.projected_unallocated_minutes) }} minutos proyectados sin capacidad.</v-alert>
      </article>
    </v-card-text>
    <v-card-text v-else class="analytics-empty-panel">No hay pronósticos disponibles para el alcance seleccionado.</v-card-text>
  </v-card>
</template>

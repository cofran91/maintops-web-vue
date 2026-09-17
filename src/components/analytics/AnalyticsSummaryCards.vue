<script setup lang="ts">
import { mdiAccountGroupOutline, mdiAlertCircleOutline, mdiCalendarClockOutline, mdiChartTimelineVariant } from '@mdi/js'
import type { AnalyticsEndpointResponse, AnalyticsSample } from '@/types/analytics'

const props = defineProps<{
  sample: AnalyticsSample | null
  forecast: AnalyticsEndpointResponse
  alerts: number
  recommendations: number
}>()

const cards = () => [
  { label: 'Actividades observadas', value: props.sample?.activities ?? 0, detail: String(props.sample?.comparable_completed_activities ?? 0) + ' comparables', icon: mdiAccountGroupOutline, tone: 'blue' },
  { label: 'Horizonte de pronóstico', value: String(props.forecast.horizon_days ?? 0) + ' días', detail: 'Carga proyectada', icon: mdiCalendarClockOutline, tone: 'teal' },
  { label: 'Alertas de capacidad', value: props.alerts, detail: 'Requieren revisión', icon: mdiAlertCircleOutline, tone: props.alerts ? 'amber' : 'green' },
  { label: 'Recomendaciones', value: props.recommendations, detail: 'Acciones sugeridas', icon: mdiChartTimelineVariant, tone: 'purple' },
]
</script>

<template>
  <section class="analytics-advanced-kpis" aria-label="Resumen avanzado de analítica">
    <article v-for="card in cards()" :key="card.label" class="analytics-advanced-kpi">
      <span :class="['analytics-advanced-kpi__icon', 'analytics-advanced-kpi__icon--' + card.tone]"><v-icon :icon="card.icon" size="21" /></span>
      <span><strong>{{ card.value }}</strong><small>{{ card.label }}</small><em>{{ card.detail }}</em></span>
    </article>
  </section>
</template>

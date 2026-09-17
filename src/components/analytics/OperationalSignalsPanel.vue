<script setup lang="ts">
import { mdiAlertCircleOutline, mdiLightbulbOnOutline } from '@mdi/js'
import type { AnalyticsAlert, AnalyticsRecommendation } from '@/types/analytics'

defineProps<{ alerts: AnalyticsAlert[]; recommendations: AnalyticsRecommendation[] }>()

const humanize = (value: unknown) => String(value ?? 'Sin detalle').replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const priorityColor = (value: unknown) => ({ high: 'error', medium: 'warning', low: 'info' }[String(value)] ?? 'secondary')
</script>

<template>
  <div class="analytics-signals-grid">
    <v-card class="analytics-panel" elevation="0">
      <v-card-item><template #prepend><v-avatar color="error" variant="tonal"><v-icon :icon="mdiAlertCircleOutline" /></v-avatar></template><v-card-title>Alertas de riesgo</v-card-title><v-card-subtitle>Indicadores que requieren revisión del equipo.</v-card-subtitle></v-card-item>
      <v-divider />
      <v-list v-if="alerts.length" class="analytics-signal-list" lines="three">
        <v-list-item v-for="alert in alerts" :key="String(alert.workshop_id) + '-' + alert.id">
          <template #prepend><v-icon color="error" :icon="mdiAlertCircleOutline" /></template>
          <v-list-item-title>{{ humanize(alert.id) }}</v-list-item-title>
          <v-list-item-subtitle>Taller #{{ alert.workshop_id }} · {{ humanize(alert.explanation_code || alert.explanation) }}</v-list-item-subtitle>
          <template #append><v-chip :color="priorityColor(alert.severity)" label size="x-small" variant="tonal">{{ alert.severity || 'info' }}</v-chip></template>
        </v-list-item>
      </v-list>
      <v-card-text v-else class="analytics-empty-panel">No se detectaron alertas en este momento.</v-card-text>
    </v-card>

    <v-card class="analytics-panel" elevation="0">
      <v-card-item><template #prepend><v-avatar color="amber" variant="tonal"><v-icon :icon="mdiLightbulbOnOutline" /></v-avatar></template><v-card-title>Recomendaciones</v-card-title><v-card-subtitle>Sugerencias de revisión, sin acciones automáticas.</v-card-subtitle></v-card-item>
      <v-divider />
      <v-list v-if="recommendations.length" class="analytics-signal-list" lines="three">
        <v-list-item v-for="recommendation in recommendations" :key="String(recommendation.workshop_id) + '-' + recommendation.id">
          <template #prepend><v-icon color="amber-darken-2" :icon="mdiLightbulbOnOutline" /></template>
          <v-list-item-title>{{ humanize(recommendation.id) }}</v-list-item-title>
          <v-list-item-subtitle>Taller #{{ recommendation.workshop_id }} · {{ humanize(recommendation.suggested_review_code || recommendation.suggested_review) }}</v-list-item-subtitle>
          <template #append><v-chip :color="priorityColor(recommendation.priority)" label size="x-small" variant="tonal">{{ recommendation.priority || 'low' }}</v-chip></template>
        </v-list-item>
      </v-list>
      <v-card-text v-else class="analytics-empty-panel">No hay recomendaciones para este horizonte.</v-card-text>
    </v-card>
  </div>
</template>

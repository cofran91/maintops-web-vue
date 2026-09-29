<script setup lang="ts">
import type { ModelFilterOption } from '@/modules/shared/composables/useModelFilterOptions'
import { mdiFilterVariant, mdiRefresh } from '@mdi/js'

defineProps<{
  filters: { startDate: string; endDate: string; technicianId: string; workshopId: string; horizonDays: number }
  loading: boolean
  canEditWorkshopFilter: boolean
  loadingModelOptions: boolean
  technicianOptions: ModelFilterOption[]
  workshopOptions: ModelFilterOption[]
}>()

const emit = defineEmits<{
  apply: []
  reset: []
  update: [key: 'startDate' | 'endDate' | 'technicianId' | 'workshopId' | 'horizonDays', value: string | number]
}>()
</script>

<template>
  <v-card class="analytics-filter-card" elevation="0">
    <v-card-item>
      <template #prepend><v-avatar color="primary" variant="tonal"><v-icon :icon="mdiFilterVariant" /></v-avatar></template>
      <v-card-title>Filtros de análisis</v-card-title>
      <v-card-subtitle>Define el periodo y el alcance de la información operativa.</v-card-subtitle>
    </v-card-item>
    <v-divider />
    <v-card-text>
      <form class="analytics-filter-grid" @submit.prevent="emit('apply')">
        <v-text-field :model-value="filters.startDate" hide-details label="Desde" type="date" @update:model-value="emit('update', 'startDate', $event)" />
        <v-text-field :model-value="filters.endDate" hide-details label="Hasta" type="date" @update:model-value="emit('update', 'endDate', $event)" />
        <v-select :items="technicianOptions" :loading="loadingModelOptions" :model-value="filters.technicianId" clearable hide-details item-title="title" item-value="value" label="Técnico" placeholder="Todos los técnicos" @update:model-value="emit('update', 'technicianId', $event || '')" />
        <v-select :disabled="!canEditWorkshopFilter" :items="workshopOptions" :loading="loadingModelOptions" :model-value="filters.workshopId" clearable hide-details item-title="title" item-value="value" label="Taller" placeholder="Todos los talleres" @update:model-value="emit('update', 'workshopId', $event || '')" />
        <v-select :items="[7, 14, 30, 60, 90]" :model-value="filters.horizonDays" hide-details label="Horizonte del pronóstico" @update:model-value="emit('update', 'horizonDays', $event)" />
        <div class="analytics-filter-actions">
          <v-btn :disabled="loading" variant="text" @click="emit('reset')"><v-icon :icon="mdiRefresh" class="mr-1" size="17" />Restablecer</v-btn>
          <v-btn color="primary" :loading="loading" type="submit"><v-icon :icon="mdiFilterVariant" class="mr-1" size="17" />Filtrar</v-btn>
        </div>
      </form>
    </v-card-text>
  </v-card>
</template>

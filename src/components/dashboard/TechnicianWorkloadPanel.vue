<script setup lang="ts">
import { mdiAccountGroupOutline } from '@mdi/js'
import type { DashboardTechnicianWorkloadRow } from '@/types/dashboard'

defineProps<{ rows: DashboardTechnicianWorkloadRow[] }>()

const technicianLabel = (row: DashboardTechnicianWorkloadRow) => row.technician?.name || 'Técnico sin asignar'
const numberLabel = (value: unknown) => new Intl.NumberFormat('es-CO').format(Number(value ?? 0))
const durationLabel = (minutes: unknown) => {
  const value = Number(minutes ?? 0)
  const hours = Math.floor(value / 60)
  const remainder = value % 60
  return hours > 0 ? hours + ' h ' + remainder + ' min' : remainder + ' min'
}
</script>

<template>
  <section class="dashboard-feature-section">
    <div class="dashboard-section-heading dashboard-feature-heading">
      <div><span class="page-date">Distribución del equipo</span><h2>Carga de técnicos hoy</h2><p>Tareas y tiempo planificado para cada técnico.</p></div>
      <span class="dashboard-feature-heading__icon dashboard-feature-heading__icon--amber"><v-icon :icon="mdiAccountGroupOutline" size="20" /></span>
    </div>
    <article class="dashboard-feature-panel dashboard-table-card">
      <div class="dashboard-data-table-wrap">
        <table class="dashboard-data-table dashboard-data-table--compact">
          <thead><tr><th>Técnico</th><th>Tareas</th><th>Tiempo planificado</th></tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.technician_id">
              <td><strong class="dashboard-table-primary">{{ technicianLabel(row) }}</strong></td>
              <td><span class="dashboard-count-pill dashboard-count-pill--teal">{{ numberLabel(row.assigned_items_count) }}</span></td>
              <td>{{ durationLabel(row.planned_minutes) }}</td>
            </tr>
            <tr v-if="rows.length === 0"><td class="dashboard-table-empty" colspan="3">Sin tareas asignadas hoy.</td></tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

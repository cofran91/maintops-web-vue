<script setup lang="ts">
import { mdiGarageVariant } from '@mdi/js'
import type { DashboardWorkshopOrderRow } from '@/types/dashboard'

defineProps<{ rows: DashboardWorkshopOrderRow[] }>()

const workshopLabel = (row: DashboardWorkshopOrderRow) => {
  const workshop = row.workshop
  return workshop ? [workshop.code, workshop.name, workshop.city].filter(Boolean).join(' · ') : 'Taller sin información'
}
const numberLabel = (value: unknown) => new Intl.NumberFormat('es-CO').format(Number(value ?? 0))
</script>

<template>
  <section class="dashboard-feature-section">
    <div class="dashboard-section-heading dashboard-feature-heading">
      <div><span class="page-date">Operación por ubicación</span><h2>Órdenes por taller</h2><p>Carga actual de órdenes abiertas en cada taller.</p></div>
      <span class="dashboard-feature-heading__icon"><v-icon :icon="mdiGarageVariant" size="20" /></span>
    </div>
    <article class="dashboard-feature-panel dashboard-table-card">
      <div class="dashboard-data-table-wrap">
        <table class="dashboard-data-table dashboard-data-table--compact">
          <thead><tr><th>Taller</th><th>Órdenes abiertas</th></tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.workshop_id">
              <td><strong class="dashboard-table-primary">{{ workshopLabel(row) }}</strong></td>
              <td><span class="dashboard-count-pill">{{ numberLabel(row.open_orders_count) }}</span></td>
            </tr>
            <tr v-if="rows.length === 0"><td class="dashboard-table-empty" colspan="2">Sin órdenes abiertas por taller.</td></tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

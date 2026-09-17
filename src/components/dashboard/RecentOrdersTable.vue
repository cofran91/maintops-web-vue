<script setup lang="ts">
import { mdiArrowRight, mdiCarMultiple, mdiDotsHorizontal } from '@mdi/js'
import type { RecentOrder } from '@/types/dashboard'

defineProps<{
  orders: RecentOrder[]
}>()

const emit = defineEmits<{
  (event: 'viewAll'): void
}>()
</script>

<template>
  <article class="dashboard-card orders-card">
    <div class="card-heading card-heading--table">
      <div>
        <h2>Órdenes recientes</h2>
        <p>Últimas actualizaciones de la operación</p>
      </div>
      <button class="see-all" type="button" @click="emit('viewAll')">
        Ver todas <v-icon :icon="mdiArrowRight" size="17" />
      </button>
    </div>

    <div class="orders-table-wrap">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Vehículo</th>
            <th>Taller</th>
            <th>Técnico</th>
            <th>Actualización</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td><button class="order-link" type="button">{{ order.id }}</button></td>
            <td>
              <div class="vehicle-cell">
                <span><v-icon :icon="mdiCarMultiple" size="18" /></span>
                <div><strong>{{ order.vehicle }}</strong><small>{{ order.plate }}</small></div>
              </div>
            </td>
            <td>{{ order.workshop }}</td>
            <td>
              <div class="technician-cell">
                <span>{{ order.initials }}</span>{{ order.technician }}
              </div>
            </td>
            <td>{{ order.date }}</td>
            <td>
              <span :class="['order-status', `order-status--${order.statusKey}`]">
                <i />{{ order.status }}
              </span>
            </td>
            <td>
              <button aria-label="Más opciones" class="row-action" type="button">
                <v-icon :icon="mdiDotsHorizontal" size="19" />
              </button>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td class="table-empty" colspan="7">No hay órdenes programadas para mostrar.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

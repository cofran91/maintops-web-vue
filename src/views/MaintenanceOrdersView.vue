<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiClipboardTextOutline,
  mdiMagnify,
  mdiPlus,
  mdiRefresh,
  mdiTuneVariant,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useMaintenanceOrders } from '@/modules/maintenance-orders/composables/useMaintenanceOrders'
import { useMaintenanceOrderRealtimeRefresh } from '@/modules/realtime/composables/useMaintenanceOrderRealtimeRefresh'
import {
  MAINTENANCE_ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type MaintenanceOrder,
} from '@/types/maintenanceOrder'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchOrders,
  filters,
  loading,
  orders,
  pagination,
  perPage,
  updatePage,
  updatePerPage,
} = useMaintenanceOrders()

useMaintenanceOrderRealtimeRefresh(fetchOrders)

const statusOptions = MAINTENANCE_ORDER_STATUSES.map((value) => ({
  title: ORDER_STATUS_LABELS[value],
  value,
}))

const pageSizeOptions = [10, 15, 25, 50].map((value) => ({
  title: String(value),
  value,
}))

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const todayLabel = computed(() => {
  const label = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const pageSummary = computed(() => {
  if (pagination.value.total === 0) {
    return 'No hay órdenes que coincidan con la búsqueda'
  }

  return `${pagination.value.total} ${pagination.value.total === 1 ? 'orden registrada' : 'órdenes registradas'}`
})

const formatDate = (value?: string | null, emptyLabel = 'Sin fecha') => {
  if (!value) {
    return emptyLabel
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Sin programar'
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

const orderNumber = (order: MaintenanceOrder) => `OT-${String(order.id).padStart(5, '0')}`

const vehicleName = (order: MaintenanceOrder) =>
  [order.vehicle?.brand, order.vehicle?.model].filter(Boolean).join(' ') || `Vehículo ${order.vehicle_id}`

const vehiclePlate = (order: MaintenanceOrder) => order.vehicle?.license_plate || 'Placa pendiente'
const personName = (person?: MaintenanceOrder['owner']) => person?.name || 'Sin asignar'
const workshopName = (order: MaintenanceOrder) =>
  order.workshop
    ? [order.workshop.code, order.workshop.name].filter(Boolean).join(' · ')
    : 'Sin taller asignado'

const statusLabel = (status: string) =>
  ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || 'Estado actualizado'

const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    created: '#7c8ba6',
    pending_owner_approval: '#d58930',
    approved: '#397eea',
    partially_approved: '#397eea',
    rejected: '#dc5967',
    scheduled: '#397eea',
    in_progress: '#d58930',
    completed: '#239878',
    delivered: '#239878',
    cancelled: '#dc5967',
  }

  return colors[status] || '#7c8ba6'
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="orders-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Órdenes de mantenimiento"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="orders-main">
      <div class="orders-content">
        <header class="orders-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Órdenes de mantenimiento</h1>
            <p>Consulta y supervisa las órdenes de trabajo de tu operación.</p>
          </div>

          <div class="orders-header__actions">
            <v-btn :to="{ name: 'orders-new' }" color="primary" height="42">
              <v-icon :icon="mdiPlus" class="mr-2" size="18" />
              Nueva orden
            </v-btn>
            <v-btn
              :loading="loading"
              class="orders-refresh"
              height="42"
              variant="outlined"
              @click="fetchOrders"
            >
              <v-icon :icon="mdiRefresh" class="mr-2" size="18" />
              Actualizar
            </v-btn>
          </div>
        </header>

        <section class="orders-summary" aria-label="Resumen de órdenes">
          <div class="orders-summary__icon">
            <v-icon :icon="mdiClipboardTextOutline" size="21" />
          </div>
          <div>
            <strong>{{ pageSummary }}</strong>
            <span>Ordenadas desde la más reciente</span>
          </div>
          <v-spacer />
          <span class="orders-summary__scope">Vista operativa</span>
        </section>

        <section class="orders-panel">
          <div class="orders-panel__heading">
            <div>
              <h2>Listado de órdenes</h2>
              <p>Usa los filtros para encontrar una orden específica.</p>
            </div>
            <v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" />
          </div>

          <form class="orders-filters" @submit.prevent="applyFilters">
            <v-text-field
              v-model="filters.search"
              clearable
              hide-details
              label="Buscar"
              placeholder="Placa, vehículo, taller o responsable"
              :prepend-inner-icon="mdiMagnify"
            />

            <v-select
              v-model="filters.status"
              clearable
              hide-details
              item-title="title"
              item-value="value"
              label="Estado"
              :items="statusOptions"
            />

            <div class="orders-filters__actions">
              <v-btn color="primary" type="submit">Aplicar filtros</v-btn>
              <v-btn variant="text" type="button" @click="clearFilters">Limpiar</v-btn>
            </div>
          </form>

          <v-progress-linear v-if="loading" color="primary" indeterminate />

          <v-alert v-if="errorMessage" class="orders-alert" type="error" variant="tonal">
            <span>{{ errorMessage }}</span>
            <template #append>
              <v-btn size="small" variant="text" @click="fetchOrders">Reintentar</v-btn>
            </template>
          </v-alert>

          <div class="orders-table-wrap">
            <table class="orders-list-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Vehículo</th>
                  <th>Propietario</th>
                  <th>Taller</th>
                  <th>Técnico</th>
                  <th>Estado</th>
                  <th>Programación</th>
                  <th>Actualizada</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="loading && orders.length === 0">
                  <tr v-for="row in 6" :key="row" class="orders-skeleton-row">
                    <td v-for="cell in 8" :key="cell"><v-skeleton-loader type="text" /></td>
                  </tr>
                </template>

                <template v-else>
                  <tr v-for="order in orders" :key="order.id">
                    <td>
                      <router-link
                        class="order-number"
                        :to="{ name: 'orders-detail', params: { id: order.id } }"
                      >
                        {{ orderNumber(order) }}
                      </router-link>
                      <small>{{ formatDate(order.created_at) }}</small>
                    </td>
                    <td>
                      <div class="order-vehicle">
                        <span class="order-vehicle__icon">
                          <v-icon :icon="mdiClipboardTextOutline" size="17" />
                        </span>
                        <span>
                          <strong>{{ vehicleName(order) }}</strong>
                          <small>{{ vehiclePlate(order) }}</small>
                        </span>
                      </div>
                    </td>
                    <td><span class="order-person">{{ personName(order.owner) }}</span></td>
                    <td><span class="order-muted">{{ workshopName(order) }}</span></td>
                    <td><span class="order-muted">{{ personName(order.technician) }}</span></td>
                    <td>
                      <v-chip
                        class="order-status-chip"
                        label
                        size="small"
                        :color="statusColor(order.status)"
                        variant="tonal"
                      >
                        {{ statusLabel(order.status) }}
                      </v-chip>
                    </td>
                    <td><span class="order-muted">{{ formatDateTime(order.scheduled_at) }}</span></td>
                    <td><span class="order-muted">{{ formatDate(order.updated_at) }}</span></td>
                  </tr>
                </template>

                <tr v-if="!loading && orders.length === 0">
                  <td class="orders-empty" colspan="8">
                    <v-icon :icon="mdiAlertOutline" size="28" />
                    <strong>No encontramos órdenes</strong>
                    <span>Prueba con otros filtros o limpia la búsqueda para ver todos los registros.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="orders-pagination">
            <span>
              Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}
            </span>
            <div class="orders-pagination__controls">
              <v-select
                hide-details
                density="compact"
                item-title="title"
                item-value="value"
                label="Por página"
                :items="pageSizeOptions"
                :model-value="perPage"
                variant="outlined"
                @update:model-value="updatePerPage"
              />
              <v-pagination
                density="comfortable"
                :length="pagination.last_page"
                :model-value="pagination.current_page"
                :total-visible="5"
                @update:model-value="updatePage"
              />
            </div>
          </footer>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/orders.scss" lang="scss"></style>

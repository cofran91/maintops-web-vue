<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiCarMultiple,
  mdiMagnify,
  mdiRefresh,
  mdiTuneVariant,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useVehicles } from '@/modules/vehicles/composables/useVehicles'
import type { Vehicle } from '@/types/vehicle'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchVehicles,
  filters,
  loading,
  pagination,
  perPage,
  updatePage,
  updatePerPage,
  vehicles,
} = useVehicles()

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
    return 'No hay vehículos que coincidan con la búsqueda'
  }

  return `${pagination.value.total} ${pagination.value.total === 1 ? 'vehículo registrado' : 'vehículos registrados'}`
})

const vehicleName = (vehicle: Vehicle) =>
  [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Vehículo sin descripción'

const ownerName = (vehicle: Vehicle) => vehicle.owner?.name || `Propietario ${vehicle.owner_id}`

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const formatKilometers = (value?: number | null) =>
  value === null || value === undefined
    ? 'Sin registrar'
    : `${new Intl.NumberFormat('es-CO').format(value)} km`

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="vehicles-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Vehículos"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="vehicles-main">
      <div class="vehicles-content">
        <header class="vehicles-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Vehículos</h1>
            <p>Consulta la flota disponible para los procesos de mantenimiento.</p>
          </div>

          <v-btn
            :loading="loading"
            class="vehicles-refresh"
            height="42"
            variant="outlined"
            @click="fetchVehicles"
          >
            <v-icon :icon="mdiRefresh" class="mr-2" size="18" />
            Actualizar
          </v-btn>
        </header>

        <section class="vehicles-summary" aria-label="Resumen de vehículos">
          <div class="vehicles-summary__icon">
            <v-icon :icon="mdiCarMultiple" size="21" />
          </div>
          <div>
            <strong>{{ pageSummary }}</strong>
            <span>Ordenados desde el registro más reciente</span>
          </div>
          <v-spacer />
          <span class="vehicles-summary__scope">Vista de flota</span>
        </section>

        <section class="vehicles-panel">
          <div class="vehicles-panel__heading">
            <div>
              <h2>Listado de vehículos</h2>
              <p>Filtra la flota por identificación o características principales.</p>
            </div>
            <v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" />
          </div>

          <form class="vehicles-filters" @submit.prevent="applyFilters">
            <v-text-field
              v-model="filters.search"
              clearable
              hide-details
              label="Buscar"
              placeholder="Placa, marca, modelo o propietario"
              :prepend-inner-icon="mdiMagnify"
            />
            <v-text-field v-model="filters.brand" clearable hide-details label="Marca" />
            <v-text-field v-model="filters.model" clearable hide-details label="Modelo" />
            <v-text-field
              v-model="filters.year"
              clearable
              hide-details
              label="Año"
              min="1900"
              type="number"
            />
            <div class="vehicles-filters__actions">
              <v-btn color="primary" type="submit">Aplicar filtros</v-btn>
              <v-btn variant="text" type="button" @click="clearFilters">Limpiar</v-btn>
            </div>
          </form>

          <v-progress-linear v-if="loading" color="primary" indeterminate />

          <v-alert v-if="errorMessage" class="vehicles-alert" type="error" variant="tonal">
            <span>{{ errorMessage }}</span>
            <template #append>
              <v-btn size="small" variant="text" @click="fetchVehicles">Reintentar</v-btn>
            </template>
          </v-alert>

          <div class="vehicles-table-wrap">
            <table class="vehicles-list-table">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Propietario</th>
                  <th>Año</th>
                  <th>Color</th>
                  <th>Kilometraje</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="loading && vehicles.length === 0">
                  <tr v-for="row in 6" :key="row" class="vehicles-skeleton-row">
                    <td v-for="cell in 6" :key="cell"><v-skeleton-loader type="text" /></td>
                  </tr>
                </template>

                <template v-else>
                  <tr
                    v-for="vehicle in vehicles"
                    :key="vehicle.id"
                  >
                    <td>
                      <div class="vehicle-identity">
                        <span class="vehicle-identity__icon">
                          <v-icon :icon="mdiCarMultiple" size="17" />
                        </span>
                        <span>
                          <strong>{{ vehicle.license_plate }}</strong>
                          <small>{{ vehicleName(vehicle) }}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span class="vehicle-owner">{{ ownerName(vehicle) }}</span>
                      <small class="vehicle-secondary">{{ vehicle.owner?.email || 'Sin correo registrado' }}</small>
                    </td>
                    <td><span class="vehicle-muted">{{ vehicle.year || 'Sin año' }}</span></td>
                    <td><span class="vehicle-muted">{{ vehicle.color || 'Sin color' }}</span></td>
                    <td><span class="vehicle-muted">{{ formatKilometers(vehicle.odometer_km) }}</span></td>
                    <td><span class="vehicle-muted">{{ formatDate(vehicle.updated_at) }}</span></td>
                  </tr>
                </template>

                <tr v-if="!loading && vehicles.length === 0">
                  <td class="vehicles-empty" colspan="6">
                    <v-icon :icon="mdiAlertOutline" size="28" />
                    <strong>No encontramos vehículos</strong>
                    <span>Prueba con otros filtros o limpia la búsqueda para ver toda la flota.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="vehicles-pagination">
            <span>
              Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}
            </span>
            <div class="vehicles-pagination__controls">
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

<style src="@/styles/views/vehicles.scss" lang="scss"></style>

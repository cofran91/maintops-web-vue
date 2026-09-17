<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiGarageVariant,
  mdiMagnify,
  mdiRefresh,
  mdiTuneVariant,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useWorkshops } from '@/modules/workshops/composables/useWorkshops'
import { useAuthStore } from '@/stores/auth'
import type { Workshop } from '@/types/workshop'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchWorkshops,
  filters,
  loading,
  pagination,
  perPage,
  updatePage,
  updatePerPage,
  workshops,
} = useWorkshops()

const statusOptions = [
  { title: 'Todos los estados', value: '' },
  { title: 'Activos', value: 'active' },
  { title: 'Inactivos', value: 'inactive' },
]
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
    return 'No hay talleres que coincidan con la búsqueda'
  }

  return `${pagination.value.total} ${pagination.value.total === 1 ? 'taller registrado' : 'talleres registrados'}`
})

const statusLabel = (workshop: Workshop) => (workshop.is_active ? 'Activo' : 'Inactivo')
const statusColor = (workshop: Workshop) => (workshop.is_active ? '#239878' : '#7c8ba6')
const managerName = (workshop: Workshop) => workshop.manager?.name || `Usuario ${workshop.manager_user_id}`
const systemSummary = (workshop: Workshop) => {
  const systems = workshop.vehicle_systems || []

  if (systems.length === 0) {
    return 'Sin sistemas asignados'
  }

  const names = systems.map((system) => system.name || system.code || `Sistema ${system.id}`)
  return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ')
}

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

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="workshops-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Talleres"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="workshops-main">
      <div class="workshops-content">
        <header class="workshops-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Talleres</h1>
            <p>Supervisa los centros responsables de atender la operación de mantenimiento.</p>
          </div>

          <v-btn
            :loading="loading"
            class="workshops-refresh"
            height="42"
            variant="outlined"
            @click="fetchWorkshops"
          >
            <v-icon :icon="mdiRefresh" class="mr-2" size="18" />
            Actualizar
          </v-btn>
        </header>

        <section class="workshops-summary" aria-label="Resumen de talleres">
          <div class="workshops-summary__icon">
            <v-icon :icon="mdiGarageVariant" size="21" />
          </div>
          <div>
            <strong>{{ pageSummary }}</strong>
            <span>Ordenados desde el registro más reciente</span>
          </div>
          <v-spacer />
          <span class="workshops-summary__scope">Red de servicio</span>
        </section>

        <section class="workshops-panel">
          <div class="workshops-panel__heading">
            <div>
              <h2>Listado de talleres</h2>
              <p>Consulta ubicación, responsable y sistemas atendidos.</p>
            </div>
            <v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" />
          </div>

          <form class="workshops-filters" @submit.prevent="applyFilters">
            <v-text-field
              v-model="filters.search"
              clearable
              hide-details
              label="Buscar"
              placeholder="Nombre, código, ciudad o responsable"
              :prepend-inner-icon="mdiMagnify"
            />
            <v-text-field v-model="filters.city" clearable hide-details label="Ciudad" />
            <v-select
              v-model="filters.status"
              hide-details
              item-title="title"
              item-value="value"
              label="Estado"
              :items="statusOptions"
            />
            <div class="workshops-filters__actions">
              <v-btn color="primary" type="submit">Aplicar filtros</v-btn>
              <v-btn variant="text" type="button" @click="clearFilters">Limpiar</v-btn>
            </div>
          </form>

          <v-progress-linear v-if="loading" color="primary" indeterminate />

          <v-alert v-if="errorMessage" class="workshops-alert" type="error" variant="tonal">
            <span>{{ errorMessage }}</span>
            <template #append>
              <v-btn size="small" variant="text" @click="fetchWorkshops">Reintentar</v-btn>
            </template>
          </v-alert>

          <div class="workshops-table-wrap">
            <table class="workshops-list-table">
              <thead>
                <tr>
                  <th>Taller</th>
                  <th>Responsable</th>
                  <th>Ubicación</th>
                  <th>Sistemas atendidos</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="loading && workshops.length === 0">
                  <tr v-for="row in 6" :key="row" class="workshops-skeleton-row">
                    <td v-for="cell in 6" :key="cell"><v-skeleton-loader type="text" /></td>
                  </tr>
                </template>

                <template v-else>
                  <tr v-for="workshop in workshops" :key="workshop.id">
                    <td>
                      <div class="workshop-identity">
                        <span class="workshop-identity__icon"><v-icon :icon="mdiGarageVariant" size="17" /></span>
                        <span>
                          <strong>{{ workshop.name }}</strong>
                          <small>{{ workshop.code }}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong class="workshop-manager">{{ managerName(workshop) }}</strong>
                      <small class="workshop-secondary">{{ workshop.manager?.email || 'Sin correo registrado' }}</small>
                    </td>
                    <td>
                      <span class="workshop-location">{{ workshop.city || 'Ciudad pendiente' }}</span>
                      <small class="workshop-secondary">{{ workshop.address || 'Dirección pendiente' }}</small>
                    </td>
                    <td><span class="workshop-muted">{{ systemSummary(workshop) }}</span></td>
                    <td>
                      <v-chip label size="small" :color="statusColor(workshop)" variant="tonal">
                        {{ statusLabel(workshop) }}
                      </v-chip>
                    </td>
                    <td><span class="workshop-muted">{{ formatDate(workshop.updated_at) }}</span></td>
                  </tr>
                </template>

                <tr v-if="!loading && workshops.length === 0">
                  <td class="workshops-empty" colspan="6">
                    <v-icon :icon="mdiAlertOutline" size="28" />
                    <strong>No encontramos talleres</strong>
                    <span>Prueba con otros filtros o limpia la búsqueda para ver toda la red de servicio.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="workshops-pagination">
            <span>
              Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}
            </span>
            <div class="workshops-pagination__controls">
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

<style src="@/styles/views/workshops.scss" lang="scss"></style>

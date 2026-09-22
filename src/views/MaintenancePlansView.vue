<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiCalendarClockOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiMagnify,
  mdiPlus,
  mdiRefresh,
  mdiTuneVariant,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import MaintenanceTaskCombobox from '@/modules/maintenance-tasks/components/MaintenanceTaskCombobox.vue'
import { useMaintenancePlans } from '@/modules/maintenance-plans/composables/useMaintenancePlans'
import { useAuthStore } from '@/stores/auth'
import type { MaintenancePlan } from '@/types/maintenancePlan'

const router = useRouter()
const { locale } = useI18n()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const canCreatePlan = computed(() => authStore.canUseResource('maintenance-plans', 'create'))

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchPlans,
  filters,
  hasActiveFilters,
  loading,
  pagination,
  perPage,
  updatePage,
  updatePerPage,
  plans,
} = useMaintenancePlans()

const filtersExpanded = ref(false)
const statusOptions = [
  { title: 'Todos los estados', value: '' },
  { title: 'Activos', value: 'active' },
  { title: 'Inactivos', value: 'inactive' },
]
const pageSizeOptions = [10, 15, 25, 50].map((value) => ({ title: String(value), value }))

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
  const label = new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
})
const pageSummary = computed(() => {
  if (pagination.value.total === 0) return 'No hay planes que coincidan con la búsqueda'
  return `${pagination.value.total} ${pagination.value.total === 1 ? 'plan registrado' : 'planes registrados'}`
})
const statusLabel = (plan: MaintenancePlan) => (plan.is_active ? 'Activo' : 'Inactivo')
const statusColor = (plan: MaintenancePlan) => (plan.is_active ? '#239878' : '#7c8ba6')
const taskCount = (plan: MaintenancePlan) => plan.tasks_count ?? plan.tasks?.length ?? 0
const intervalLabel = (plan: MaintenancePlan) => {
  const parts = []
  if (plan.recommended_interval_days) parts.push(`${plan.recommended_interval_days} días`)
  if (plan.recommended_interval_km) parts.push(`${plan.recommended_interval_km.toLocaleString(locale.value)} km`)
  return parts.join(' · ') || 'Sin intervalo definido'
}
const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="maintenance-plans-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Planes de mantenimiento"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="maintenance-plans-main">
      <div class="maintenance-plans-content">
        <header class="maintenance-plans-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Planes de mantenimiento</h1>
            <p>Define las rutinas preventivas que mantienen la flota lista para operar.</p>
          </div>
          <div class="maintenance-plans-header__actions">
            <v-btn v-if="canCreatePlan" color="primary" height="42" :to="{ name: 'maintenance-plans-new' }">
              <v-icon :icon="mdiPlus" class="mr-2" size="18" />
              Nuevo plan
            </v-btn>
            <v-btn
              :loading="loading"
              class="maintenance-plans-refresh"
              height="42"
              variant="outlined"
              @click="fetchPlans"
            >
              <v-icon :icon="mdiRefresh" class="mr-2" size="18" />
              Actualizar
            </v-btn>
          </div>
        </header>

        <section class="maintenance-plans-summary" aria-label="Resumen de planes">
          <div class="maintenance-plans-summary__icon"><v-icon :icon="mdiCalendarClockOutline" size="21" /></div>
          <div><strong>{{ pageSummary }}</strong><span>Rutinas preventivas configuradas para la flota</span></div>
          <v-spacer />
          <span class="maintenance-plans-summary__scope">Mantenimiento preventivo</span>
        </section>

        <section class="maintenance-plans-panel">
          <div class="maintenance-plans-panel__heading">
            <div><h2>Catálogo de planes</h2><p>Consulta frecuencia, actividades y disponibilidad de cada rutina.</p></div>
            <v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" />
          </div>

          <form class="maintenance-plans-filters" @submit.prevent="applyFilters">
            <v-text-field
              v-model="filters.search"
              clearable
              hide-details
              label="Buscar"
              placeholder="Código o nombre del plan"
              :prepend-inner-icon="mdiMagnify"
            />
            <v-text-field v-model="filters.code" hide-details label="Código" placeholder="Ej. PM-10000" />
            <v-select
              v-model="filters.is_active"
              hide-details
              item-title="title"
              item-value="value"
              label="Estado"
              :items="statusOptions"
            />
            <div class="maintenance-plans-filters__actions">
              <v-btn color="primary" type="submit">Aplicar filtros</v-btn>
              <v-btn :disabled="!hasActiveFilters" variant="text" type="button" @click="clearFilters">Limpiar</v-btn>
              <v-btn class="maintenance-plans-advanced-toggle" size="small" type="button" variant="text" @click="filtersExpanded = !filtersExpanded">
                <v-icon :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown" class="mr-1" size="15" />
                {{ filtersExpanded ? 'Menos filtros' : 'Más filtros' }}
              </v-btn>
            </div>
          </form>

          <v-expand-transition>
            <div v-if="filtersExpanded" class="maintenance-plans-filters__advanced">
              <v-text-field v-model="filters.name" hide-details label="Nombre exacto" placeholder="Nombre del plan" />
              <MaintenanceTaskCombobox
                :model-value="filters.task_id"
                label="Actividad incluida"
                placeholder="Busca una tarea del catálogo"
                @update:model-value="filters.task_id = $event ? String($event) : ''"
              />
              <v-text-field v-model="filters.recommended_interval_days_from" hide-details label="Días desde" min="1" type="number" />
              <v-text-field v-model="filters.recommended_interval_days_to" hide-details label="Días hasta" min="1" type="number" />
              <v-text-field v-model="filters.recommended_interval_km_from" hide-details label="Kilómetros desde" min="1" type="number" />
              <v-text-field v-model="filters.recommended_interval_km_to" hide-details label="Kilómetros hasta" min="1" type="number" />
              <v-text-field v-model="filters.created_from" hide-details label="Creado desde" type="date" />
              <v-text-field v-model="filters.created_to" hide-details label="Creado hasta" type="date" />
            </div>
          </v-expand-transition>

          <v-progress-linear v-if="loading" color="primary" indeterminate />
          <v-alert v-if="errorMessage" class="maintenance-plans-alert" type="error" variant="tonal">
            <span>{{ errorMessage }}</span>
            <template #append><v-btn size="small" variant="text" @click="fetchPlans">Reintentar</v-btn></template>
          </v-alert>

          <div class="maintenance-plans-table-wrap">
            <table class="maintenance-plans-list-table">
              <thead><tr><th>Plan</th><th>Frecuencia</th><th>Actividades</th><th>Estado</th><th>Actualizado</th></tr></thead>
              <tbody>
                <template v-if="loading && plans.length === 0">
                  <tr v-for="row in 6" :key="row" class="maintenance-plans-skeleton-row">
                    <td v-for="cell in 5" :key="cell"><v-skeleton-loader type="text" /></td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="plan in plans" :key="plan.id">
                    <td>
                      <div class="maintenance-plan-identity">
                        <span class="maintenance-plan-identity__icon"><v-icon :icon="mdiCalendarClockOutline" size="17" /></span>
                        <span>
                          <router-link class="maintenance-plan-number" :to="{ name: 'maintenance-plans-detail', params: { id: plan.id } }">{{ plan.name }}</router-link>
                          <small>{{ plan.code }}</small>
                        </span>
                      </div>
                    </td>
                    <td><span class="maintenance-plan-muted">{{ intervalLabel(plan) }}</span></td>
                    <td><strong class="maintenance-plan-task-count">{{ taskCount(plan) }}</strong><small class="maintenance-plan-secondary">actividades configuradas</small></td>
                    <td><v-chip label size="small" :color="statusColor(plan)" variant="tonal">{{ statusLabel(plan) }}</v-chip></td>
                    <td><span class="maintenance-plan-muted">{{ formatDate(plan.updated_at || plan.created_at) }}</span></td>
                  </tr>
                </template>
                <tr v-if="!loading && plans.length === 0">
                  <td class="maintenance-plans-empty" colspan="5">
                    <v-icon :icon="mdiAlertOutline" size="28" />
                    <strong>No encontramos planes de mantenimiento</strong>
                    <span>Prueba con otros filtros o registra una nueva rutina preventiva.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="maintenance-plans-pagination">
            <span>Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}</span>
            <div class="maintenance-plans-pagination__controls">
              <v-select hide-details density="compact" item-title="title" item-value="value" label="Por página" :items="pageSizeOptions" :model-value="perPage" variant="outlined" @update:model-value="updatePerPage" />
              <v-pagination density="comfortable" :length="pagination.last_page" :model-value="pagination.current_page" :total-visible="5" @update:model-value="updatePage" />
            </div>
          </footer>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/maintenance-plans.scss" lang="scss"></style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiAlertOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiDownload,
  mdiGarageVariant,
  mdiMagnify,
  mdiPlus,
  mdiRefresh,
  mdiTuneVariant,
  mdiUpload,
} from '@mdi/js'
import { normalizeApiError } from '@/api/errors'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog.vue'
import DataImportDialog from '@/components/common/DataImportDialog.vue'
import ResourceRowActions from '@/components/common/ResourceRowActions.vue'
import { useWorkshops } from '@/modules/workshops/composables/useWorkshops'
import { useModelFilterOptions } from '@/modules/shared/composables/useModelFilterOptions'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import { useAuthStore } from '@/stores/auth'
import type { ImportSummaryField } from '@/types/import'
import type { Workshop } from '@/types/workshop'

const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()
const mobileDrawer = ref(false)
const canCreateWorkshop = computed(() => authStore.canUseResource('workshops', 'create'))
const canImportWorkshop = computed(() => authStore.canUseResource('workshops', 'import'))
const canExportWorkshop = computed(() => authStore.canUseResource('workshops', 'export'))
const canUpdateWorkshop = computed(() => authStore.canUseResource('workshops', 'update'))
const canDeleteWorkshop = computed(() => authStore.canUseResource('workshops', 'delete'))
const importing = ref(false)
const exporting = ref(false)
const importDialogOpen = ref(false)
const deleting = ref(false)
const deleteDialogOpen = ref(false)
const workshopToDelete = ref<Workshop | null>(null)
const filtersExpanded = ref(false)

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchWorkshops,
  filters,
  hasActiveFilters,
  loading,
  pagination,
  perPage,
  updatePage,
  updatePerPage,
  workshops,
} = useWorkshops()

const { loading: loadingModelOptions, managerOptions, vehicleSystemOptions } = useModelFilterOptions({ users: true, vehicleSystems: true })

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
  const label = new Intl.DateTimeFormat(locale.value, {
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

  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const importSummaryFields: ImportSummaryField[] = [
  { key: 'processed_rows', label: 'Filas procesadas' },
  { key: 'rows_with_errors', label: 'Filas con errores' },
  { key: 'created_records', label: 'Creados' },
  { key: 'updated_records', label: 'Actualizados' },
]

const openImportDialog = () => {
  importDialogOpen.value = true
}

const importWorkshops = (file: File) => workshopsApi.importWorkshops(file)

const refreshAfterImport = () => {
  void fetchWorkshops()
}

const exportWorkshops = async () => {
  exporting.value = true
  errorMessage.value = ''

  try {
    await workshopsApi.exportWorkshops()
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    exporting.value = false
  }
}

const deleteMessage = computed(() =>
  workshopToDelete.value
    ? `¿Seguro que deseas eliminar el taller ${workshopToDelete.value.name}? Esta acción no se puede deshacer.`
    : '',
)

const askDelete = (workshop: Workshop) => {
  workshopToDelete.value = workshop
  deleteDialogOpen.value = true
}

const deleteWorkshop = async () => {
  if (!workshopToDelete.value) return

  deleting.value = true
  errorMessage.value = ''

  try {
    await workshopsApi.remove(workshopToDelete.value.id)
    deleteDialogOpen.value = false
    workshopToDelete.value = null
    await fetchWorkshops()

    if (workshops.value.length === 0 && pagination.value.current_page > 1) {
      updatePage(pagination.value.current_page - 1)
    }
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
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

          <div class="workshops-header__actions">
            <v-btn
              v-if="canImportWorkshop"
              color="secondary"
              :disabled="importing"
              height="42"
              variant="tonal"
              @click="openImportDialog"
            >
              <v-icon :icon="mdiUpload" class="mr-2" size="17" />
              Importar
            </v-btn>
            <v-btn
              v-if="canExportWorkshop"
              class="workshops-refresh"
              height="42"
              :loading="exporting"
              variant="outlined"
              @click="exportWorkshops"
            >
              <v-icon :icon="mdiDownload" class="mr-2" size="17" />
              Exportar
            </v-btn>
            <v-btn v-if="canCreateWorkshop" color="primary" height="42" :to="{ name: 'workshops-new' }">
              <v-icon :icon="mdiPlus" class="mr-2" size="18" />
              Nuevo taller
            </v-btn>
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
          </div>
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
              <v-btn color="primary" type="submit">Filtrar</v-btn>
              <v-btn
                class="filters-advanced-toggle"
                type="button"
                variant="tonal"
                @click="filtersExpanded = !filtersExpanded"
              >
                <v-icon
                  :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown"
                  class="mr-1"
                  size="15"
                />
                {{ filtersExpanded ? 'Menos filtros' : 'Más filtros' }}
              </v-btn>
              <v-btn :disabled="!hasActiveFilters" variant="text" type="button" @click="clearFilters">
                Limpiar
              </v-btn>
            </div>
            <v-expand-transition>
              <div v-if="filtersExpanded" class="workshops-filters__advanced">
                <v-text-field v-model="filters.code" clearable hide-details label="Código exacto" />
                <v-text-field v-model="filters.name" clearable hide-details label="Nombre exacto" />
                <v-text-field v-model="filters.phone" clearable hide-details label="Teléfono" />
                <v-text-field v-model="filters.email" clearable hide-details label="Correo" />
                <v-select
                  v-model="filters.manager_user_id"
                  clearable
                  hide-details
                  item-title="title"
                  item-value="value"
                  label="Responsable"
                  :items="managerOptions"
                  :loading="loadingModelOptions"
                  placeholder="Todos los responsables"
                />
                <v-select
                  v-model="filters.vehicle_system_id"
                  clearable
                  hide-details
                  item-title="title"
                  item-value="value"
                  label="Sistema"
                  :items="vehicleSystemOptions"
                  :loading="loadingModelOptions"
                  placeholder="Todos los sistemas"
                />
                <v-text-field
                  v-model="filters.created_from"
                  clearable
                  hide-details
                  label="Registrado desde"
                  type="date"
                />
                <v-text-field
                  v-model="filters.created_to"
                  clearable
                  hide-details
                  label="Registrado hasta"
                  type="date"
                />
              </div>
            </v-expand-transition>
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
                  <th>Acciones</th>
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
                          <router-link
                            class="workshop-number"
                            :to="{ name: 'workshops-detail', params: { id: workshop.id } }"
                            @click.stop
                          >
                            {{ workshop.name }}
                          </router-link>
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
                    <td class="workshops-actions-cell">
                      <ResourceRowActions
                        :can-delete="canDeleteWorkshop"
                        :can-update="canUpdateWorkshop"
                        :detail-to="{ name: 'workshops-detail', params: { id: workshop.id } }"
                        :edit-to="{ name: 'workshops-edit', params: { id: workshop.id } }"
                        @delete="askDelete(workshop)"
                      />
                    </td>
                  </tr>
                </template>

                <tr v-if="!loading && workshops.length === 0">
                  <td class="workshops-empty" colspan="7">
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

      <DataImportDialog
        v-model="importDialogOpen"
        :import-action="importWorkshops"
        :summary-fields="importSummaryFields"
        title="Importar talleres"
        @imported="refreshAfterImport"
        @processing="importing = $event"
      />

      <ConfirmDeleteDialog
        v-model="deleteDialogOpen"
        :message="deleteMessage"
        :processing="deleting"
        title="Eliminar taller"
        @confirm="deleteWorkshop"
      />
    </v-main>
  </div>
</template>

<style src="@/styles/views/workshops.scss" lang="scss"></style>

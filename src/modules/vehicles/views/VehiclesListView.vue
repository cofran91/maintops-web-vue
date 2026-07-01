<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiCar,
  mdiDownload,
  mdiPlus,
  mdiUpload,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
  normalizePermissionRoles,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { ROLES } from '@/types/auth.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import { getPositiveNumberQuery } from '@/modules/shared/utils/queryParams.js'
import {
  emptyFallback,
  formatDate as formatDateValue,
  formatTranslatedUnit,
} from '@/modules/shared/utils/formatters.js'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService.js'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import DeleteResourceModal from '@/modules/shared/components/DeleteResourceModal.vue'
import ResourceListStatus from '@/modules/shared/components/ResourceListStatus.vue'
import ResourcePagination from '@/modules/shared/components/ResourcePagination.vue'
import ResourceRowActions from '@/modules/shared/components/ResourceRowActions.vue'
import BaseButton from '@/components/BaseButton.vue'
import DataImportModal from '@/components/DataImportModal.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import VehicleFilters from '@/modules/vehicles/components/VehicleFilters.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { locale, t } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  license_plate: '',
  brand: '',
  owner_id: '',
  model: '',
  year: '',
  color: '',
  created_from: '',
  created_to: '',
})

const columns = computed(() => [
  { key: 'vehicle', label: t('vehicles.columns.vehicle') },
  { key: 'owner', label: t('vehicles.columns.owner') },
  { key: 'year', label: t('vehicles.columns.year') },
  { key: 'color', label: t('vehicles.columns.color') },
  { key: 'odometer_km', label: t('vehicles.columns.odometer') },
  { key: 'updated_at', label: t('vehicles.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'
const vehicleFileRoles = Object.freeze([ROLES.SUPER_ADMIN, ROLES.ADMIN])
const importAccept =
  '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

const exporting = ref(false)
const importing = ref(false)
const deleting = ref(false)
const deleteModalOpen = ref(false)
const importModalOpen = ref(false)
const vehicleToDelete = ref(null)
const filtersExpanded = ref(false)

const currentApiFilters = (nextFilters) => {
  const apiFilters = {}
  const ownerId = getPositiveNumberQuery(nextFilters.owner_id)
  const year = getPositiveNumberQuery(nextFilters.year)

  if (nextFilters.license_plate) {
    apiFilters.license_plate = nextFilters.license_plate
  }

  if (nextFilters.brand) {
    apiFilters.brand = nextFilters.brand
  }

  if (nextFilters.model) {
    apiFilters.model = nextFilters.model
  }

  if (year !== null) {
    apiFilters.year = year
  }

  if (nextFilters.color) {
    apiFilters.color = nextFilters.color
  }

  if (ownerId !== null) {
    apiFilters.owner_id = ownerId
  }

  if (nextFilters.created_from) {
    apiFilters.created_from = nextFilters.created_from
  }

  if (nextFilters.created_to) {
    apiFilters.created_to = nextFilters.created_to
  }

  return apiFilters
}

const {
  items: vehicles,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchVehicles,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'operations-vehicles',
  emptyFilters: EMPTY_FILTERS,
  fetcher: vehiclesApi.index,
  toApiFilters: currentApiFilters,
})

const canCreateVehicle = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canUpdateVehicle = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canDeleteVehicle = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canExportVehicles = computed(() =>
  normalizePermissionRoles(authStore.roles).some((role) => vehicleFileRoles.includes(role)),
)
const canImportVehicles = computed(() =>
  normalizePermissionRoles(authStore.roles).some((role) => vehicleFileRoles.includes(role)),
)
const deleteMessage = computed(() => {
  if (!vehicleToDelete.value) {
    return ''
  }

  return t('vehicles.delete.confirmMessage', { plate: vehicleToDelete.value.license_plate })
})
const importSummaryFields = computed(() => [
  { key: 'processed_rows', label: t('vehicles.import.processedRows') },
  { key: 'rows_with_errors', label: t('vehicles.import.rowsWithErrors') },
  { key: 'created_records', label: t('vehicles.import.createdRecords') },
  { key: 'updated_records', label: t('vehicles.import.updatedRecords') },
])

const askDelete = (vehicle) => {
  vehicleToDelete.value = vehicle
  deleteModalOpen.value = true
}

const openImportModal = () => {
  importModalOpen.value = true
}

const deleteVehicle = async () => {
  if (!vehicleToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await vehiclesApi.remove(vehicleToDelete.value.id)
    deleteModalOpen.value = false
    vehicleToDelete.value = null
    await fetchVehicles()

    if (vehicles.value.length === 0 && pagination.value.current_page > 1) {
      updatePage(pagination.value.current_page - 1)
    }
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const exportVehicles = async () => {
  exporting.value = true
  errorMessage.value = ''

  try {
    await vehiclesApi.exportVehicles()
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    exporting.value = false
  }
}

const importVehicles = (file) => vehiclesApi.importVehicles(file)

const refreshAfterImport = () => fetchVehicles()

const setImporting = (value) => {
  importing.value = value
}

const setFilter = (key, value) => {
  filters[key] = value
}

const ownerName = (vehicle) => vehicle.owner?.name ?? t('vehicles.labels.ownerNumber', {
  id: vehicle.owner_id,
})
const vehicleDescription = (vehicle) =>
  [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || '-'

const formatKilometers = (value) =>
  formatTranslatedUnit(value, locale.value, t, 'vehicles.units.kilometers')

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
  })
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('vehicles.list.title')"
      :subtitle="t('vehicles.list.subtitle')"
      :eyebrow="t('vehicles.page.eyebrow')"
      :icon="mdiCar"
    >
      <template #actions>
        <BaseButton
          v-if="canImportVehicles"
          color="whiteDark"
          :icon="mdiUpload"
          :title="importing ? t('vehicles.actions.importing') : t('vehicles.actions.importVehicles')"
          :aria-label="importing ? t('vehicles.actions.importing') : t('vehicles.actions.importVehicles')"
          :disabled="importing"
          @click="openImportModal"
        />
        <BaseButton
          v-if="canExportVehicles"
          color="whiteDark"
          :icon="mdiDownload"
          :title="exporting ? t('vehicles.actions.exporting') : t('vehicles.actions.exportVehicles')"
          :aria-label="exporting ? t('vehicles.actions.exporting') : t('vehicles.actions.exportVehicles')"
          :disabled="exporting"
          @click="exportVehicles"
        />
        <BaseButton
          v-if="canCreateVehicle"
          :to="{ name: 'operations-vehicles-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('vehicles.actions.newVehicle')"
          :aria-label="t('vehicles.actions.newVehicle')"
        />
      </template>

      <VehicleFilters
        :filters="filters"
        :expanded="filtersExpanded"
        :has-active-filters="hasActiveFilters"
        :input-class="inputClass"
        @apply="applyFilters"
        @clear="clearFilters"
        @focusout="applyFiltersOnFocusOut"
        @toggle-expanded="filtersExpanded = !filtersExpanded"
        @update-filter="setFilter"
      />

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('vehicles.list.loading')"
        :retry-label="t('vehicles.actions.retry')"
        @retry="fetchVehicles"
      />

      <template v-if="!loading && !errorMessage">
        <AppDataTable
          v-if="vehicles.length"
          :columns="columns"
          :rows="vehicles"
          :empty-title="t('vehicles.list.emptyTitle')"
          :empty-description="t('vehicles.list.emptyDescription')"
        >
          <template #cell-vehicle="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ row.license_plate }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ vehicleDescription(row) }}
              </p>
            </div>
          </template>
          <template #cell-owner="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ ownerName(row) }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ row.owner?.email ?? '-' }}
              </p>
            </div>
          </template>
          <template #cell-year="{ value }">
            {{ emptyFallback(value) }}
          </template>
          <template #cell-color="{ value }">
            {{ emptyFallback(value) }}
          </template>
          <template #cell-odometer_km="{ value }">
            {{ formatKilometers(value) }}
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <ResourceRowActions
              :detail-to="{ name: 'operations-vehicles-detail', params: { id: row.id } }"
              :edit-to="{ name: 'operations-vehicles-edit', params: { id: row.id } }"
              :can-update="canUpdateVehicle"
              :can-delete="canDeleteVehicle"
              :open-label="t('vehicles.actions.openVehicle')"
              :edit-label="t('vehicles.actions.editVehicle')"
              :delete-label="t('vehicles.actions.deleteVehicle')"
              @delete="askDelete(row)"
            />
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('vehicles.list.emptyTitle')"
          :description="t('vehicles.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateVehicle"
            :to="{ name: 'operations-vehicles-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('vehicles.actions.newVehicle')"
            :aria-label="t('vehicles.actions.newVehicle')"
          />
        </AppEmptyState>

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('vehicles.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('vehicles.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('vehicles.pagination.previousPage')"
          :next-label="t('vehicles.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />
      </template>
    </AppPage>

    <DataImportModal
      v-model="importModalOpen"
      :title="t('vehicles.import.title')"
      :import-action="importVehicles"
      :summary-fields="importSummaryFields"
      :accept="importAccept"
      :file-label="t('vehicles.import.fileLabel')"
      :file-hint="t('vehicles.import.fileHint')"
      :import-label="t('vehicles.actions.import')"
      :importing-label="t('vehicles.actions.importing')"
      :done-label="t('common.actions.done')"
      :select-file-message="t('vehicles.import.selectFile')"
      :waiting-message="t('vehicles.import.waiting')"
      :error-fallback="t('vehicles.errors.import')"
      :errors-title="t('vehicles.import.errorsTitle')"
      :row-label="t('vehicles.import.rowNumber', { row: '{row}' })"
      :no-row-errors-label="t('vehicles.import.noRowErrors')"
      @imported="refreshAfterImport"
      @processing="setImporting"
    />

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('vehicles.delete.title')"
      :delete-label="t('vehicles.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteVehicle"
    />
  </LayoutAuthenticated>
</template>

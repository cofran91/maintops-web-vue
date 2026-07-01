<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiDownload,
  mdiPlus,
  mdiUpload,
  mdiWrenchOutline,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
  normalizePermissionRoles,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import { getPositiveNumberQuery } from '@/modules/shared/utils/queryParams.js'
import { emptyFallback, formatDate as formatDateValue } from '@/modules/shared/utils/formatters.js'
import workshopsApi from '@/modules/workshops/services/workshopsService.js'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
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
import WorkshopFilters from '@/modules/workshops/components/WorkshopFilters.vue'
import { ROLES } from '@/types/auth.js'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { locale, t } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  code: '',
  city: '',
  is_active: '',
  name: '',
  phone: '',
  email: '',
  manager_user_id: '',
  vehicle_system_id: '',
  created_from: '',
  created_to: '',
})

const columns = computed(() => [
  { key: 'workshop', label: t('workshops.columns.workshop') },
  { key: 'manager', label: t('workshops.columns.manager') },
  { key: 'city', label: t('workshops.columns.city') },
  { key: 'vehicle_systems', label: t('workshops.columns.systems') },
  { key: 'is_active', label: t('workshops.columns.status') },
  { key: 'updated_at', label: t('workshops.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'
const workshopFileRoles = Object.freeze([ROLES.SUPER_ADMIN, ROLES.ADMIN])
const importAccept =
  '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

const vehicleSystems = ref([])
const exporting = ref(false)
const importing = ref(false)
const deleting = ref(false)
const vehicleSystemsError = ref('')
const deleteModalOpen = ref(false)
const importModalOpen = ref(false)
const workshopToDelete = ref(null)
const filtersExpanded = ref(false)

const currentApiFilters = (nextFilters) => {
  const apiFilters = {}
  const managerUserId = getPositiveNumberQuery(nextFilters.manager_user_id)
  const vehicleSystemId = getPositiveNumberQuery(nextFilters.vehicle_system_id)

  if (nextFilters.name) {
    apiFilters.name = nextFilters.name
  }

  if (nextFilters.code) {
    apiFilters.code = nextFilters.code
  }

  if (nextFilters.city) {
    apiFilters.city = nextFilters.city
  }

  if (nextFilters.email) {
    apiFilters.email = nextFilters.email
  }

  if (nextFilters.phone) {
    apiFilters.phone = nextFilters.phone
  }

  if (nextFilters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (nextFilters.is_active === 'false') {
    apiFilters.is_active = false
  }

  if (managerUserId !== null) {
    apiFilters.manager_user_id = managerUserId
  }

  if (vehicleSystemId !== null) {
    apiFilters.vehicle_system_id = vehicleSystemId
  }

  if (nextFilters.created_from) {
    apiFilters.created_from = nextFilters.created_from
  }

  if (nextFilters.created_to) {
    apiFilters.created_to = nextFilters.created_to
  }

  return apiFilters
}

const sanitizeFilters = (nextFilters) => {
  if (!['', 'true', 'false'].includes(nextFilters.is_active)) {
    nextFilters.is_active = ''
  }
}

const {
  items: workshops,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchWorkshops,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'operations-workshops',
  emptyFilters: EMPTY_FILTERS,
  fetcher: workshopsApi.index,
  toApiFilters: currentApiFilters,
  sanitizeFilters,
})

const canCreateWorkshop = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const canUpdateWorkshop = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const canDeleteWorkshop = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const canExportWorkshops = computed(() =>
  normalizePermissionRoles(authStore.roles).some((role) => workshopFileRoles.includes(role)),
)
const canImportWorkshops = computed(() =>
  normalizePermissionRoles(authStore.roles).some((role) => workshopFileRoles.includes(role)),
)
const deleteMessage = computed(() => {
  if (!workshopToDelete.value) {
    return ''
  }

  return t('workshops.delete.confirmMessage', { name: workshopToDelete.value.name })
})
const importSummaryFields = computed(() => [
  { key: 'processed_rows', label: t('workshops.import.processedRows') },
  { key: 'rows_with_errors', label: t('workshops.import.rowsWithErrors') },
  { key: 'created_records', label: t('workshops.import.createdRecords') },
  { key: 'updated_records', label: t('workshops.import.updatedRecords') },
])

const fetchVehicleSystems = async () => {
  if (vehicleSystems.value.length > 0) {
    return
  }

  vehicleSystemsError.value = ''

  try {
    const data = await vehicleSystemsApi.index({
      page: 1,
      per_page: 100,
    })

    vehicleSystems.value = data.items
  } catch (error) {
    vehicleSystemsError.value = normalizeApiError(error).message
  }
}

const askDelete = (workshop) => {
  workshopToDelete.value = workshop
  deleteModalOpen.value = true
}

const openImportModal = () => {
  importModalOpen.value = true
}

const deleteWorkshop = async () => {
  if (!workshopToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await workshopsApi.remove(workshopToDelete.value.id)
    deleteModalOpen.value = false
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

const importWorkshops = (file) => workshopsApi.importWorkshops(file)

const refreshAfterImport = () => fetchWorkshops()

const setImporting = (value) => {
  importing.value = value
}

const setFilter = (key, value) => {
  filters[key] = value
}

const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) =>
  isActive ? t('workshops.status.active') : t('workshops.status.inactive')

const systemSummary = (workshop) => {
  const systems = workshop.vehicle_systems ?? []

  if (systems.length === 0) {
    return '-'
  }

  if (systems.length <= 2) {
    return systems.map((system) => system.name).join(', ')
  }

  return `${systems.slice(0, 2).map((system) => system.name).join(', ')} +${systems.length - 2}`
}

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
  })

void fetchVehicleSystems()
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('workshops.list.title')"
      :subtitle="t('workshops.list.subtitle')"
      :eyebrow="t('workshops.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          v-if="canImportWorkshops"
          color="whiteDark"
          :icon="mdiUpload"
          :title="importing ? t('workshops.actions.importing') : t('workshops.actions.importWorkshops')"
          :aria-label="importing ? t('workshops.actions.importing') : t('workshops.actions.importWorkshops')"
          :disabled="importing"
          @click="openImportModal"
        />
        <BaseButton
          v-if="canExportWorkshops"
          color="whiteDark"
          :icon="mdiDownload"
          :title="exporting ? t('workshops.actions.exporting') : t('workshops.actions.exportWorkshops')"
          :aria-label="exporting ? t('workshops.actions.exporting') : t('workshops.actions.exportWorkshops')"
          :disabled="exporting"
          @click="exportWorkshops"
        />
        <BaseButton
          v-if="canCreateWorkshop"
          :to="{ name: 'operations-workshops-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('workshops.actions.newWorkshop')"
          :aria-label="t('workshops.actions.newWorkshop')"
        />
      </template>

      <WorkshopFilters
        :filters="filters"
        :expanded="filtersExpanded"
        :has-active-filters="hasActiveFilters"
        :input-class="inputClass"
        :vehicle-systems="vehicleSystems"
        :vehicle-systems-error="vehicleSystemsError"
        @apply="applyFilters"
        @clear="clearFilters"
        @focusout="applyFiltersOnFocusOut"
        @toggle-expanded="filtersExpanded = !filtersExpanded"
        @update-filter="setFilter"
      />

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('workshops.list.loading')"
        :retry-label="t('workshops.actions.retry')"
        @retry="fetchWorkshops"
      />

      <template v-if="!loading && !errorMessage">
        <AppDataTable
          v-if="workshops.length"
          :columns="columns"
          :rows="workshops"
          :empty-title="t('workshops.list.emptyTitle')"
          :empty-description="t('workshops.list.emptyDescription')"
        >
          <template #cell-workshop="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">{{ row.name }}</p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">{{ row.code }}</p>
            </div>
          </template>
          <template #cell-manager="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ row.manager?.name ?? '-' }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ row.manager?.email ?? '-' }}
              </p>
            </div>
          </template>
          <template #cell-city="{ value }">
            {{ emptyFallback(value) }}
          </template>
          <template #cell-vehicle_systems="{ row }">
            {{ systemSummary(row) }}
          </template>
          <template #cell-is_active="{ value }">
            <AppBadge :label="statusLabel(value)" :color="statusColor(value)" />
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <ResourceRowActions
              :detail-to="{ name: 'operations-workshops-detail', params: { id: row.id } }"
              :edit-to="{ name: 'operations-workshops-edit', params: { id: row.id } }"
              :can-update="canUpdateWorkshop"
              :can-delete="canDeleteWorkshop"
              :open-label="t('workshops.actions.openWorkshop')"
              :edit-label="t('workshops.actions.editWorkshop')"
              :delete-label="t('workshops.actions.deleteWorkshop')"
              @delete="askDelete(row)"
            />
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('workshops.list.emptyTitle')"
          :description="t('workshops.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateWorkshop"
            :to="{ name: 'operations-workshops-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('workshops.actions.newWorkshop')"
            :aria-label="t('workshops.actions.newWorkshop')"
          />
        </AppEmptyState>

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('workshops.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('workshops.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('workshops.pagination.previousPage')"
          :next-label="t('workshops.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />
      </template>
    </AppPage>

    <DataImportModal
      v-model="importModalOpen"
      :title="t('workshops.import.title')"
      :import-action="importWorkshops"
      :summary-fields="importSummaryFields"
      :accept="importAccept"
      :file-label="t('workshops.import.fileLabel')"
      :file-hint="t('workshops.import.fileHint')"
      :import-label="t('workshops.actions.import')"
      :importing-label="t('workshops.actions.importing')"
      :done-label="t('common.actions.done')"
      :select-file-message="t('workshops.import.selectFile')"
      :waiting-message="t('workshops.import.waiting')"
      :error-fallback="t('workshops.errors.import')"
      :errors-title="t('workshops.import.errorsTitle')"
      :row-label="t('workshops.import.rowNumber', { row: '{row}' })"
      :no-row-errors-label="t('workshops.import.noRowErrors')"
      @imported="refreshAfterImport"
      @processing="setImporting"
    />

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('workshops.delete.title')"
      :delete-label="t('workshops.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteWorkshop"
    />
  </LayoutAuthenticated>
</template>

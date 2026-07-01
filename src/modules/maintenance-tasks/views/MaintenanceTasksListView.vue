<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiPlus,
  mdiWrenchOutline,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { MAINTENANCE_TASK_STATUS } from '@/types/maintenanceTask.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import { getPositiveNumberQuery } from '@/modules/shared/utils/queryParams.js'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'
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
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import MaintenanceTaskFilters from '@/modules/maintenance-tasks/components/MaintenanceTaskFilters.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { locale, t } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  code: '',
  vehicle_system_id: '',
  status: '',
  name: '',
  is_active: '',
  estimated_duration_from: '',
  estimated_duration_to: '',
  vehicle_id: '',
  without_vehicle: false,
  created_from: '',
  created_to: '',
})

const columns = computed(() => [
  { key: 'task', label: t('maintenanceTasks.columns.task') },
  { key: 'vehicle_system', label: t('maintenanceTasks.columns.system') },
  { key: 'vehicle', label: t('maintenanceTasks.columns.vehicle') },
  { key: 'estimated_duration_minutes', label: t('maintenanceTasks.columns.duration') },
  { key: 'status', label: t('maintenanceTasks.columns.status') },
  { key: 'is_active', label: t('maintenanceTasks.columns.active') },
  { key: 'updated_at', label: t('maintenanceTasks.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const statusOptions = Object.values(MAINTENANCE_TASK_STATUS)
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const vehicleSystems = ref([])
const deleting = ref(false)
const systemsError = ref('')
const deleteModalOpen = ref(false)
const taskToDelete = ref(null)
const filtersExpanded = ref(false)

const currentApiFilters = (nextFilters) => {
  const apiFilters = {}
  const vehicleSystemId = getPositiveNumberQuery(nextFilters.vehicle_system_id)
  const vehicleId = getPositiveNumberQuery(nextFilters.vehicle_id)
  const durationFrom = getPositiveNumberQuery(nextFilters.estimated_duration_from)
  const durationTo = getPositiveNumberQuery(nextFilters.estimated_duration_to)

  if (nextFilters.code) {
    apiFilters.code = nextFilters.code
  }

  if (nextFilters.name) {
    apiFilters.name = nextFilters.name
  }

  if (vehicleSystemId !== null) {
    apiFilters.vehicle_system_id = vehicleSystemId
  }

  if (statusOptions.includes(nextFilters.status)) {
    apiFilters.status = nextFilters.status
  }

  if (nextFilters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (nextFilters.is_active === 'false') {
    apiFilters.is_active = false
  }

  if (durationFrom !== null) {
    apiFilters.estimated_duration_from = durationFrom
  }

  if (durationTo !== null) {
    apiFilters.estimated_duration_to = durationTo
  }

  if (nextFilters.without_vehicle) {
    apiFilters.without_vehicle = true
  } else if (vehicleId !== null) {
    apiFilters.vehicle_id = vehicleId
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
  if (nextFilters.without_vehicle) {
    nextFilters.vehicle_id = ''
  }

  if (!statusOptions.includes(nextFilters.status)) {
    nextFilters.status = ''
  }

  if (!['', 'true', 'false'].includes(nextFilters.is_active)) {
    nextFilters.is_active = ''
  }
}

const {
  items: tasks,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchTasks,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'maintenance-tasks',
  emptyFilters: EMPTY_FILTERS,
  fetcher: maintenanceTasksApi.index,
  toApiFilters: currentApiFilters,
  sanitizeFilters,
})

const canCreateTask = computed(() =>
  canCreateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const canUpdateTask = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const canDeleteTask = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const deleteMessage = computed(() => {
  if (!taskToDelete.value) {
    return ''
  }

  return t('maintenanceTasks.delete.confirmMessage', { name: taskToDelete.value.name })
})

const fetchVehicleSystems = async () => {
  systemsError.value = ''

  try {
    const data = await vehicleSystemsApi.index({
      page: 1,
      per_page: 100,
    })

    vehicleSystems.value = data.items
  } catch (error) {
    systemsError.value = normalizeApiError(error).message
  }
}

const setFilter = (key, value) => {
  filters[key] = value
}

const handleWithoutVehicleChange = () => {
  if (filters.without_vehicle) {
    filters.vehicle_id = ''
  }
}

const askDelete = (task) => {
  taskToDelete.value = task
  deleteModalOpen.value = true
}

const deleteTask = async () => {
  if (!taskToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await maintenanceTasksApi.remove(taskToDelete.value.id)
    deleteModalOpen.value = false
    taskToDelete.value = null
    await fetchTasks()

    if (tasks.value.length === 0 && pagination.value.current_page > 1) {
      updatePage(pagination.value.current_page - 1)
    }
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const statusColor = (status) => {
  const colors = {
    [MAINTENANCE_TASK_STATUS.CREATED]: 'neutral',
    [MAINTENANCE_TASK_STATUS.SCHEDULED]: 'info',
    [MAINTENANCE_TASK_STATUS.STARTED]: 'warning',
    [MAINTENANCE_TASK_STATUS.CANCELLED]: 'danger',
    [MAINTENANCE_TASK_STATUS.COMPLETED]: 'success',
    [MAINTENANCE_TASK_STATUS.REJECTED]: 'danger',
  }

  return colors[status] ?? 'neutral'
}

const durationLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('maintenanceTasks.units.minutes', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const vehicleLabel = (vehicle) => {
  if (!vehicle) {
    return t('maintenanceTasks.labels.reusable')
  }

  return [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
}

const statusLabel = (status) => t(`maintenanceTasks.status.${status}`)
const activeLabel = (isActive) =>
  isActive ? t('maintenanceTasks.labels.active') : t('maintenanceTasks.labels.inactive')

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

void fetchVehicleSystems()
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('maintenanceTasks.list.title')"
      :subtitle="t('maintenanceTasks.list.subtitle')"
      :eyebrow="t('maintenanceTasks.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateTask"
          :to="{ name: 'maintenance-tasks-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('maintenanceTasks.actions.newTask')"
          :aria-label="t('maintenanceTasks.actions.newTask')"
        />
      </template>

      <MaintenanceTaskFilters
        :filters="filters"
        :expanded="filtersExpanded"
        :has-active-filters="hasActiveFilters"
        :input-class="inputClass"
        :status-options="statusOptions"
        :vehicle-systems="vehicleSystems"
        :systems-error="systemsError"
        @apply="applyFilters"
        @clear="clearFilters"
        @focusout="applyFiltersOnFocusOut"
        @toggle-expanded="filtersExpanded = !filtersExpanded"
        @update-filter="setFilter"
        @without-vehicle-change="handleWithoutVehicleChange"
      />

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('maintenanceTasks.list.loading')"
        :retry-label="t('maintenanceTasks.actions.retry')"
        @retry="fetchTasks"
      />

      <template v-if="!loading && !errorMessage">
        <AppDataTable
          v-if="tasks.length"
          :columns="columns"
          :rows="tasks"
          :empty-title="t('maintenanceTasks.list.emptyTitle')"
          :empty-description="t('maintenanceTasks.list.emptyDescription')"
        >
          <template #cell-task="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ row.name }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ row.code }}
              </p>
            </div>
          </template>
          <template #cell-vehicle_system="{ row }">
            {{ row.vehicle_system?.name ?? '-' }}
          </template>
          <template #cell-vehicle="{ row }">
            {{ vehicleLabel(row.vehicle) }}
          </template>
          <template #cell-estimated_duration_minutes="{ value }">
            {{ durationLabel(value) }}
          </template>
          <template #cell-status="{ value }">
            <AppBadge
              :label="statusLabel(value)"
              :color="statusColor(value)"
            />
          </template>
          <template #cell-is_active="{ value }">
            <AppBadge
              :label="activeLabel(value)"
              :color="value ? 'success' : 'danger'"
            />
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <ResourceRowActions
              :detail-to="{ name: 'maintenance-tasks-detail', params: { id: row.id } }"
              :edit-to="{ name: 'maintenance-tasks-edit', params: { id: row.id } }"
              :can-update="canUpdateTask"
              :can-delete="canDeleteTask"
              :open-label="t('maintenanceTasks.actions.openTask')"
              :edit-label="t('maintenanceTasks.actions.editTask')"
              :delete-label="t('maintenanceTasks.actions.deleteTask')"
              @delete="askDelete(row)"
            />
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('maintenanceTasks.list.emptyTitle')"
          :description="t('maintenanceTasks.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateTask"
            :to="{ name: 'maintenance-tasks-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('maintenanceTasks.actions.newTask')"
            :aria-label="t('maintenanceTasks.actions.newTask')"
          />
        </AppEmptyState>

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('maintenanceTasks.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('maintenanceTasks.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('maintenanceTasks.pagination.previousPage')"
          :next-label="t('maintenanceTasks.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />
      </template>
    </AppPage>

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('maintenanceTasks.delete.title')"
      :delete-label="t('maintenanceTasks.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteTask"
    />
  </LayoutAuthenticated>
</template>

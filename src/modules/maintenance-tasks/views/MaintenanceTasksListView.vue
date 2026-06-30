<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiCheck,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClose,
  mdiEyeOutline,
  mdiPencil,
  mdiPlus,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { DEFAULT_PAGINATION_META } from '@/types/api.js'
import { MAINTENANCE_TASK_STATUS } from '@/types/maintenanceTask.js'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import VehicleCombobox from '@/modules/vehicles/components/VehicleCombobox.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
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

const tasks = ref([])
const vehicleSystems = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const systemsError = ref('')
const deleteModalOpen = ref(false)
const taskToDelete = ref(null)
const filtersExpanded = ref(false)
const filters = reactive({ ...EMPTY_FILTERS })

const canCreateTask = computed(() =>
  canCreateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const canUpdateTask = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const canDeleteTask = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const hasActiveFilters = computed(() =>
  Object.values(filters).some((value) => value !== '' && value !== false),
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
)
const deleteMessage = computed(() => {
  if (!taskToDelete.value) {
    return ''
  }

  return t('maintenanceTasks.delete.confirmMessage', { name: taskToDelete.value.name })
})
const advancedFiltersLabel = computed(() =>
  filtersExpanded.value
    ? t('maintenanceTasks.actions.hideAdvancedFilters')
    : t('maintenanceTasks.actions.showAdvancedFilters'),
)

const getStringQuery = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return typeof value === 'string' ? value : ''
}

const getNumberQuery = (value, fallback) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : fallback
}

const getPositiveNumberQuery = (value) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : null
}

const getBooleanQuery = (value) => {
  const stringValue = getStringQuery(value)

  return stringValue === 'true' || stringValue === '1'
}

const buildQuery = (nextFilters, page, perPage) => {
  const query = {}

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (key === 'without_vehicle') {
      if (value === true) {
        query.without_vehicle = 'true'
      }

      return
    }

    if (value !== '') {
      query[key] = String(value)
    }
  })

  if (page > 1) {
    query.page = String(page)
  }

  if (perPage !== DEFAULT_PAGINATION_META.per_page) {
    query.per_page = String(perPage)
  }

  return query
}

const syncFiltersFromQuery = () => {
  filters.search = getStringQuery(route.query.search)
  filters.code = getStringQuery(route.query.code)
  filters.vehicle_system_id = getStringQuery(route.query.vehicle_system_id)
  filters.status = getStringQuery(route.query.status)
  filters.name = getStringQuery(route.query.name)
  filters.is_active = getStringQuery(route.query.is_active)
  filters.estimated_duration_from = getStringQuery(route.query.estimated_duration_from)
  filters.estimated_duration_to = getStringQuery(route.query.estimated_duration_to)
  filters.vehicle_id = getStringQuery(route.query.vehicle_id)
  filters.without_vehicle = getBooleanQuery(route.query.without_vehicle)
  filters.created_from = getStringQuery(route.query.created_from)
  filters.created_to = getStringQuery(route.query.created_to)

  if (filters.without_vehicle) {
    filters.vehicle_id = ''
  }
}

const currentApiFilters = () => {
  const apiFilters = {}
  const vehicleSystemId = getPositiveNumberQuery(filters.vehicle_system_id)
  const vehicleId = getPositiveNumberQuery(filters.vehicle_id)
  const durationFrom = getPositiveNumberQuery(filters.estimated_duration_from)
  const durationTo = getPositiveNumberQuery(filters.estimated_duration_to)

  if (filters.code) {
    apiFilters.code = filters.code
  }

  if (filters.name) {
    apiFilters.name = filters.name
  }

  if (vehicleSystemId !== null) {
    apiFilters.vehicle_system_id = vehicleSystemId
  }

  if (statusOptions.includes(filters.status)) {
    apiFilters.status = filters.status
  }

  if (filters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (filters.is_active === 'false') {
    apiFilters.is_active = false
  }

  if (durationFrom !== null) {
    apiFilters.estimated_duration_from = durationFrom
  }

  if (durationTo !== null) {
    apiFilters.estimated_duration_to = durationTo
  }

  if (filters.without_vehicle) {
    apiFilters.without_vehicle = true
  } else if (vehicleId !== null) {
    apiFilters.vehicle_id = vehicleId
  }

  if (filters.created_from) {
    apiFilters.created_from = filters.created_from
  }

  if (filters.created_to) {
    apiFilters.created_to = filters.created_to
  }

  return apiFilters
}

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

const fetchTasks = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await maintenanceTasksApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    tasks.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void router.push({
    name: 'maintenance-tasks',
    query: buildQuery(filters, 1, pagination.value.per_page),
  })
}

const applyFiltersOnFocusOut = (event) => {
  const currentTarget = event.currentTarget
  const relatedTarget = event.relatedTarget

  if (
    currentTarget instanceof HTMLElement &&
    relatedTarget instanceof Node &&
    currentTarget.contains(relatedTarget)
  ) {
    return
  }

  window.setTimeout(() => {
    applyFilters()
  })
}

const clearFilters = () => {
  Object.assign(filters, EMPTY_FILTERS)
  applyFilters()
}

const handleWithoutVehicleChange = () => {
  if (filters.without_vehicle) {
    filters.vehicle_id = ''
  }
}

const updatePage = (page) => {
  void router.push({
    name: 'maintenance-tasks',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'maintenance-tasks',
    query: buildQuery(filters, 1, perPage),
  })
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

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
    void fetchTasks()
  },
  { immediate: true },
)
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

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField :label="t('maintenanceTasks.filters.search')">
            <FormControl
              v-model="filters.search"
              name="search"
              :placeholder="t('maintenanceTasks.filters.searchPlaceholder')"
            />
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.code')">
            <FormControl
              v-model="filters.code"
              name="code"
              :placeholder="t('maintenanceTasks.filters.codePlaceholder')"
            />
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.vehicleSystem')">
            <select
              v-model="filters.vehicle_system_id"
              name="vehicle_system_id"
              :class="inputClass"
            >
              <option value="">{{ t('maintenanceTasks.filters.allSystems') }}</option>
              <option v-for="system in vehicleSystems" :key="system.id" :value="String(system.id)">
                {{ system.name }}
              </option>
            </select>
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('maintenanceTasks.filters.name')">
            <FormControl v-model="filters.name" name="name" />
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.status')">
            <select v-model="filters.status" name="status" :class="inputClass">
              <option value="">{{ t('maintenanceTasks.filters.allStatuses') }}</option>
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ statusLabel(status) }}
              </option>
            </select>
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.active')">
            <select v-model="filters.is_active" name="is_active" :class="inputClass">
              <option value="">{{ t('maintenanceTasks.filters.all') }}</option>
              <option value="true">{{ t('maintenanceTasks.labels.active') }}</option>
              <option value="false">{{ t('maintenanceTasks.labels.inactive') }}</option>
            </select>
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.durationFrom')">
            <input
              v-model="filters.estimated_duration_from"
              type="number"
              min="1"
              inputmode="numeric"
              :placeholder="t('maintenanceTasks.filters.minutesPlaceholder')"
              :class="inputClass"
            >
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.durationTo')">
            <input
              v-model="filters.estimated_duration_to"
              type="number"
              min="1"
              inputmode="numeric"
              :placeholder="t('maintenanceTasks.filters.minutesPlaceholder')"
              :class="inputClass"
            >
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.vehicle')">
            <VehicleCombobox
              v-model="filters.vehicle_id"
              name="vehicle_id"
              :placeholder="t('maintenanceTasks.filters.vehiclePlaceholder')"
              :disabled="filters.without_vehicle"
            />
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.createdFrom')">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField :label="t('maintenanceTasks.filters.createdTo')">
            <FormControl v-model="filters.created_to" name="created_to" type="date" />
          </FormField>
          <label class="flex min-h-12 items-center gap-2 font-semibold">
            <input
              v-model="filters.without_vehicle"
              type="checkbox"
              name="without_vehicle"
              @change="handleWithoutVehicleChange"
            >
            {{ t('maintenanceTasks.filters.reusableTasksOnly') }}
          </label>
        </div>

        <p v-if="systemsError" class="mt-2 text-sm text-red-600 dark:text-red-400">
          {{ systemsError }}
        </p>

        <div class="mt-2 flex flex-wrap justify-end gap-2">
          <BaseButton
            color="whiteDark"
            :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown"
            :title="advancedFiltersLabel"
            :aria-label="advancedFiltersLabel"
            @click="filtersExpanded = !filtersExpanded"
          />
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            :title="t('maintenanceTasks.actions.clearFilters')"
            :aria-label="t('maintenanceTasks.actions.clearFilters')"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            :title="t('maintenanceTasks.actions.applyFilters')"
            :aria-label="t('maintenanceTasks.actions.applyFilters')"
            type="submit"
          />
        </div>
      </CardBox>

      <NotificationBar v-if="errorMessage" color="danger" :icon="mdiRefresh">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('maintenanceTasks.actions.retry')"
            :aria-label="t('maintenanceTasks.actions.retry')"
            small
            @click="fetchTasks"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('maintenanceTasks.list.loading') }}
        </p>
      </CardBox>

      <template v-else-if="!errorMessage">
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
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                :to="{ name: 'maintenance-tasks-detail', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiEyeOutline"
                :title="t('maintenanceTasks.actions.openTask')"
                :aria-label="t('maintenanceTasks.actions.openTask')"
                small
              />
              <BaseButton
                v-if="canUpdateTask"
                :to="{ name: 'maintenance-tasks-edit', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiPencil"
                :title="t('maintenanceTasks.actions.editTask')"
                :aria-label="t('maintenanceTasks.actions.editTask')"
                small
              />
              <BaseButton
                v-if="canDeleteTask"
                color="danger"
                :icon="mdiTrashCanOutline"
                :title="t('maintenanceTasks.actions.deleteTask')"
                :aria-label="t('maintenanceTasks.actions.deleteTask')"
                small
                @click="askDelete(row)"
              />
            </BaseButtons>
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

        <CardBox v-if="pagination.total > 0" class="mt-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-gray-500 dark:text-slate-400">
              {{ t('maintenanceTasks.pagination.showing', {
                from: pagination.from ?? 0,
                to: pagination.to ?? 0,
                total: pagination.total,
              }) }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <select
                :value="pagination.per_page"
                :class="inputClass"
                class="max-w-28"
                @change="updatePerPage"
              >
                <option v-for="option in perPageOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronLeft"
                :title="t('maintenanceTasks.pagination.previousPage')"
                :aria-label="t('maintenanceTasks.pagination.previousPage')"
                small
                :disabled="!canGoPrevious"
                @click="canGoPrevious ? updatePage(pagination.current_page - 1) : null"
              />
              <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                {{ t('maintenanceTasks.pagination.pageOf', {
                  page: pagination.current_page,
                  pages: pagination.last_page,
                }) }}
              </span>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronRight"
                :title="t('maintenanceTasks.pagination.nextPage')"
                :aria-label="t('maintenanceTasks.pagination.nextPage')"
                small
                :disabled="!canGoNext"
                @click="canGoNext ? updatePage(pagination.current_page + 1) : null"
              />
            </div>
          </div>
        </CardBox>
      </template>
    </AppPage>

    <CardBoxModal
      v-model="deleteModalOpen"
      :title="t('maintenanceTasks.delete.title')"
      button="danger"
      :button-label="t('maintenanceTasks.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteTask"
    >
      <p>{{ deleteMessage }}</p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

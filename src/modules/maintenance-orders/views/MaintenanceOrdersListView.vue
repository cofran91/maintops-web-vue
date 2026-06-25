<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiCancel,
  mdiCheck,
  mdiCheckCircleOutline,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClose,
  mdiEyeOutline,
  mdiPlus,
  mdiRefresh,
  mdiTruckDeliveryOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canCreateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { DEFAULT_PAGINATION_META } from '@/types/api.js'
import { ROLES } from '@/types/auth.js'
import { MAINTENANCE_ORDER_STATUSES } from '@/types/maintenanceOrder.js'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService.js'
import { useOperationalEventListener } from '@/modules/realtime/composables/useOperationalEventListener.js'
import {
  ORDER_ACTION_LABELS,
  ORDER_STATUS_LABELS,
  orderStatusActions,
  orderStatusColor,
} from '@/modules/maintenance-orders/statusRules.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import OwnerCombobox from '@/modules/owners/components/OwnerCombobox.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'
import VehicleCombobox from '@/modules/vehicles/components/VehicleCombobox.vue'
import WorkshopCombobox from '@/modules/users/components/WorkshopCombobox.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  status: '',
  vehicle_id: '',
  owner_id: '',
  advisor_id: '',
  workshop_id: '',
  without_workshop: false,
  technician_id: '',
  without_technician: false,
  scheduled_from: '',
  scheduled_to: '',
  started_from: '',
  started_to: '',
  finished_from: '',
  finished_to: '',
  delivered_from: '',
  delivered_to: '',
  cancelled_from: '',
  cancelled_to: '',
  created_from: '',
  created_to: '',
})

const columns = [
  { key: 'order', label: 'Order' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'owner', label: 'Owner' },
  { key: 'advisor', label: 'Advisor' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'technician', label: 'Technician' },
  { key: 'status', label: 'Status' },
  { key: 'items', label: 'Items' },
  { key: 'updated_at', label: 'Updated' },
  { key: 'actions', label: '' },
]

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const orders = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const updatingStatus = ref(false)
const errorMessage = ref('')
const filtersExpanded = ref(false)
const filters = reactive({ ...EMPTY_FILTERS })
let realtimeRefreshTimer = null

const canCreateOrder = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.ORDERS))
const hasActiveFilters = computed(() =>
  Object.values(filters).some((value) => value !== '' && value !== false),
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
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

const getBooleanQuery = (value) => {
  const stringValue = getStringQuery(value)

  return stringValue === 'true' || stringValue === '1'
}

const getNumberQuery = (value, fallback) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : fallback
}

const getPositiveNumberQuery = (value) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : null
}

const buildQuery = (nextFilters, page, perPage) => {
  const query = {}

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        query[key] = 'true'
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
  Object.keys(EMPTY_FILTERS).forEach((key) => {
    filters[key] =
      typeof EMPTY_FILTERS[key] === 'boolean'
        ? getBooleanQuery(route.query[key])
        : getStringQuery(route.query[key])
  })

  if (filters.without_workshop) {
    filters.workshop_id = ''
  }

  if (filters.without_technician) {
    filters.technician_id = ''
  }
}

const currentApiFilters = () => {
  const apiFilters = {}
  const integerFilters = [
    'vehicle_id',
    'owner_id',
    'advisor_id',
    'workshop_id',
    'technician_id',
  ]
  const dateFilters = [
    'scheduled_from',
    'scheduled_to',
    'started_from',
    'started_to',
    'finished_from',
    'finished_to',
    'delivered_from',
    'delivered_to',
    'cancelled_from',
    'cancelled_to',
    'created_from',
    'created_to',
  ]

  integerFilters.forEach((key) => {
    const value = getPositiveNumberQuery(filters[key])

    if (value !== null) {
      apiFilters[key] = value
    }
  })

  dateFilters.forEach((key) => {
    if (filters[key]) {
      apiFilters[key] = filters[key]
    }
  })

  if (MAINTENANCE_ORDER_STATUSES.includes(filters.status)) {
    apiFilters.status = filters.status
  }

  if (filters.without_workshop) {
    apiFilters.without_workshop = true
    delete apiFilters.workshop_id
  }

  if (filters.without_technician) {
    apiFilters.without_technician = true
    delete apiFilters.technician_id
  }

  return apiFilters
}

const fetchOrders = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await maintenanceOrdersApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    orders.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const scheduleRealtimeRefresh = () => {
  if (realtimeRefreshTimer !== null) {
    clearTimeout(realtimeRefreshTimer)
  }

  realtimeRefreshTimer = setTimeout(() => {
    realtimeRefreshTimer = null
    void fetchOrders()
  }, 200)
}

const applyFilters = () => {
  void router.push({
    name: 'orders',
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

const handleWithoutWorkshopChange = () => {
  if (filters.without_workshop) {
    filters.workshop_id = ''
  }
}

const handleWithoutTechnicianChange = () => {
  if (filters.without_technician) {
    filters.technician_id = ''
  }
}

const updatePage = (page) => {
  void router.push({
    name: 'orders',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'orders',
    query: buildQuery(filters, 1, perPage),
  })
}

const updateOrderStatus = async (order, status) => {
  updatingStatus.value = true
  errorMessage.value = ''

  try {
    const updatedOrder = await maintenanceOrdersApi.update(order.id, { status })

    orders.value = orders.value.map((currentOrder) =>
      currentOrder.id === updatedOrder.id ? updatedOrder : currentOrder,
    )
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    updatingStatus.value = false
  }
}

const availableOrderActions = (order) =>
  orderStatusActions(order, authStore.roles, authStore.user)

const actionIcon = (status) => {
  if (status === 'approved') {
    return mdiCheckCircleOutline
  }

  if (status === 'delivered') {
    return mdiTruckDeliveryOutline
  }

  return status === 'cancelled' ? mdiCancel : mdiClose
}
const actionColor = (status) =>
  status === 'approved' || status === 'delivered' ? 'success' : 'danger'

const orderNumber = (order) => `#${String(order.id).padStart(5, '0')}`
const vehicleLabel = (order) =>
  [order.vehicle?.license_plate, order.vehicle?.brand, order.vehicle?.model]
    .filter(Boolean)
    .join(' ') || `Vehicle #${order.vehicle_id}`
const userLabel = (user) => user?.name ?? '-'
const workshopLabel = (workshop) =>
  workshop ? [workshop.code, workshop.name].filter(Boolean).join(' - ') : 'Unassigned'
const itemCountLabel = (items = []) => `${items.length} ${items.length === 1 ? 'item' : 'items'}`

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
    void fetchOrders()
  },
  { immediate: true },
)

useOperationalEventListener(() => {
  scheduleRealtimeRefresh()
})

onBeforeUnmount(() => {
  if (realtimeRefreshTimer !== null) {
    clearTimeout(realtimeRefreshTimer)
    realtimeRefreshTimer = null
  }
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      title="Orders"
      subtitle="Coordinate visible maintenance orders and role-safe status actions."
      eyebrow="Orders"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateOrder"
          :to="{ name: 'orders-new' }"
          color="info"
          :icon="mdiPlus"
          title="New order"
          aria-label="New order"
        />
      </template>

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField label="Search">
            <FormControl
              v-model="filters.search"
              name="search"
              placeholder="Plate, owner, advisor, workshop, or technician"
            />
          </FormField>
          <FormField label="Status">
            <select v-model="filters.status" name="status" :class="inputClass">
              <option value="">All statuses</option>
              <option v-for="status in MAINTENANCE_ORDER_STATUSES" :key="status" :value="status">
                {{ ORDER_STATUS_LABELS[status] }}
              </option>
            </select>
          </FormField>
          <FormField label="Vehicle">
            <VehicleCombobox
              v-model="filters.vehicle_id"
              name="vehicle_id"
              placeholder="Search by plate, brand, or model"
            />
          </FormField>
          <FormField label="Advisor">
            <UserCombobox
              v-model="filters.advisor_id"
              name="advisor_id"
              placeholder="Search advisors"
              :role="ROLES.ADVISOR"
            />
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField label="Owner">
            <OwnerCombobox
              v-model="filters.owner_id"
              name="owner_id"
              placeholder="Search owners"
            />
          </FormField>
          <FormField label="Workshop">
            <WorkshopCombobox
              v-model="filters.workshop_id"
              name="workshop_id"
              placeholder="Search workshops"
              :disabled="filters.without_workshop"
            />
          </FormField>
          <FormField label="Technician">
            <UserCombobox
              v-model="filters.technician_id"
              name="technician_id"
              placeholder="Search technicians"
              :role="ROLES.TECHNICIAN"
              :disabled="filters.without_technician"
            />
          </FormField>
          <label class="flex min-h-12 items-center gap-2 font-semibold">
            <input
              v-model="filters.without_workshop"
              type="checkbox"
              name="without_workshop"
              @change="handleWithoutWorkshopChange"
            >
            Without workshop
          </label>
          <label class="flex min-h-12 items-center gap-2 font-semibold">
            <input
              v-model="filters.without_technician"
              type="checkbox"
              name="without_technician"
              @change="handleWithoutTechnicianChange"
            >
            Without technician
          </label>
          <FormField label="Scheduled from">
            <FormControl v-model="filters.scheduled_from" name="scheduled_from" type="date" />
          </FormField>
          <FormField label="Scheduled to">
            <FormControl v-model="filters.scheduled_to" name="scheduled_to" type="date" />
          </FormField>
          <FormField label="Started from">
            <FormControl v-model="filters.started_from" name="started_from" type="date" />
          </FormField>
          <FormField label="Started to">
            <FormControl v-model="filters.started_to" name="started_to" type="date" />
          </FormField>
          <FormField label="Finished from">
            <FormControl v-model="filters.finished_from" name="finished_from" type="date" />
          </FormField>
          <FormField label="Finished to">
            <FormControl v-model="filters.finished_to" name="finished_to" type="date" />
          </FormField>
          <FormField label="Delivered from">
            <FormControl v-model="filters.delivered_from" name="delivered_from" type="date" />
          </FormField>
          <FormField label="Delivered to">
            <FormControl v-model="filters.delivered_to" name="delivered_to" type="date" />
          </FormField>
          <FormField label="Cancelled from">
            <FormControl v-model="filters.cancelled_from" name="cancelled_from" type="date" />
          </FormField>
          <FormField label="Cancelled to">
            <FormControl v-model="filters.cancelled_to" name="cancelled_to" type="date" />
          </FormField>
          <FormField label="Created from">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField label="Created to">
            <FormControl v-model="filters.created_to" name="created_to" type="date" />
          </FormField>
        </div>

        <div class="mt-2 flex flex-wrap justify-end gap-2">
          <BaseButton
            color="whiteDark"
            :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown"
            :title="filtersExpanded ? 'Hide advanced filters' : 'Show advanced filters'"
            :aria-label="filtersExpanded ? 'Hide advanced filters' : 'Show advanced filters'"
            @click="filtersExpanded = !filtersExpanded"
          />
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            title="Clear filters"
            aria-label="Clear filters"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            title="Apply filters"
            aria-label="Apply filters"
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
            title="Retry"
            aria-label="Retry"
            small
            @click="fetchOrders"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading orders...</p>
      </CardBox>

      <template v-else-if="!errorMessage">
        <AppDataTable
          v-if="orders.length"
          :columns="columns"
          :rows="orders"
          empty-title="No orders found"
          empty-description="Adjust the filters or create a new order."
        >
          <template #cell-order="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ orderNumber(row) }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ formatDate(row.created_at) }}
              </p>
            </div>
          </template>
          <template #cell-vehicle="{ row }">
            {{ vehicleLabel(row) }}
          </template>
          <template #cell-owner="{ row }">
            {{ userLabel(row.owner) }}
          </template>
          <template #cell-advisor="{ row }">
            {{ userLabel(row.advisor) }}
          </template>
          <template #cell-workshop="{ row }">
            {{ workshopLabel(row.workshop) }}
          </template>
          <template #cell-technician="{ row }">
            {{ userLabel(row.technician) }}
          </template>
          <template #cell-status="{ value }">
            <AppBadge
              :label="ORDER_STATUS_LABELS[value] ?? value"
              :color="orderStatusColor(value)"
            />
          </template>
          <template #cell-items="{ row }">
            {{ itemCountLabel(row.items) }}
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                :to="{ name: 'orders-detail', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiEyeOutline"
                title="Open order"
                aria-label="Open order"
                small
              />
              <BaseButton
                v-for="status in availableOrderActions(row)"
                :key="status"
                :color="actionColor(status)"
                :icon="actionIcon(status)"
                :title="ORDER_ACTION_LABELS[status]"
                :aria-label="ORDER_ACTION_LABELS[status]"
                :disabled="updatingStatus"
                small
                @click="updateOrderStatus(row, status)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          title="No orders found"
          description="Adjust the filters or create a new order."
        >
          <BaseButton
            v-if="canCreateOrder"
            :to="{ name: 'orders-new' }"
            color="info"
            :icon="mdiPlus"
            title="New order"
            aria-label="New order"
          />
        </AppEmptyState>

        <CardBox v-if="pagination.total > 0" class="mt-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-gray-500 dark:text-slate-400">
              Showing {{ pagination.from ?? 0 }}-{{ pagination.to ?? 0 }} of {{ pagination.total }}
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
                title="Previous page"
                aria-label="Previous page"
                small
                :disabled="!canGoPrevious"
                @click="canGoPrevious ? updatePage(pagination.current_page - 1) : null"
              />
              <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                Page {{ pagination.current_page }} of {{ pagination.last_page }}
              </span>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronRight"
                title="Next page"
                aria-label="Next page"
                small
                :disabled="!canGoNext"
                @click="canGoNext ? updatePage(pagination.current_page + 1) : null"
              />
            </div>
          </div>
        </CardBox>
      </template>
    </AppPage>
  </LayoutAuthenticated>
</template>

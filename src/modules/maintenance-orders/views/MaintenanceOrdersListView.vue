<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
const { locale, t } = useI18n()

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

const columns = computed(() => [
  { key: 'order', label: t('orders.columns.order') },
  { key: 'vehicle', label: t('orders.columns.vehicle') },
  { key: 'owner', label: t('orders.columns.owner') },
  { key: 'advisor', label: t('orders.columns.advisor') },
  { key: 'workshop', label: t('orders.columns.workshop') },
  { key: 'technician', label: t('orders.columns.technician') },
  { key: 'status', label: t('orders.columns.status') },
  { key: 'items', label: t('orders.columns.items') },
  { key: 'updated_at', label: t('orders.columns.updated') },
  { key: 'actions', label: '' },
])

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
const advancedFiltersLabel = computed(() =>
  filtersExpanded.value
    ? t('orders.actions.hideAdvancedFilters')
    : t('orders.actions.showAdvancedFilters'),
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

const orderNumber = (order) => t('orders.labels.orderNumber', {
  id: String(order.id).padStart(5, '0'),
})
const vehicleLabel = (order) =>
  [order.vehicle?.license_plate, order.vehicle?.brand, order.vehicle?.model]
    .filter(Boolean)
    .join(' ') || t('orders.labels.vehicleNumber', { id: order.vehicle_id })
const userLabel = (user) => user?.name ?? '-'
const workshopLabel = (workshop) =>
  workshop
    ? [workshop.code, workshop.name].filter(Boolean).join(' - ')
    : t('orders.labels.unassigned')
const itemCountLabel = (items = []) =>
  items.length === 1
    ? t('orders.labels.itemCountOne', { count: items.length })
    : t('orders.labels.itemCountMany', { count: items.length })
const orderStatusLabel = (status) => t(`orders.status.${status}`)
const orderActionLabel = (status) => t(`orders.orderActions.${status}`)

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
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
      :title="t('orders.list.title')"
      :subtitle="t('orders.list.subtitle')"
      :eyebrow="t('orders.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateOrder"
          :to="{ name: 'orders-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('orders.actions.newOrder')"
          :aria-label="t('orders.actions.newOrder')"
        />
      </template>

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('orders.filters.search')">
            <FormControl
              v-model="filters.search"
              name="search"
              :placeholder="t('orders.filters.searchPlaceholder')"
            />
          </FormField>
          <FormField :label="t('orders.filters.status')">
            <select v-model="filters.status" name="status" :class="inputClass">
              <option value="">{{ t('orders.filters.allStatuses') }}</option>
              <option v-for="status in MAINTENANCE_ORDER_STATUSES" :key="status" :value="status">
                {{ orderStatusLabel(status) }}
              </option>
            </select>
          </FormField>
          <FormField :label="t('orders.filters.vehicle')">
            <VehicleCombobox
              v-model="filters.vehicle_id"
              name="vehicle_id"
              :placeholder="t('orders.filters.vehiclePlaceholder')"
            />
          </FormField>
          <FormField :label="t('orders.filters.advisor')">
            <UserCombobox
              v-model="filters.advisor_id"
              name="advisor_id"
              :placeholder="t('orders.filters.advisorPlaceholder')"
              :role="ROLES.ADVISOR"
            />
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('orders.filters.owner')">
            <OwnerCombobox
              v-model="filters.owner_id"
              name="owner_id"
              :placeholder="t('orders.filters.ownerPlaceholder')"
            />
          </FormField>
          <FormField :label="t('orders.filters.workshop')">
            <WorkshopCombobox
              v-model="filters.workshop_id"
              name="workshop_id"
              :placeholder="t('orders.filters.workshopPlaceholder')"
              :disabled="filters.without_workshop"
            />
          </FormField>
          <FormField :label="t('orders.filters.technician')">
            <UserCombobox
              v-model="filters.technician_id"
              name="technician_id"
              :placeholder="t('orders.filters.technicianPlaceholder')"
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
            {{ t('orders.filters.withoutWorkshop') }}
          </label>
          <label class="flex min-h-12 items-center gap-2 font-semibold">
            <input
              v-model="filters.without_technician"
              type="checkbox"
              name="without_technician"
              @change="handleWithoutTechnicianChange"
            >
            {{ t('orders.filters.withoutTechnician') }}
          </label>
          <FormField :label="t('orders.filters.scheduledFrom')">
            <FormControl v-model="filters.scheduled_from" name="scheduled_from" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.scheduledTo')">
            <FormControl v-model="filters.scheduled_to" name="scheduled_to" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.startedFrom')">
            <FormControl v-model="filters.started_from" name="started_from" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.startedTo')">
            <FormControl v-model="filters.started_to" name="started_to" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.finishedFrom')">
            <FormControl v-model="filters.finished_from" name="finished_from" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.finishedTo')">
            <FormControl v-model="filters.finished_to" name="finished_to" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.deliveredFrom')">
            <FormControl v-model="filters.delivered_from" name="delivered_from" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.deliveredTo')">
            <FormControl v-model="filters.delivered_to" name="delivered_to" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.cancelledFrom')">
            <FormControl v-model="filters.cancelled_from" name="cancelled_from" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.cancelledTo')">
            <FormControl v-model="filters.cancelled_to" name="cancelled_to" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.createdFrom')">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField :label="t('orders.filters.createdTo')">
            <FormControl v-model="filters.created_to" name="created_to" type="date" />
          </FormField>
        </div>

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
            :title="t('orders.actions.clearFilters')"
            :aria-label="t('orders.actions.clearFilters')"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            :title="t('orders.actions.applyFilters')"
            :aria-label="t('orders.actions.applyFilters')"
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
            :title="t('orders.actions.retry')"
            :aria-label="t('orders.actions.retry')"
            small
            @click="fetchOrders"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('orders.list.loading') }}
        </p>
      </CardBox>

      <template v-else-if="!errorMessage">
        <AppDataTable
          v-if="orders.length"
          :columns="columns"
          :rows="orders"
          :empty-title="t('orders.list.emptyTitle')"
          :empty-description="t('orders.list.emptyDescription')"
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
              :label="orderStatusLabel(value)"
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
                :title="t('orders.actions.openOrder')"
                :aria-label="t('orders.actions.openOrder')"
                small
              />
              <BaseButton
                v-for="status in availableOrderActions(row)"
                :key="status"
                :color="actionColor(status)"
                :icon="actionIcon(status)"
                :title="orderActionLabel(status)"
                :aria-label="orderActionLabel(status)"
                :disabled="updatingStatus"
                small
                @click="updateOrderStatus(row, status)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('orders.list.emptyTitle')"
          :description="t('orders.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateOrder"
            :to="{ name: 'orders-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('orders.actions.newOrder')"
            :aria-label="t('orders.actions.newOrder')"
          />
        </AppEmptyState>

        <CardBox v-if="pagination.total > 0" class="mt-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-gray-500 dark:text-slate-400">
              {{ t('orders.pagination.showing', {
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
                :title="t('orders.pagination.previousPage')"
                :aria-label="t('orders.pagination.previousPage')"
                small
                :disabled="!canGoPrevious"
                @click="canGoPrevious ? updatePage(pagination.current_page - 1) : null"
              />
              <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                {{ t('orders.pagination.pageOf', {
                  page: pagination.current_page,
                  pages: pagination.last_page,
                }) }}
              </span>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronRight"
                :title="t('orders.pagination.nextPage')"
                :aria-label="t('orders.pagination.nextPage')"
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

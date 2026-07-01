<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiPlus, mdiWrenchOutline } from '@mdi/js'
import { RESOURCES, canCreateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { MAINTENANCE_ORDER_STATUSES } from '@/types/maintenanceOrder.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import { getPositiveNumberQuery } from '@/modules/shared/utils/queryParams.js'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService.js'
import { useMaintenanceOrderRealtimeRefresh } from '@/modules/maintenance-orders/composables/useMaintenanceOrderRealtimeRefresh.js'
import { orderStatusActions } from '@/modules/maintenance-orders/statusRules.js'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import MaintenanceOrderFilters from '@/modules/maintenance-orders/components/MaintenanceOrderFilters.vue'
import MaintenanceOrdersTable from '@/modules/maintenance-orders/components/MaintenanceOrdersTable.vue'
import ResourceListStatus from '@/modules/shared/components/ResourceListStatus.vue'
import ResourcePagination from '@/modules/shared/components/ResourcePagination.vue'
import BaseButton from '@/components/BaseButton.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { t } = useI18n()

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

const updatingStatus = ref(false)
const filtersExpanded = ref(false)

const currentApiFilters = (nextFilters) => {
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
    const value = getPositiveNumberQuery(nextFilters[key])

    if (value !== null) {
      apiFilters[key] = value
    }
  })

  dateFilters.forEach((key) => {
    if (nextFilters[key]) {
      apiFilters[key] = nextFilters[key]
    }
  })

  if (MAINTENANCE_ORDER_STATUSES.includes(nextFilters.status)) {
    apiFilters.status = nextFilters.status
  }

  if (nextFilters.without_workshop) {
    apiFilters.without_workshop = true
    delete apiFilters.workshop_id
  }

  if (nextFilters.without_technician) {
    apiFilters.without_technician = true
    delete apiFilters.technician_id
  }

  return apiFilters
}

const sanitizeFilters = (nextFilters) => {
  if (nextFilters.without_workshop) {
    nextFilters.workshop_id = ''
  }

  if (nextFilters.without_technician) {
    nextFilters.technician_id = ''
  }

  if (!MAINTENANCE_ORDER_STATUSES.includes(nextFilters.status)) {
    nextFilters.status = ''
  }
}

const {
  items: orders,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchOrders,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'orders',
  emptyFilters: EMPTY_FILTERS,
  fetcher: maintenanceOrdersApi.index,
  toApiFilters: currentApiFilters,
  sanitizeFilters,
})

const canCreateOrder = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.ORDERS))

const setFilter = (key, value) => {
  filters[key] = value
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

useMaintenanceOrderRealtimeRefresh(fetchOrders)
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

      <MaintenanceOrderFilters
        :filters="filters"
        :expanded="filtersExpanded"
        :has-active-filters="hasActiveFilters"
        :input-class="inputClass"
        @apply="applyFilters"
        @clear="clearFilters"
        @focusout="applyFiltersOnFocusOut"
        @toggle-expanded="filtersExpanded = !filtersExpanded"
        @update-filter="setFilter"
        @without-technician-change="handleWithoutTechnicianChange"
        @without-workshop-change="handleWithoutWorkshopChange"
      />

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('orders.list.loading')"
        :retry-label="t('orders.actions.retry')"
        @retry="fetchOrders"
      />

      <template v-if="!loading && !errorMessage">
        <MaintenanceOrdersTable
          v-if="orders.length"
          :columns="columns"
          :orders="orders"
          :updating-status="updatingStatus"
          :available-actions="availableOrderActions"
          @update-status="updateOrderStatus"
        />

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

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('orders.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('orders.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('orders.pagination.previousPage')"
          :next-label="t('orders.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />
      </template>
    </AppPage>
  </LayoutAuthenticated>
</template>

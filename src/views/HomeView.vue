<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiCalendar,
  mdiCheckCircleOutline,
  mdiEyeOutline,
  mdiMonitor,
  mdiRefresh,
  mdiSquareEditOutline,
  mdiViewList,
  mdiWrenchOutline,
} from '@mdi/js'
import { ROUTE_KEYS, canAccessAnyRoute } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { MAINTENANCE_ORDER_STATUSES } from '@/types/maintenanceOrder.js'
import dashboardApi from '@/modules/dashboard/services/dashboardService.js'
import {
  ORDER_STATUS_LABELS,
  ORDER_ITEM_STATUS_LABELS,
  orderItemStatusColor,
  orderStatusColor,
} from '@/modules/maintenance-orders/statusRules.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const summary = ref(null)
const loading = ref(false)
const errorMessage = ref('')
let dashboardAbortController = null

const scheduleColumns = [
  { key: 'order', label: 'Order' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'technician', label: 'Technician' },
  { key: 'scheduled_at', label: 'Scheduled' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

const orderColumns = [
  { key: 'order', label: 'Order' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'status', label: 'Status' },
  { key: 'scheduled_at', label: 'Scheduled' },
  { key: 'actions', label: '' },
]

const itemColumns = [
  { key: 'item', label: 'Item' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'scheduled_at', label: 'Scheduled' },
  { key: 'duration', label: 'Duration' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

const workshopColumns = [
  { key: 'workshop', label: 'Workshop' },
  { key: 'open_orders_count', label: 'Open orders' },
]

const workloadColumns = [
  { key: 'technician', label: 'Technician' },
  { key: 'assigned_items_count', label: 'Assigned items' },
  { key: 'planned_minutes', label: 'Planned time' },
]

const technicianColumns = [
  { key: 'technician', label: 'Technician' },
  { key: 'email', label: 'Email' },
]

const canCreateOrders = computed(() => canAccessAnyRoute(authStore.roles, ROUTE_KEYS.ORDER_CREATE))
const canOpenOrders = computed(() => canAccessAnyRoute(authStore.roles, ROUTE_KEYS.ORDERS))
const metrics = computed(() => summary.value?.metrics ?? {})
const roleContext = computed(() => summary.value?.role_context ?? { type: 'none' })
const activities = computed(() => summary.value?.activities ?? { active: 0, pending: 0 })

const metricCards = computed(() => [
  {
    key: 'open_orders',
    label: 'Open orders',
    icon: mdiViewList,
    color: 'text-blue-500',
  },
  {
    key: 'awaiting_owner_approval',
    label: 'Owner approval',
    icon: mdiAccountMultiple,
    color: 'text-yellow-500',
  },
  {
    key: 'awaiting_scheduling',
    label: 'Awaiting schedule',
    icon: mdiCalendar,
    color: 'text-sky-500',
  },
  {
    key: 'active_orders',
    label: 'Active orders',
    icon: mdiWrenchOutline,
    color: 'text-amber-500',
  },
  {
    key: 'completed_today',
    label: 'Completed today',
    icon: mdiCheckCircleOutline,
    color: 'text-emerald-500',
  },
  {
    key: 'overdue_activities',
    label: 'Overdue items',
    icon: mdiAlertCircle,
    color: 'text-red-500',
  },
])

const orderStatusCards = computed(() =>
  MAINTENANCE_ORDER_STATUSES.map((status) => ({
    status,
    label: ORDER_STATUS_LABELS[status] ?? status,
    count: summary.value?.orders_by_status?.[status] ?? 0,
  })),
)

const todaySchedules = computed(() => summary.value?.today_schedules ?? [])
const upcomingSchedules = computed(() => summary.value?.upcoming_schedules ?? [])

const isEmpty = computed(() => {
  if (!summary.value) {
    return false
  }

  const orderCount = Object.values(summary.value.orders_by_status ?? {})
    .reduce((total, value) => total + Number(value), 0)

  return (
    orderCount === 0 &&
    metricValue('open_orders') === 0 &&
    activities.value.pending === 0 &&
    activities.value.active === 0 &&
    todaySchedules.value.length === 0 &&
    upcomingSchedules.value.length === 0
  )
})

const isCanceledRequest = (error) =>
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'AbortError' ||
  error?.name === 'CanceledError'

const fetchSummary = async () => {
  dashboardAbortController?.abort()

  const controller = new AbortController()
  dashboardAbortController = controller
  loading.value = true
  errorMessage.value = ''

  try {
    summary.value = await dashboardApi.summary({ signal: controller.signal })
  } catch (error) {
    if (isCanceledRequest(error)) {
      return
    }

    errorMessage.value = normalizeApiError(error).message
  } finally {
    if (dashboardAbortController === controller) {
      dashboardAbortController = null
      loading.value = false
    }
  }
}

const metricValue = (key) => Number(metrics.value[key] ?? 0)

const numberLabel = (value) => new Intl.NumberFormat('en').format(Number(value ?? 0))

const orderNumber = (id) => `#${String(id).padStart(5, '0')}`

const vehicleLabel = (vehicle) =>
  vehicle
    ? [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
    : '-'

const workshopLabel = (workshop) =>
  workshop ? [workshop.code, workshop.name, workshop.city].filter(Boolean).join(' - ') : '-'

const userLabel = (user) => user?.name ?? '-'

const taskLabel = (item) =>
  [item.task?.code, item.task?.name].filter(Boolean).join(' - ') || `Item #${item.maintenance_order_item_id}`

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const durationLabel = (minutes) => {
  if (minutes === null || minutes === undefined) {
    return '-'
  }

  const hours = Math.floor(Number(minutes) / 60)
  const remainder = Number(minutes) % 60

  if (hours === 0) {
    return `${remainder} min`
  }

  return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`
}

const statusLabel = (status) => ORDER_STATUS_LABELS[status] ?? status

const itemStatusLabel = (status) => ORDER_ITEM_STATUS_LABELS[status] ?? status

const scheduleRowId = (row) => `order-${row.maintenance_order_id}-${row.scheduled_at ?? 'none'}`

const itemRowId = (row) => `item-${row.maintenance_order_item_id}`

const contextOrders = (key) => roleContext.value?.[key] ?? []

const contextItems = (key) => roleContext.value?.[key] ?? []

onMounted(() => {
  void fetchSummary()
})

onBeforeUnmount(() => {
  dashboardAbortController?.abort()
  dashboardAbortController = null
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      title="Operational dashboard"
      subtitle="Scoped service activity, schedules, workload, and maintenance order status."
      eyebrow="MaintOps"
      :icon="mdiMonitor"
    >
      <template #actions>
        <BaseButton
          color="whiteDark"
          :icon="mdiRefresh"
          :title="loading ? 'Refreshing...' : 'Refresh dashboard'"
          :aria-label="loading ? 'Refreshing...' : 'Refresh dashboard'"
          :disabled="loading"
          @click="fetchSummary"
        />
        <BaseButton
          v-if="canCreateOrders"
          to="/orders/new"
          color="info"
          :icon="mdiSquareEditOutline"
          title="New order"
          aria-label="New order"
        />
        <BaseButton
          v-if="canOpenOrders"
          to="/orders"
          color="whiteDark"
          :icon="mdiViewList"
          title="Open orders"
          aria-label="Open orders"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger" :icon="mdiRefresh">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            title="Retry"
            aria-label="Retry"
            small
            @click="fetchSummary"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading && !summary">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          Loading operational dashboard...
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="summary && isEmpty"
        title="No operational activity"
        description="There are no visible orders, items, or schedules in your authorized scope."
      />

      <div v-else-if="summary" class="grid grid-cols-1 gap-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <CardBoxWidget
            v-for="metric in metricCards"
            :key="metric.key"
            :color="metric.color"
            :icon="metric.icon"
            :number="metricValue(metric.key)"
            :label="metric.label"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <CardBox>
            <div class="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Order items
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  Pending, scheduled, and active task execution.
                </p>
              </div>
              <BaseButton
                v-if="canOpenOrders"
                to="/orders"
                color="whiteDark"
                :icon="mdiViewList"
                title="Open orders"
                aria-label="Open orders"
                small
              />
            </div>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="rounded-sm border border-gray-100 p-4 dark:border-slate-700">
                <dt class="text-sm text-gray-500 dark:text-slate-400">Active</dt>
                <dd class="text-3xl font-semibold text-gray-900 dark:text-slate-100">
                  {{ numberLabel(activities.active) }}
                </dd>
              </div>
              <div class="rounded-sm border border-gray-100 p-4 dark:border-slate-700">
                <dt class="text-sm text-gray-500 dark:text-slate-400">Pending or scheduled</dt>
                <dd class="text-3xl font-semibold text-gray-900 dark:text-slate-100">
                  {{ numberLabel(activities.pending) }}
                </dd>
              </div>
            </dl>
          </CardBox>

          <CardBox>
            <div class="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Orders by status
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  Consolidated counts from Laravel.
                </p>
              </div>
              <span
                v-if="loading"
                class="text-sm font-semibold text-gray-500 dark:text-slate-400"
              >
                Refreshing...
              </span>
            </div>
            <dl class="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div
                v-for="card in orderStatusCards"
                :key="card.status"
                class="rounded-sm border border-gray-100 p-3 dark:border-slate-700"
              >
                <dt class="text-sm text-gray-500 dark:text-slate-400">{{ card.label }}</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  {{ numberLabel(card.count) }}
                </dd>
              </div>
            </dl>
          </CardBox>
        </div>

        <section>
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Today's orders
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Orders scheduled for the current day in your authorized scope.
              </p>
            </div>
            <BaseButton
              v-if="canOpenOrders"
              to="/orders"
              color="whiteDark"
              :icon="mdiViewList"
              title="Open orders"
              aria-label="Open orders"
              small
            />
          </div>
          <AppDataTable
            :columns="scheduleColumns"
            :rows="todaySchedules"
            :row-key="scheduleRowId"
            empty-title="No orders scheduled today"
            empty-description="Today's visible maintenance schedule is empty."
          >
            <template #cell-order="{ row }">
              {{ orderNumber(row.maintenance_order_id) }}
            </template>
            <template #cell-vehicle="{ row }">
              {{ vehicleLabel(row.vehicle) }}
            </template>
            <template #cell-workshop="{ row }">
              {{ workshopLabel(row.workshop) }}
            </template>
            <template #cell-technician="{ row }">
              {{ userLabel(row.technician) }}
            </template>
            <template #cell-scheduled_at="{ value }">
              {{ formatDate(value) }}
            </template>
            <template #cell-status="{ value }">
              <AppBadge :label="statusLabel(value)" :color="orderStatusColor(value)" />
            </template>
            <template #cell-actions="{ row }">
              <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
                <BaseButton
                  :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }"
                  color="whiteDark"
                  :icon="mdiEyeOutline"
                  title="Open order"
                  aria-label="Open order"
                  small
                />
              </BaseButtons>
            </template>
          </AppDataTable>
        </section>

        <section>
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Upcoming orders
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Scheduled orders after today.
              </p>
            </div>
            <BaseButton
              v-if="canOpenOrders"
              to="/orders"
              color="whiteDark"
              :icon="mdiViewList"
              title="Open orders"
              aria-label="Open orders"
              small
            />
          </div>
          <AppDataTable
            :columns="scheduleColumns"
            :rows="upcomingSchedules"
            :row-key="scheduleRowId"
            empty-title="No upcoming orders"
            empty-description="There are no upcoming visible maintenance orders."
          >
            <template #cell-order="{ row }">
              {{ orderNumber(row.maintenance_order_id) }}
            </template>
            <template #cell-vehicle="{ row }">
              {{ vehicleLabel(row.vehicle) }}
            </template>
            <template #cell-workshop="{ row }">
              {{ workshopLabel(row.workshop) }}
            </template>
            <template #cell-technician="{ row }">
              {{ userLabel(row.technician) }}
            </template>
            <template #cell-scheduled_at="{ value }">
              {{ formatDate(value) }}
            </template>
            <template #cell-status="{ value }">
              <AppBadge :label="statusLabel(value)" :color="orderStatusColor(value)" />
            </template>
            <template #cell-actions="{ row }">
              <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
                <BaseButton
                  :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }"
                  color="whiteDark"
                  :icon="mdiEyeOutline"
                  title="Open order"
                  aria-label="Open order"
                  small
                />
              </BaseButtons>
            </template>
          </AppDataTable>
        </section>

        <section v-if="roleContext.type === 'system_admin'" class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Open orders by workshop
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Workshop load across visible open orders.
              </p>
            </div>
            <AppDataTable
              :columns="workshopColumns"
              :rows="roleContext.orders_by_workshop ?? []"
              row-key="workshop_id"
              empty-title="No workshop load"
              empty-description="No open visible orders are assigned to workshops."
            >
              <template #cell-workshop="{ row }">
                {{ workshopLabel(row.workshop) }}
              </template>
              <template #cell-open_orders_count="{ value }">
                {{ numberLabel(value) }}
              </template>
            </AppDataTable>
          </div>

          <div>
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Technician workload today
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Assigned order items and planned time for today.
              </p>
            </div>
            <AppDataTable
              :columns="workloadColumns"
              :rows="roleContext.technician_workload_today ?? []"
              row-key="technician_id"
              empty-title="No technician workload"
              empty-description="No scheduled or active items are assigned today."
            >
              <template #cell-technician="{ row }">
                {{ userLabel(row.technician) }}
              </template>
              <template #cell-assigned_items_count="{ value }">
                {{ numberLabel(value) }}
              </template>
              <template #cell-planned_minutes="{ value }">
                {{ durationLabel(value) }}
              </template>
            </AppDataTable>
          </div>

          <div class="xl:col-span-2">
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Awaiting scheduling
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Approved or partially approved orders ready for scheduling.
              </p>
            </div>
            <AppDataTable
              :columns="orderColumns"
              :rows="contextOrders('awaiting_scheduling_orders')"
              row-key="maintenance_order_id"
              empty-title="No orders awaiting scheduling"
              empty-description="There are no approved orders waiting for schedule assignment."
            >
              <template #cell-order="{ row }">
                {{ orderNumber(row.maintenance_order_id) }}
              </template>
              <template #cell-vehicle="{ row }">
                {{ vehicleLabel(row.vehicle) }}
              </template>
              <template #cell-workshop="{ row }">
                {{ workshopLabel(row.workshop) }}
              </template>
              <template #cell-status="{ value }">
                <AppBadge :label="statusLabel(value)" :color="orderStatusColor(value)" />
              </template>
              <template #cell-scheduled_at="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #cell-actions="{ row }">
                <BaseButton
                  :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }"
                  color="whiteDark"
                  :icon="mdiEyeOutline"
                  title="Open order"
                  aria-label="Open order"
                  small
                />
              </template>
            </AppDataTable>
          </div>
        </section>

        <section v-if="roleContext.type === 'advisor'" class="grid grid-cols-1 gap-6">
          <div
            v-for="section in [
              {
                key: 'awaiting_owner_approval_orders',
                title: 'Awaiting owner approval',
                description: 'Orders waiting for owner decision.',
              },
              {
                key: 'partially_approved_orders',
                title: 'Partially approved',
                description: 'Orders approved with rejected items.',
              },
              {
                key: 'rejected_orders',
                title: 'Rejected orders',
                description: 'Orders rejected during approval.',
              },
              {
                key: 'upcoming_deliveries',
                title: 'Upcoming deliveries',
                description: 'Completed orders ready for delivery follow-up.',
              },
            ]"
            :key="section.key"
          >
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {{ section.title }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ section.description }}
              </p>
            </div>
            <AppDataTable
              :columns="orderColumns"
              :rows="contextOrders(section.key)"
              row-key="maintenance_order_id"
              empty-title="No orders found"
              empty-description="There are no visible orders in this workflow."
            >
              <template #cell-order="{ row }">
                {{ orderNumber(row.maintenance_order_id) }}
              </template>
              <template #cell-vehicle="{ row }">
                {{ vehicleLabel(row.vehicle) }}
              </template>
              <template #cell-workshop="{ row }">
                {{ workshopLabel(row.workshop) }}
              </template>
              <template #cell-status="{ value }">
                <AppBadge :label="statusLabel(value)" :color="orderStatusColor(value)" />
              </template>
              <template #cell-scheduled_at="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #cell-actions="{ row }">
                <BaseButton
                  :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }"
                  color="whiteDark"
                  :icon="mdiEyeOutline"
                  title="Open order"
                  aria-label="Open order"
                  small
                />
              </template>
            </AppDataTable>
          </div>
        </section>

        <section v-if="roleContext.type === 'workshop_manager'" class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Technician workload today
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Scheduled and active items in managed workshops.
              </p>
            </div>
            <AppDataTable
              :columns="workloadColumns"
              :rows="roleContext.technician_workload_today ?? []"
              row-key="technician_id"
              empty-title="No technician workload"
              empty-description="There are no assigned items for today."
            >
              <template #cell-technician="{ row }">
                {{ userLabel(row.technician) }}
              </template>
              <template #cell-assigned_items_count="{ value }">
                {{ numberLabel(value) }}
              </template>
              <template #cell-planned_minutes="{ value }">
                {{ durationLabel(value) }}
              </template>
            </AppDataTable>
          </div>

          <div>
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Available technicians today
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Active technicians without scheduled assignments today.
              </p>
            </div>
            <AppDataTable
              :columns="technicianColumns"
              :rows="roleContext.technicians_without_assignments_today ?? []"
              row-key="id"
              empty-title="No available technicians"
              empty-description="All visible technicians have assignments or no workshop is managed."
            >
              <template #cell-technician="{ row }">
                {{ row.name }}
              </template>
              <template #cell-email="{ value }">
                {{ value }}
              </template>
            </AppDataTable>
          </div>

          <div class="xl:col-span-2">
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Active items
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                In-progress order items in managed workshops.
              </p>
            </div>
            <AppDataTable
              :columns="itemColumns"
              :rows="contextItems('active_items')"
              :row-key="itemRowId"
              empty-title="No active items"
              empty-description="No visible order items are currently in progress."
            >
              <template #cell-item="{ row }">
                {{ taskLabel(row) }}
              </template>
              <template #cell-vehicle="{ row }">
                {{ vehicleLabel(row.vehicle) }}
              </template>
              <template #cell-workshop="{ row }">
                {{ workshopLabel(row.workshop) }}
              </template>
              <template #cell-scheduled_at="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #cell-duration="{ row }">
                {{ durationLabel(row.planned_duration_minutes) }}
              </template>
              <template #cell-status="{ value }">
                <AppBadge :label="itemStatusLabel(value)" :color="orderItemStatusColor(value)" />
              </template>
              <template #cell-actions="{ row }">
                <BaseButton
                  :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }"
                  color="whiteDark"
                  :icon="mdiEyeOutline"
                  title="Open order"
                  aria-label="Open order"
                  small
                />
              </template>
            </AppDataTable>
          </div>
        </section>

        <section v-if="roleContext.type === 'technician'" class="grid grid-cols-1 gap-6">
          <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <CardBox>
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
                Current item
              </h2>
              <template v-if="roleContext.current_item">
                <p class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ taskLabel(roleContext.current_item) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {{ vehicleLabel(roleContext.current_item.vehicle) }}
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <AppBadge
                    :label="itemStatusLabel(roleContext.current_item.status)"
                    :color="orderItemStatusColor(roleContext.current_item.status)"
                  />
                  <BaseButton
                    :to="{
                      name: 'orders-detail',
                      params: { id: roleContext.current_item.maintenance_order_id },
                    }"
                    color="whiteDark"
                    :icon="mdiEyeOutline"
                    title="Open order"
                    aria-label="Open order"
                    small
                  />
                </div>
              </template>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                There is no item currently in progress.
              </p>
            </CardBox>

            <CardBox>
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
                Next item
              </h2>
              <template v-if="roleContext.next_item">
                <p class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ taskLabel(roleContext.next_item) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {{ formatDate(roleContext.next_item.scheduled_at) }}
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <AppBadge
                    :label="itemStatusLabel(roleContext.next_item.status)"
                    :color="orderItemStatusColor(roleContext.next_item.status)"
                  />
                  <BaseButton
                    :to="{
                      name: 'orders-detail',
                      params: { id: roleContext.next_item.maintenance_order_id },
                    }"
                    color="whiteDark"
                    :icon="mdiEyeOutline"
                    title="Open order"
                    aria-label="Open order"
                    small
                  />
                </div>
              </template>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                There is no upcoming scheduled item.
              </p>
            </CardBox>

            <CardBox>
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
                Completed today
              </h2>
              <p class="text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {{ numberLabel(roleContext.completed_today_count ?? 0) }}
              </p>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Items completed in the current day.
              </p>
            </CardBox>
          </div>

          <div>
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Today's queue
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Scheduled and active items assigned today.
              </p>
            </div>
            <AppDataTable
              :columns="itemColumns"
              :rows="contextItems('today_queue')"
              :row-key="itemRowId"
              empty-title="No items in today's queue"
              empty-description="There are no scheduled or active visible items for today."
            >
              <template #cell-item="{ row }">
                {{ taskLabel(row) }}
              </template>
              <template #cell-vehicle="{ row }">
                {{ vehicleLabel(row.vehicle) }}
              </template>
              <template #cell-workshop="{ row }">
                {{ workshopLabel(row.workshop) }}
              </template>
              <template #cell-scheduled_at="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #cell-duration="{ row }">
                {{ durationLabel(row.planned_duration_minutes) }}
              </template>
              <template #cell-status="{ value }">
                <AppBadge :label="itemStatusLabel(value)" :color="orderItemStatusColor(value)" />
              </template>
              <template #cell-actions="{ row }">
                <BaseButton
                  :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }"
                  color="whiteDark"
                  :icon="mdiEyeOutline"
                  title="Open order"
                  aria-label="Open order"
                  small
                />
              </template>
            </AppDataTable>
          </div>
        </section>
      </div>
    </AppPage>
  </LayoutAuthenticated>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
import { useOperationalEventListener } from '@/modules/realtime/composables/useOperationalEventListener.js'
import {
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
const { locale, t, te } = useI18n()

const summary = ref(null)
const loading = ref(false)
const errorMessage = ref('')
let dashboardAbortController = null
let realtimeRefreshTimer = null

const scheduleColumns = computed(() => [
  { key: 'order', label: t('dashboard.columns.order') },
  { key: 'vehicle', label: t('dashboard.columns.vehicle') },
  { key: 'workshop', label: t('dashboard.columns.workshop') },
  { key: 'technician', label: t('dashboard.columns.technician') },
  { key: 'scheduled_at', label: t('dashboard.columns.scheduled') },
  { key: 'status', label: t('dashboard.columns.status') },
  { key: 'actions', label: '' },
])

const orderColumns = computed(() => [
  { key: 'order', label: t('dashboard.columns.order') },
  { key: 'vehicle', label: t('dashboard.columns.vehicle') },
  { key: 'workshop', label: t('dashboard.columns.workshop') },
  { key: 'status', label: t('dashboard.columns.status') },
  { key: 'scheduled_at', label: t('dashboard.columns.scheduled') },
  { key: 'actions', label: '' },
])

const itemColumns = computed(() => [
  { key: 'item', label: t('dashboard.columns.item') },
  { key: 'vehicle', label: t('dashboard.columns.vehicle') },
  { key: 'workshop', label: t('dashboard.columns.workshop') },
  { key: 'scheduled_at', label: t('dashboard.columns.scheduled') },
  { key: 'duration', label: t('dashboard.columns.duration') },
  { key: 'status', label: t('dashboard.columns.status') },
  { key: 'actions', label: '' },
])

const workshopColumns = computed(() => [
  { key: 'workshop', label: t('dashboard.columns.workshop') },
  { key: 'open_orders_count', label: t('dashboard.columns.openOrders') },
])

const workloadColumns = computed(() => [
  { key: 'technician', label: t('dashboard.columns.technician') },
  { key: 'assigned_items_count', label: t('dashboard.columns.assignedItems') },
  { key: 'planned_minutes', label: t('dashboard.columns.plannedTime') },
])

const technicianColumns = computed(() => [
  { key: 'technician', label: t('dashboard.columns.technician') },
  { key: 'email', label: t('dashboard.columns.email') },
])

const canCreateOrders = computed(() => canAccessAnyRoute(authStore.roles, ROUTE_KEYS.ORDER_CREATE))
const canOpenOrders = computed(() => canAccessAnyRoute(authStore.roles, ROUTE_KEYS.ORDERS))
const metrics = computed(() => summary.value?.metrics ?? {})
const roleContext = computed(() => summary.value?.role_context ?? { type: 'none' })
const activities = computed(() => summary.value?.activities ?? { active: 0, pending: 0 })

const metricCards = computed(() => [
  {
    key: 'open_orders',
    label: t('dashboard.metrics.open_orders'),
    icon: mdiViewList,
    color: 'text-blue-500',
  },
  {
    key: 'awaiting_owner_approval',
    label: t('dashboard.metrics.awaiting_owner_approval'),
    icon: mdiAccountMultiple,
    color: 'text-yellow-500',
  },
  {
    key: 'awaiting_scheduling',
    label: t('dashboard.metrics.awaiting_scheduling'),
    icon: mdiCalendar,
    color: 'text-sky-500',
  },
  {
    key: 'active_orders',
    label: t('dashboard.metrics.active_orders'),
    icon: mdiWrenchOutline,
    color: 'text-amber-500',
  },
  {
    key: 'completed_today',
    label: t('dashboard.metrics.completed_today'),
    icon: mdiCheckCircleOutline,
    color: 'text-emerald-500',
  },
  {
    key: 'overdue_activities',
    label: t('dashboard.metrics.overdue_activities'),
    icon: mdiAlertCircle,
    color: 'text-red-500',
  },
])

const orderStatusCards = computed(() =>
  MAINTENANCE_ORDER_STATUSES.map((status) => ({
    status,
    label: statusLabel(status),
    count: summary.value?.orders_by_status?.[status] ?? 0,
  })),
)

const advisorSections = computed(() => [
  {
    key: 'awaiting_owner_approval_orders',
    title: t('dashboard.sections.awaitingOwnerApprovalTitle'),
    description: t('dashboard.sections.awaitingOwnerApprovalDescription'),
  },
  {
    key: 'partially_approved_orders',
    title: t('dashboard.sections.partiallyApprovedTitle'),
    description: t('dashboard.sections.partiallyApprovedDescription'),
  },
  {
    key: 'rejected_orders',
    title: t('dashboard.sections.rejectedOrdersTitle'),
    description: t('dashboard.sections.rejectedOrdersDescription'),
  },
  {
    key: 'upcoming_deliveries',
    title: t('dashboard.sections.upcomingDeliveriesTitle'),
    description: t('dashboard.sections.upcomingDeliveriesDescription'),
  },
])

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

const scheduleRealtimeRefresh = () => {
  if (realtimeRefreshTimer !== null) {
    clearTimeout(realtimeRefreshTimer)
  }

  realtimeRefreshTimer = setTimeout(() => {
    realtimeRefreshTimer = null
    void fetchSummary()
  }, 200)
}

const metricValue = (key) => Number(metrics.value[key] ?? 0)

const numberLabel = (value) => new Intl.NumberFormat(locale.value).format(Number(value ?? 0))

const orderNumber = (id) => `#${String(id).padStart(5, '0')}`

const vehicleLabel = (vehicle) =>
  vehicle
    ? [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
    : '-'

const workshopLabel = (workshop) =>
  workshop ? [workshop.code, workshop.name, workshop.city].filter(Boolean).join(' - ') : '-'

const userLabel = (user) => user?.name ?? '-'

const taskLabel = (item) =>
  [item.task?.code, item.task?.name].filter(Boolean).join(' - ') ||
  t('dashboard.labels.itemNumber', { id: item.maintenance_order_item_id })

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
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
    return t('dashboard.units.minutesShort', { count: remainder })
  }

  return remainder === 0
    ? t('dashboard.units.hoursShort', { count: hours })
    : t('dashboard.units.hoursMinutesShort', { hours, minutes: remainder })
}

const normalizeStatusKey = (status) =>
  String(status ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')

const humanizeCode = (value) =>
  String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const translateStatus = (namespace, status) => {
  const normalizedStatus = normalizeStatusKey(status)
  const key = `dashboard.${namespace}.${normalizedStatus}`

  return te(key) ? t(key) : humanizeCode(status)
}

const statusLabel = (status) => translateStatus('orderStatuses', status)

const itemStatusLabel = (status) => translateStatus('orderItemStatuses', status)

const scheduleRowId = (row) => `order-${row.maintenance_order_id}-${row.scheduled_at ?? 'none'}`

const itemRowId = (row) => `item-${row.maintenance_order_item_id}`

const contextOrders = (key) => roleContext.value?.[key] ?? []

const contextItems = (key) => roleContext.value?.[key] ?? []

onMounted(() => {
  void fetchSummary()
})

useOperationalEventListener(() => {
  scheduleRealtimeRefresh()
})

onBeforeUnmount(() => {
  if (realtimeRefreshTimer !== null) {
    clearTimeout(realtimeRefreshTimer)
    realtimeRefreshTimer = null
  }

  dashboardAbortController?.abort()
  dashboardAbortController = null
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('dashboard.page.title')"
      :subtitle="t('dashboard.page.subtitle')"
      :eyebrow="t('dashboard.page.eyebrow')"
      :icon="mdiMonitor"
    >
      <template #actions>
        <BaseButton
          color="whiteDark"
          :icon="mdiRefresh"
          :title="loading ? t('dashboard.actions.refreshing') : t('dashboard.actions.refresh')"
          :aria-label="loading ? t('dashboard.actions.refreshing') : t('dashboard.actions.refresh')"
          :disabled="loading"
          @click="fetchSummary"
        />
        <BaseButton
          v-if="canCreateOrders"
          to="/orders/new"
          color="info"
          :icon="mdiSquareEditOutline"
          :title="t('dashboard.actions.newOrder')"
          :aria-label="t('dashboard.actions.newOrder')"
        />
        <BaseButton
          v-if="canOpenOrders"
          to="/orders"
          color="whiteDark"
          :icon="mdiViewList"
          :title="t('dashboard.actions.openOrders')"
          :aria-label="t('dashboard.actions.openOrders')"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger" :icon="mdiRefresh">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('dashboard.actions.retry')"
            :aria-label="t('dashboard.actions.retry')"
            small
            @click="fetchSummary"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading && !summary">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('dashboard.page.loading') }}
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="summary && isEmpty"
        :title="t('dashboard.page.emptyTitle')"
        :description="t('dashboard.page.emptyDescription')"
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
                  {{ t('dashboard.sections.orderItemsTitle') }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {{ t('dashboard.sections.orderItemsDescription') }}
                </p>
              </div>
              <BaseButton
                v-if="canOpenOrders"
                to="/orders"
                color="whiteDark"
                :icon="mdiViewList"
                :title="t('dashboard.actions.openOrders')"
                :aria-label="t('dashboard.actions.openOrders')"
                small
              />
            </div>
            <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="rounded-sm border border-gray-100 p-4 dark:border-slate-700">
                <dt class="text-sm text-gray-500 dark:text-slate-400">
                  {{ t('dashboard.labels.active') }}
                </dt>
                <dd class="text-3xl font-semibold text-gray-900 dark:text-slate-100">
                  {{ numberLabel(activities.active) }}
                </dd>
              </div>
              <div class="rounded-sm border border-gray-100 p-4 dark:border-slate-700">
                <dt class="text-sm text-gray-500 dark:text-slate-400">
                  {{ t('dashboard.labels.pendingOrScheduled') }}
                </dt>
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
                  {{ t('dashboard.sections.ordersByStatusTitle') }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {{ t('dashboard.sections.ordersByStatusDescription') }}
                </p>
              </div>
              <span
                v-if="loading"
                class="text-sm font-semibold text-gray-500 dark:text-slate-400"
              >
                {{ t('dashboard.actions.refreshing') }}
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
                {{ t('dashboard.sections.todayOrdersTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.todayOrdersDescription') }}
              </p>
            </div>
            <BaseButton
              v-if="canOpenOrders"
              to="/orders"
              color="whiteDark"
              :icon="mdiViewList"
              :title="t('dashboard.actions.openOrders')"
              :aria-label="t('dashboard.actions.openOrders')"
              small
            />
          </div>
          <AppDataTable
            :columns="scheduleColumns"
            :rows="todaySchedules"
            :row-key="scheduleRowId"
            :empty-title="t('dashboard.empty.noOrdersScheduledTodayTitle')"
            :empty-description="t('dashboard.empty.todayScheduleEmptyDescription')"
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
                  :title="t('dashboard.actions.openOrder')"
                  :aria-label="t('dashboard.actions.openOrder')"
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
                {{ t('dashboard.sections.upcomingOrdersTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.upcomingOrdersDescription') }}
              </p>
            </div>
            <BaseButton
              v-if="canOpenOrders"
              to="/orders"
              color="whiteDark"
              :icon="mdiViewList"
              :title="t('dashboard.actions.openOrders')"
              :aria-label="t('dashboard.actions.openOrders')"
              small
            />
          </div>
          <AppDataTable
            :columns="scheduleColumns"
            :rows="upcomingSchedules"
            :row-key="scheduleRowId"
            :empty-title="t('dashboard.empty.noUpcomingOrdersTitle')"
            :empty-description="t('dashboard.empty.noUpcomingOrdersDescription')"
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
                  :title="t('dashboard.actions.openOrder')"
                  :aria-label="t('dashboard.actions.openOrder')"
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
                {{ t('dashboard.sections.openOrdersByWorkshopTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.openOrdersByWorkshopDescription') }}
              </p>
            </div>
            <AppDataTable
              :columns="workshopColumns"
              :rows="roleContext.orders_by_workshop ?? []"
              row-key="workshop_id"
              :empty-title="t('dashboard.empty.noWorkshopLoadTitle')"
              :empty-description="t('dashboard.empty.noWorkshopLoadDescription')"
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
                {{ t('dashboard.sections.technicianWorkloadTodayTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.technicianWorkloadTodayDescription') }}
              </p>
            </div>
            <AppDataTable
              :columns="workloadColumns"
              :rows="roleContext.technician_workload_today ?? []"
              row-key="technician_id"
              :empty-title="t('dashboard.empty.noTechnicianWorkloadTitle')"
              :empty-description="t('dashboard.empty.noScheduledActiveItemsAssignedTodayDescription')"
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
                {{ t('dashboard.sections.awaitingSchedulingTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.awaitingSchedulingDescription') }}
              </p>
            </div>
            <AppDataTable
              :columns="orderColumns"
              :rows="contextOrders('awaiting_scheduling_orders')"
              row-key="maintenance_order_id"
              :empty-title="t('dashboard.empty.noOrdersAwaitingSchedulingTitle')"
              :empty-description="t('dashboard.empty.noOrdersAwaitingSchedulingDescription')"
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
                  :title="t('dashboard.actions.openOrder')"
                  :aria-label="t('dashboard.actions.openOrder')"
                  small
                />
              </template>
            </AppDataTable>
          </div>
        </section>

        <section v-if="roleContext.type === 'advisor'" class="grid grid-cols-1 gap-6">
          <div
            v-for="section in advisorSections"
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
              :empty-title="t('dashboard.empty.noOrdersFoundTitle')"
              :empty-description="t('dashboard.empty.noVisibleOrdersWorkflowDescription')"
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
                  :title="t('dashboard.actions.openOrder')"
                  :aria-label="t('dashboard.actions.openOrder')"
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
                {{ t('dashboard.sections.technicianWorkloadTodayTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.technicianWorkloadManagedDescription') }}
              </p>
            </div>
            <AppDataTable
              :columns="workloadColumns"
              :rows="roleContext.technician_workload_today ?? []"
              row-key="technician_id"
              :empty-title="t('dashboard.empty.noTechnicianWorkloadTitle')"
              :empty-description="t('dashboard.empty.noAssignedItemsTodayDescription')"
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
                {{ t('dashboard.sections.availableTechniciansTodayTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.availableTechniciansTodayDescription') }}
              </p>
            </div>
            <AppDataTable
              :columns="technicianColumns"
              :rows="roleContext.technicians_without_assignments_today ?? []"
              row-key="id"
              :empty-title="t('dashboard.empty.noAvailableTechniciansTitle')"
              :empty-description="t('dashboard.empty.noAvailableTechniciansDescription')"
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
                {{ t('dashboard.sections.activeItemsTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.activeItemsDescription') }}
              </p>
            </div>
            <AppDataTable
              :columns="itemColumns"
              :rows="contextItems('active_items')"
              :row-key="itemRowId"
              :empty-title="t('dashboard.empty.noActiveItemsTitle')"
              :empty-description="t('dashboard.empty.noActiveItemsDescription')"
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
                  :title="t('dashboard.actions.openOrder')"
                  :aria-label="t('dashboard.actions.openOrder')"
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
                {{ t('dashboard.sections.currentItemTitle') }}
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
                    :title="t('dashboard.actions.openOrder')"
                    :aria-label="t('dashboard.actions.openOrder')"
                    small
                  />
                </div>
              </template>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.empty.noCurrentItemDescription') }}
              </p>
            </CardBox>

            <CardBox>
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
                {{ t('dashboard.sections.nextItemTitle') }}
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
                    :title="t('dashboard.actions.openOrder')"
                    :aria-label="t('dashboard.actions.openOrder')"
                    small
                  />
                </div>
              </template>
              <p v-else class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.empty.noNextItemDescription') }}
              </p>
            </CardBox>

            <CardBox>
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
                {{ t('dashboard.sections.completedTodayTitle') }}
              </h2>
              <p class="text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {{ numberLabel(roleContext.completed_today_count ?? 0) }}
              </p>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.completedTodayDescription') }}
              </p>
            </CardBox>
          </div>

          <div>
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {{ t('dashboard.sections.todaysQueueTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ t('dashboard.sections.todaysQueueDescription') }}
              </p>
            </div>
            <AppDataTable
              :columns="itemColumns"
              :rows="contextItems('today_queue')"
              :row-key="itemRowId"
              :empty-title="t('dashboard.empty.noItemsTodayQueueTitle')"
              :empty-description="t('dashboard.empty.noItemsTodayQueueDescription')"
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
                  :title="t('dashboard.actions.openOrder')"
                  :aria-label="t('dashboard.actions.openOrder')"
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

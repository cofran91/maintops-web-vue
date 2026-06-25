<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiArrowLeft,
  mdiCalendar,
  mdiCancel,
  mdiCar,
  mdiCheckCircleOutline,
  mdiClipboardCheckOutline,
  mdiClose,
  mdiPlayCircleOutline,
  mdiRefresh,
  mdiTruckDeliveryOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import maintenanceOrderItemsApi from '@/modules/maintenance-orders/services/maintenanceOrderItemsService.js'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService.js'
import { useOperationalEventListener } from '@/modules/realtime/composables/useOperationalEventListener.js'
import { maintenanceOrderIdForEvent } from '@/modules/realtime/services/operationalEventsService.js'
import {
  ORDER_ACTION_LABELS,
  ORDER_ITEM_ACTION_LABELS,
  ORDER_ITEM_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  orderItemStatusActions,
  orderItemStatusColor,
  orderStatusActions,
  orderStatusColor,
} from '@/modules/maintenance-orders/statusRules.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const order = ref(null)
const loading = ref(false)
const updatingStatus = ref(false)
const errorMessage = ref('')
let realtimeRefreshTimer = null

const itemColumns = [
  { key: 'task', label: 'Task' },
  { key: 'plan', label: 'Plan' },
  { key: 'system', label: 'System' },
  { key: 'status', label: 'Status' },
  { key: 'duration', label: 'Duration' },
  { key: 'scheduled_at', label: 'Scheduled' },
  { key: 'actions', label: '' },
]

const orderId = computed(() => String(route.params.id ?? ''))
const items = computed(() => order.value?.items ?? [])
const title = computed(() =>
  order.value ? `Order #${String(order.value.id).padStart(5, '0')}` : 'Order detail',
)

const fetchOrder = async () => {
  loading.value = true
  errorMessage.value = ''
  order.value = null

  try {
    order.value = await maintenanceOrdersApi.show(orderId.value)
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
    void fetchOrder()
  }, 200)
}

const updateOrderStatus = async (status) => {
  if (!order.value) {
    return
  }

  updatingStatus.value = true
  errorMessage.value = ''

  try {
    order.value = await maintenanceOrdersApi.update(order.value.id, { status })
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    updatingStatus.value = false
  }
}

const updateItemStatus = async (item, status) => {
  updatingStatus.value = true
  errorMessage.value = ''

  try {
    await maintenanceOrderItemsApi.update(item.id, { status })
    await fetchOrder()
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    updatingStatus.value = false
  }
}

const availableOrderActions = computed(() =>
  order.value ? orderStatusActions(order.value, authStore.roles, authStore.user) : [],
)

const availableItemActions = (item) =>
  orderItemStatusActions(
    { ...item, maintenance_order: order.value },
    authStore.roles,
    authStore.user,
  )

const actionIcon = (status) => {
  const icons = {
    approved: mdiCheckCircleOutline,
    delivered: mdiTruckDeliveryOutline,
    in_progress: mdiPlayCircleOutline,
    completed: mdiClipboardCheckOutline,
    cancelled: mdiCancel,
  }

  return icons[status] ?? mdiClose
}
const actionColor = (status) =>
  ['approved', 'delivered', 'in_progress', 'completed'].includes(status)
    ? 'success'
    : 'danger'

const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const durationLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${new Intl.NumberFormat('en').format(value)} min`
}

const vehicleLabel = (vehicle) =>
  vehicle
    ? [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
    : '-'
const userLabel = (user) => user?.name ?? '-'
const workshopLabel = (workshop) =>
  workshop ? [workshop.code, workshop.name].filter(Boolean).join(' - ') : 'Unassigned'
const taskLabel = (item) =>
  [item.maintenance_task?.code, item.maintenance_task?.name].filter(Boolean).join(' - ') ||
  `Task #${item.maintenance_task_id}`
const planLabel = (item) =>
  item.maintenance_plan
    ? [item.maintenance_plan.code, item.maintenance_plan.name].filter(Boolean).join(' - ')
    : '-'
const systemLabel = (item) => item.maintenance_task?.vehicle_system?.name ?? '-'

const orderItems = computed(() => {
  if (!order.value) {
    return []
  }

  return [
    { icon: mdiCar, label: 'Vehicle', value: vehicleLabel(order.value.vehicle) },
    { icon: mdiCar, label: 'Owner', value: userLabel(order.value.owner) },
    { icon: mdiWrenchOutline, label: 'Advisor', value: userLabel(order.value.advisor) },
    { icon: mdiWrenchOutline, label: 'Workshop', value: workshopLabel(order.value.workshop) },
    { icon: mdiWrenchOutline, label: 'Technician', value: userLabel(order.value.technician) },
    { icon: mdiCalendar, label: 'Created', value: formatDate(order.value.created_at) },
    { icon: mdiCalendar, label: 'Scheduled', value: formatDate(order.value.scheduled_at) },
    { icon: mdiCalendar, label: 'Started', value: formatDate(order.value.started_at) },
    { icon: mdiCalendar, label: 'Finished', value: formatDate(order.value.finished_at) },
    { icon: mdiCalendar, label: 'Delivered', value: formatDate(order.value.delivered_at) },
    { icon: mdiCalendar, label: 'Cancelled', value: formatDate(order.value.cancelled_at) },
  ]
})

watch(
  orderId,
  () => {
    void fetchOrder()
  },
  { immediate: true },
)

useOperationalEventListener((event) => {
  if (String(maintenanceOrderIdForEvent(event)) === orderId.value) {
    scheduleRealtimeRefresh()
  }
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
      :title="title"
      subtitle="Review assignments, status history, and task-level execution."
      eyebrow="Orders"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'orders' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back to orders"
          aria-label="Back to orders"
        />
        <BaseButton
          v-for="status in availableOrderActions"
          :key="status"
          :color="actionColor(status)"
          :icon="actionIcon(status)"
          :title="ORDER_ACTION_LABELS[status]"
          :aria-label="ORDER_ACTION_LABELS[status]"
          :disabled="updatingStatus"
          @click="updateOrderStatus(status)"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            title="Retry"
            aria-label="Retry"
            small
            @click="fetchOrder"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading order...</p>
      </CardBox>

      <AppEmptyState
        v-else-if="!order && !errorMessage"
        title="Order unavailable"
        description="There is no order data to display."
      />

      <div v-else-if="order" class="grid grid-cols-1 gap-6">
        <CardBox>
          <div class="mb-5 flex flex-wrap gap-2">
            <AppBadge
              :label="ORDER_STATUS_LABELS[order.status] ?? order.status"
              :color="orderStatusColor(order.status)"
            />
            <AppBadge :label="`${items.length} items`" color="info" />
          </div>

          <dl class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div v-for="item in orderItems" :key="item.label">
              <dt
                class="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500
                  dark:text-slate-400"
              >
                <BaseIcon :path="item.icon" size="16" />
                {{ item.label }}
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </CardBox>

        <CardBox>
          <AppDataTable
            v-if="items.length"
            :columns="itemColumns"
            :rows="items"
            empty-title="No order items"
            empty-description="Items are generated by maintenance plan workflows."
          >
            <template #cell-task="{ row }">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ taskLabel(row) }}
                </p>
                <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                  {{ formatValue(row.odometer_km) }} km
                </p>
              </div>
            </template>
            <template #cell-plan="{ row }">
              {{ planLabel(row) }}
            </template>
            <template #cell-system="{ row }">
              {{ systemLabel(row) }}
            </template>
            <template #cell-status="{ value }">
              <AppBadge
                :label="ORDER_ITEM_STATUS_LABELS[value] ?? value"
                :color="orderItemStatusColor(value)"
              />
            </template>
            <template #cell-duration="{ row }">
              {{
                durationLabel(
                  row.planned_duration_minutes ??
                  row.maintenance_task?.estimated_duration_minutes
                )
              }}
            </template>
            <template #cell-scheduled_at="{ value }">
              {{ formatDate(value) }}
            </template>
            <template #cell-actions="{ row }">
              <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
                <BaseButton
                  v-for="status in availableItemActions(row)"
                  :key="status"
                  :color="actionColor(status)"
                  :icon="actionIcon(status)"
                  :title="ORDER_ITEM_ACTION_LABELS[status]"
                  :aria-label="ORDER_ITEM_ACTION_LABELS[status]"
                  :disabled="updatingStatus"
                  small
                  @click="updateItemStatus(row, status)"
                />
              </BaseButtons>
            </template>
          </AppDataTable>

          <AppEmptyState
            v-else
            title="No order items"
            description="Items are generated by maintenance plan workflows."
          />
        </CardBox>
      </div>
    </AppPage>
  </LayoutAuthenticated>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
const authStore = useAuthStore()
const { locale, t } = useI18n()

const order = ref(null)
const loading = ref(false)
const updatingStatus = ref(false)
const errorMessage = ref('')
let realtimeRefreshTimer = null

const itemColumns = computed(() => [
  { key: 'task', label: t('orders.itemColumns.task') },
  { key: 'plan', label: t('orders.itemColumns.plan') },
  { key: 'system', label: t('orders.itemColumns.system') },
  { key: 'status', label: t('orders.itemColumns.status') },
  { key: 'duration', label: t('orders.itemColumns.duration') },
  { key: 'scheduled_at', label: t('orders.itemColumns.scheduled') },
  { key: 'actions', label: '' },
])

const orderId = computed(() => String(route.params.id ?? ''))
const items = computed(() => order.value?.items ?? [])
const title = computed(() =>
  order.value
    ? t('orders.labels.orderNumber', { id: String(order.value.id).padStart(5, '0') })
    : t('orders.detail.titleFallback'),
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

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const durationLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('orders.units.minutes', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const kilometersLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('orders.units.kilometers', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const vehicleLabel = (vehicle) =>
  vehicle
    ? [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
    : '-'
const userLabel = (user) => user?.name ?? '-'
const workshopLabel = (workshop) =>
  workshop
    ? [workshop.code, workshop.name].filter(Boolean).join(' - ')
    : t('orders.labels.unassigned')
const taskLabel = (item) =>
  [item.maintenance_task?.code, item.maintenance_task?.name].filter(Boolean).join(' - ') ||
  t('orders.labels.taskNumber', { id: item.maintenance_task_id })
const planLabel = (item) =>
  item.maintenance_plan
    ? [item.maintenance_plan.code, item.maintenance_plan.name].filter(Boolean).join(' - ')
    : '-'
const systemLabel = (item) => item.maintenance_task?.vehicle_system?.name ?? '-'
const orderStatusLabel = (status) => t(`orders.status.${status}`)
const orderActionLabel = (status) => t(`orders.orderActions.${status}`)
const itemStatusLabel = (status) => t(`orders.itemStatus.${status}`)
const itemActionLabel = (status) => t(`orders.itemActions.${status}`)
const itemCountLabel = (count) =>
  count === 1
    ? t('orders.labels.itemCountOne', { count })
    : t('orders.labels.itemCountMany', { count })

const orderItems = computed(() => {
  if (!order.value) {
    return []
  }

  return [
    { icon: mdiCar, label: t('orders.fields.vehicle'), value: vehicleLabel(order.value.vehicle) },
    { icon: mdiCar, label: t('orders.fields.owner'), value: userLabel(order.value.owner) },
    { icon: mdiWrenchOutline, label: t('orders.fields.advisor'), value: userLabel(order.value.advisor) },
    { icon: mdiWrenchOutline, label: t('orders.fields.workshop'), value: workshopLabel(order.value.workshop) },
    { icon: mdiWrenchOutline, label: t('orders.fields.technician'), value: userLabel(order.value.technician) },
    { icon: mdiCalendar, label: t('orders.fields.created'), value: formatDate(order.value.created_at) },
    { icon: mdiCalendar, label: t('orders.fields.scheduled'), value: formatDate(order.value.scheduled_at) },
    { icon: mdiCalendar, label: t('orders.fields.started'), value: formatDate(order.value.started_at) },
    { icon: mdiCalendar, label: t('orders.fields.finished'), value: formatDate(order.value.finished_at) },
    { icon: mdiCalendar, label: t('orders.fields.delivered'), value: formatDate(order.value.delivered_at) },
    { icon: mdiCalendar, label: t('orders.fields.cancelled'), value: formatDate(order.value.cancelled_at) },
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
      :subtitle="t('orders.detail.subtitle')"
      :eyebrow="t('orders.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'orders' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('orders.actions.backToOrders')"
          :aria-label="t('orders.actions.backToOrders')"
        />
        <BaseButton
          v-for="status in availableOrderActions"
          :key="status"
          :color="actionColor(status)"
          :icon="actionIcon(status)"
          :title="orderActionLabel(status)"
          :aria-label="orderActionLabel(status)"
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
            :title="t('orders.actions.retry')"
            :aria-label="t('orders.actions.retry')"
            small
            @click="fetchOrder"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('orders.detail.loading') }}
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="!order && !errorMessage"
        :title="t('orders.detail.unavailableTitle')"
        :description="t('orders.detail.unavailableDescription')"
      />

      <div v-else-if="order" class="grid grid-cols-1 gap-6">
        <CardBox>
          <div class="mb-5 flex flex-wrap gap-2">
            <AppBadge
              :label="orderStatusLabel(order.status)"
              :color="orderStatusColor(order.status)"
            />
            <AppBadge :label="itemCountLabel(items.length)" color="info" />
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
            :empty-title="t('orders.items.emptyTitle')"
            :empty-description="t('orders.items.emptyDescription')"
          >
            <template #cell-task="{ row }">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ taskLabel(row) }}
                </p>
                <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                  {{ kilometersLabel(row.odometer_km) }}
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
                :label="itemStatusLabel(value)"
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
                  :title="itemActionLabel(status)"
                  :aria-label="itemActionLabel(status)"
                  :disabled="updatingStatus"
                  small
                  @click="updateItemStatus(row, status)"
                />
              </BaseButtons>
            </template>
          </AppDataTable>

          <AppEmptyState
            v-else
            :title="t('orders.items.emptyTitle')"
            :description="t('orders.items.emptyDescription')"
          />
        </CardBox>
      </div>
    </AppPage>
  </LayoutAuthenticated>
</template>

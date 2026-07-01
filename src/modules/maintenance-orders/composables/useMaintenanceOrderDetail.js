import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { normalizeApiError } from '@/api/errors.js'
import maintenanceOrderItemsApi from '@/modules/maintenance-orders/services/maintenanceOrderItemsService.js'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService.js'
import { useOperationalEventListener } from '@/modules/realtime/composables/useOperationalEventListener.js'
import { maintenanceOrderIdForEvent } from '@/modules/realtime/services/operationalEventsService.js'
import {
  orderItemStatusActions,
  orderStatusActions,
} from '@/modules/maintenance-orders/statusRules.js'

export function useMaintenanceOrderDetail(orderId, authStore) {
  const order = ref(null)
  const loading = ref(false)
  const updatingStatus = ref(false)
  const errorMessage = ref('')

  let realtimeRefreshTimer = null

  const items = computed(() => order.value?.items ?? [])
  const availableOrderActions = computed(() =>
    order.value ? orderStatusActions(order.value, authStore.roles, authStore.user) : [],
  )
  const availableItemActions = (item) =>
    orderItemStatusActions(
      { ...item, maintenance_order: order.value },
      authStore.roles,
      authStore.user,
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

  return {
    availableItemActions,
    availableOrderActions,
    errorMessage,
    fetchOrder,
    items,
    loading,
    order,
    updateItemStatus,
    updateOrderStatus,
    updatingStatus,
  }
}

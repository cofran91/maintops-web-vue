import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService'
import type { MaintenanceOrder } from '@/types/maintenanceOrder'
import type { MaintenanceOrderAction } from '@/modules/maintenance-orders/utils/orderStatusRules'

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const requestError = error as { code?: string; name?: string }

  return (
    requestError.code === 'ERR_CANCELED' ||
    requestError.name === 'AbortError' ||
    requestError.name === 'CanceledError'
  )
}

export const useMaintenanceOrderDetail = (orderId: Ref<string>) => {
  const order = ref<MaintenanceOrder | null>(null)
  const loading = ref(false)
  const updatingStatus = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchOrder = async () => {
    if (!orderId.value) {
      order.value = null
      errorMessage.value = 'No se encontró el identificador de la orden.'
      return
    }

    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''
    order.value = null

    try {
      order.value = await maintenanceOrdersApi.show(orderId.value, {
        signal: nextController.signal,
      })
    } catch (error) {
      if (!isCanceledRequest(error)) {
        errorMessage.value = normalizeApiError(error).message
      }
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const updateOrderStatus = async (status: MaintenanceOrderAction) => {
    if (!order.value) {
      return false
    }

    updatingStatus.value = true
    errorMessage.value = ''

    try {
      order.value = await maintenanceOrdersApi.updateStatus(order.value.id, status)
      return true
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
      return false
    } finally {
      updatingStatus.value = false
    }
  }

  watch(orderId, () => void fetchOrder(), { immediate: true })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    order,
    loading,
    updatingStatus,
    errorMessage,
    fetchOrder,
    updateOrderStatus,
  }
}

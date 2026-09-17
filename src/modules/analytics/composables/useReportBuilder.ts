import { computed, onBeforeUnmount, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService'
import type { MaintenanceOrder } from '@/types/maintenanceOrder'

export const useReportBuilder = () => {
  const orders = ref<MaintenanceOrder[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchOrders = async () => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const data = await maintenanceOrdersApi.index(
        { search: '', status: '', page: 1, per_page: 100 },
        { signal: nextController.signal },
      )
      orders.value = data.items
    } catch (error) {
      const requestError = error as { code?: string; name?: string }
      const canceled =
        requestError.code === 'ERR_CANCELED' ||
        requestError.name === 'AbortError' ||
        requestError.name === 'CanceledError'

      if (!canceled) {
        errorMessage.value = normalizeApiError(error).message
      }
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const workshopOptions = computed(() => {
    const workshops = new Map<number | null, { title: string; value: string }>()

    orders.value.forEach((order) => {
      const id = order.workshop?.id ?? null
      if (!workshops.has(id)) {
        workshops.set(id, {
          title: order.workshop?.name || order.workshop?.code || 'Sin taller asignado',
          value: id === null ? 'unassigned' : String(id),
        })
      }
    })

    return [...workshops.values()].sort((left, right) => left.title.localeCompare(right.title))
  })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    orders,
    workshopOptions,
    loading,
    errorMessage,
    fetchOrders,
  }
}

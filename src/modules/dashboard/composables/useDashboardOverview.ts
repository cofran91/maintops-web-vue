import { onBeforeUnmount, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import dashboardApi from '@/modules/dashboard/services/dashboardService'
import type { DashboardSummary } from '@/types/dashboard'

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

export const useDashboardOverview = () => {
  const summary = ref<DashboardSummary | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchSummary = async () => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      summary.value = await dashboardApi.summary({ signal: nextController.signal })
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

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    summary,
    loading,
    errorMessage,
    fetchSummary,
  }
}

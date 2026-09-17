import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService'
import type { MaintenancePlan } from '@/types/maintenancePlan'

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

export const useMaintenancePlanDetail = (planId: Ref<string>) => {
  const plan = ref<MaintenancePlan | null>(null)
  const loading = ref(false)
  const deleting = ref(false)
  const deleteDialogOpen = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchPlan = async () => {
    if (!planId.value) {
      plan.value = null
      errorMessage.value = 'No se encontró el identificador del plan.'
      return
    }

    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''
    plan.value = null

    try {
      plan.value = await maintenancePlansApi.show(planId.value, { signal: nextController.signal })
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

  const deletePlan = async () => {
    if (!plan.value) {
      return false
    }

    deleting.value = true
    errorMessage.value = ''

    try {
      await maintenancePlansApi.remove(plan.value.id)
      deleteDialogOpen.value = false
      return true
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
      return false
    } finally {
      deleting.value = false
    }
  }

  watch(planId, () => void fetchPlan(), { immediate: true })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    plan,
    loading,
    deleting,
    deleteDialogOpen,
    errorMessage,
    fetchPlan,
    deletePlan,
  }
}

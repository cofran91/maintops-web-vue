import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import type { Workshop } from '@/types/workshop'

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

export const useWorkshopDetail = (workshopId: Ref<string>) => {
  const workshop = ref<Workshop | null>(null)
  const loading = ref(false)
  const deleting = ref(false)
  const deleteDialogOpen = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchWorkshop = async () => {
    if (!workshopId.value) {
      workshop.value = null
      errorMessage.value = 'No se encontró el identificador del taller.'
      return
    }

    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''
    workshop.value = null

    try {
      workshop.value = await workshopsApi.show(workshopId.value, {
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

  const deleteWorkshop = async () => {
    if (!workshop.value) {
      return false
    }

    deleting.value = true
    errorMessage.value = ''

    try {
      await workshopsApi.remove(workshop.value.id)
      deleteDialogOpen.value = false
      return true
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
      return false
    } finally {
      deleting.value = false
    }
  }

  watch(workshopId, () => void fetchWorkshop(), { immediate: true })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    workshop,
    loading,
    deleting,
    deleteDialogOpen,
    errorMessage,
    fetchWorkshop,
    deleteWorkshop,
  }
}

import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import ownersApi from '@/modules/owners/services/ownersService'
import type { Owner } from '@/types/owner'

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

export const useOwnerDetail = (ownerId: Ref<string>) => {
  const owner = ref<Owner | null>(null)
  const loading = ref(false)
  const deleting = ref(false)
  const deleteDialogOpen = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchOwner = async () => {
    if (!ownerId.value) {
      owner.value = null
      errorMessage.value = 'No se encontró el identificador del propietario.'
      return
    }

    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''
    owner.value = null

    try {
      owner.value = await ownersApi.show(ownerId.value, {
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

  const deleteOwner = async () => {
    if (!owner.value) {
      return false
    }

    deleting.value = true
    errorMessage.value = ''

    try {
      await ownersApi.remove(owner.value.id)
      deleteDialogOpen.value = false
      return true
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
      return false
    } finally {
      deleting.value = false
    }
  }

  watch(ownerId, () => void fetchOwner(), { immediate: true })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    owner,
    loading,
    deleting,
    deleteDialogOpen,
    errorMessage,
    fetchOwner,
    deleteOwner,
  }
}

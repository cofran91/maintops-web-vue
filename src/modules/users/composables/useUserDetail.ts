import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import usersApi from '@/modules/users/services/usersService'
import type { User } from '@/types/user'

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

export const useUserDetail = (userId: Ref<string>) => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchUser = async () => {
    if (!userId.value) {
      user.value = null
      errorMessage.value = 'No se encontró el identificador del usuario.'
      return
    }

    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''
    user.value = null

    try {
      user.value = await usersApi.show(userId.value, {
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

  watch(userId, () => void fetchUser(), { immediate: true })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    user,
    loading,
    errorMessage,
    fetchUser,
  }
}

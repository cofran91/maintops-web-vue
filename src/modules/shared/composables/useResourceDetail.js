import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '@/api/errors.js'

export const useResourceDetail = ({
  fetcher,
  remover,
  routeParam = 'id',
  redirectTo,
  clearOnFetch = true,
}) => {
  const route = useRoute()
  const router = useRouter()
  const resource = ref(null)
  const loading = ref(false)
  const deleting = ref(false)
  const errorMessage = ref('')
  const deleteModalOpen = ref(false)

  const resourceId = computed(() => String(route.params[routeParam] ?? ''))

  const fetchResource = async () => {
    loading.value = true
    errorMessage.value = ''

    if (clearOnFetch) {
      resource.value = null
    }

    try {
      resource.value = await fetcher(resourceId.value)
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
    } finally {
      loading.value = false
    }
  }

  const deleteResource = async () => {
    if (!resource.value || !remover) {
      return
    }

    deleting.value = true
    errorMessage.value = ''

    try {
      await remover(resource.value.id)
      deleteModalOpen.value = false

      if (redirectTo) {
        await router.push(redirectTo)
      }
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
    } finally {
      deleting.value = false
    }
  }

  watch(
    resourceId,
    () => {
      void fetchResource()
    },
    { immediate: true },
  )

  return {
    resource,
    resourceId,
    loading,
    deleting,
    errorMessage,
    deleteModalOpen,
    fetchResource,
    deleteResource,
  }
}

import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import ownersApi from '@/modules/owners/services/ownersService'
import type { Owner, OwnerFilters, OwnerPage } from '@/types/owner'

const DEFAULT_PER_PAGE = 15

const DEFAULT_PAGINATION = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null as number | null,
  to: null as number | null,
}

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

export const useOwners = () => {
  const owners = ref<Owner[]>([])
  const filters = reactive<OwnerFilters>({ search: '', status: '' })
  const pagination = ref({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchOwners = async (page = pagination.value.current_page) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const data: OwnerPage = await ownersApi.index(
        {
          search: filters.search.trim(),
          is_active: filters.status === '' ? undefined : filters.status === 'active',
          page,
          per_page: perPage.value,
        },
        { signal: nextController.signal },
      )

      owners.value = data.items
      pagination.value = data.pagination
      perPage.value = data.pagination.per_page
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

  const applyFilters = () => {
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchOwners(1)
  }

  const clearFilters = () => {
    filters.search = ''
    filters.status = ''
    applyFilters()
  }

  const updatePage = (page: number) => {
    void fetchOwners(page)
  }

  const updatePerPage = (value: number) => {
    perPage.value = Number(value)
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchOwners(1)
  }

  onMounted(() => {
    void fetchOwners(1)
  })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    owners,
    filters,
    pagination,
    perPage,
    loading,
    errorMessage,
    fetchOwners,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

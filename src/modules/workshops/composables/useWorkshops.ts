import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import type { Workshop, WorkshopFilters, WorkshopPage } from '@/types/workshop'

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

export const useWorkshops = () => {
  const workshops = ref<Workshop[]>([])
  const filters = reactive<WorkshopFilters>({ search: '', city: '', status: '' })
  const pagination = ref({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchWorkshops = async (page = pagination.value.current_page) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const data: WorkshopPage = await workshopsApi.index(
        {
          search: filters.search.trim(),
          city: filters.city.trim(),
          is_active: filters.status === '' ? undefined : filters.status === 'active',
          page,
          per_page: perPage.value,
        },
        { signal: nextController.signal },
      )

      workshops.value = data.items
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
    void fetchWorkshops(1)
  }

  const clearFilters = () => {
    filters.search = ''
    filters.city = ''
    filters.status = ''
    applyFilters()
  }

  const updatePage = (page: number) => {
    void fetchWorkshops(page)
  }

  const updatePerPage = (value: number) => {
    perPage.value = Number(value)
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchWorkshops(1)
  }

  onMounted(() => {
    void fetchWorkshops(1)
  })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    workshops,
    filters,
    pagination,
    perPage,
    loading,
    errorMessage,
    fetchWorkshops,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

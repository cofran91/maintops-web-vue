import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import { buildListQuery, getNumberQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
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

const EMPTY_FILTERS: WorkshopFilters = {
  search: '',
  code: '',
  city: '',
  status: '',
  name: '',
  phone: '',
  email: '',
  manager_user_id: '',
  vehicle_system_id: '',
  created_from: '',
  created_to: '',
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
  const route = useRoute()
  const router = useRouter()
  const workshops = ref<Workshop[]>([])
  const filters = reactive<WorkshopFilters>({ ...EMPTY_FILTERS })
  const pagination = ref({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  const hasActiveFilters = computed(() =>
    Object.values(filters).some((value) => value !== ''),
  )
  let controller: AbortController | null = null

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, EMPTY_FILTERS)

    if (!['', 'active', 'inactive'].includes(filters.status)) {
      filters.status = ''
    }
  }

  const pushListQuery = (page: number, nextPerPage: number) =>
    router.push({
      name: 'workshops',
      query: buildListQuery(filters, page, nextPerPage, DEFAULT_PER_PAGE),
    })

  const fetchWorkshops = async (page = getNumberQuery(route.query.page, 1)) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = getNumberQuery(route.query.per_page, DEFAULT_PER_PAGE)
    perPage.value = currentPerPage
    loading.value = true
    errorMessage.value = ''

    try {
      const data: WorkshopPage = await workshopsApi.index(
        {
          search: filters.search.trim(),
          name: filters.name.trim(),
          code: filters.code.trim(),
          city: filters.city.trim(),
          phone: filters.phone.trim(),
          email: filters.email.trim(),
          is_active: filters.status === '' ? undefined : filters.status === 'active',
          manager_user_id: filters.manager_user_id.trim(),
          vehicle_system_id: filters.vehicle_system_id.trim(),
          created_from: filters.created_from,
          created_to: filters.created_to,
          page,
          per_page: currentPerPage,
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
    void pushListQuery(1, perPage.value)
  }

  const clearFilters = () => {
    Object.assign(filters, EMPTY_FILTERS)
    applyFilters()
  }

  const updatePage = (page: number) => {
    void pushListQuery(page, perPage.value)
  }

  const updatePerPage = (value: number) => {
    void pushListQuery(1, Number(value))
  }

  watch(
    () => route.query,
    () => {
      syncFiltersFromQuery()
      void fetchWorkshops()
    },
    { immediate: true },
  )

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
    hasActiveFilters,
    fetchWorkshops,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

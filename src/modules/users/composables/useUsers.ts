import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import usersApi from '@/modules/users/services/usersService'
import { buildListQuery, getNumberQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
import type { User, UserFilters, UserPage } from '@/types/user'

const DEFAULT_PER_PAGE = 15

const DEFAULT_PAGINATION = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null as number | null,
  to: null as number | null,
}

const EMPTY_FILTERS: UserFilters = {
  search: '',
  role: '',
  status: '',
  workshop_id: '',
  without_workshop: false,
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

export const useUsers = () => {
  const route = useRoute()
  const router = useRouter()
  const users = ref<User[]>([])
  const filters = reactive<UserFilters>({ ...EMPTY_FILTERS })
  const pagination = ref<UserPage['pagination']>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  const hasActiveFilters = computed(() =>
    Object.values(filters).some((value) => value !== '' && value !== false),
  )
  let controller: AbortController | null = null

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, EMPTY_FILTERS)

    if (!['', 'system_admin', 'admin', 'advisor', 'workshop_manager', 'technician'].includes(filters.role)) {
      filters.role = ''
    }

    if (!['', 'active', 'inactive'].includes(filters.status)) {
      filters.status = ''
    }
  }

  const pushListQuery = (page: number, nextPerPage: number) =>
    router.push({
      name: 'users',
      query: buildListQuery(filters, page, nextPerPage, DEFAULT_PER_PAGE),
    })

  const fetchUsers = async (page = getNumberQuery(route.query.page, 1)) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = getNumberQuery(route.query.per_page, DEFAULT_PER_PAGE)
    perPage.value = currentPerPage
    loading.value = true
    errorMessage.value = ''

    try {
      const data: UserPage = await usersApi.index(
        {
          search: filters.search.trim(),
          role: filters.role,
          status: filters.status,
          workshop_id: filters.workshop_id.trim(),
          without_workshop: filters.without_workshop,
          page,
          per_page: currentPerPage,
        },
        { signal: nextController.signal },
      )

      users.value = data.items
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
      void fetchUsers()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    users,
    filters,
    pagination,
    perPage,
    loading,
    errorMessage,
    hasActiveFilters,
    fetchUsers,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

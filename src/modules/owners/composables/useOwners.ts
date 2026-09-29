import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import ownersApi from '@/modules/owners/services/ownersService'
import { buildListQuery, getNumberQuery, replaceBrowserQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
import { useFilterAutoApply } from '@/modules/shared/composables/useFilterAutoApply'
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

const EMPTY_FILTERS: OwnerFilters = { search: '', status: '' }

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
  const route = useRoute()
  const owners = ref<Owner[]>([])
  const filters = reactive<OwnerFilters>({ ...EMPTY_FILTERS })
  const pagination = ref({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  const hasActiveFilters = computed(() => filters.search !== '' || filters.status !== '')
  let controller: AbortController | null = null

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, EMPTY_FILTERS)

    if (!['', 'active', 'inactive'].includes(filters.status)) {
      filters.status = ''
    }
  }

  const fetchOwners = async (page = pagination.value.current_page) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = perPage.value
    perPage.value = currentPerPage
    loading.value = true
    errorMessage.value = ''

    try {
      const data: OwnerPage = await ownersApi.index(
        {
          search: filters.search.trim(),
          is_active: filters.status === '' ? undefined : filters.status === 'active',
          page,
          per_page: currentPerPage,
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

  const updateList = (page: number, nextPerPage: number) => {
    perPage.value = nextPerPage
    replaceBrowserQuery(buildListQuery(filters, page, nextPerPage, DEFAULT_PER_PAGE))
    void fetchOwners(page)
  }

  const applyFilters = () => updateList(1, perPage.value)
  const filterAutoApply = useFilterAutoApply(filters, applyFilters, { immediateKeys: ['status'] })

  const clearFilters = () => {
    filterAutoApply.suspend(() => Object.assign(filters, EMPTY_FILTERS))
    applyFilters()
  }

  const updatePage = (page: number) => updateList(page, perPage.value)

  const updatePerPage = (value: number) => updateList(1, Number(value))

  watch(
    () => route.query,
    () => {
      filterAutoApply.suspend(syncFiltersFromQuery)
      perPage.value = getNumberQuery(route.query.per_page, DEFAULT_PER_PAGE)
      void fetchOwners(getNumberQuery(route.query.page, 1))
    },
    { immediate: true },
  )

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
    hasActiveFilters,
    fetchOwners,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

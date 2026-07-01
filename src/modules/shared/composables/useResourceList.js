import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '@/api/errors.js'
import { DEFAULT_PAGINATION_META } from '@/types/api.js'
import {
  buildListQuery,
  getNumberQuery,
  syncQueryFilters,
} from '@/modules/shared/utils/queryParams.js'

const hasDefaultActiveFilter = (value) => value !== '' && value !== false

export const useResourceList = ({
  routeName,
  emptyFilters,
  fetcher,
  toApiFilters = () => ({}),
  sanitizeFilters = () => undefined,
  defaultPerPage = DEFAULT_PAGINATION_META.per_page,
  hasActiveFilter = hasDefaultActiveFilter,
}) => {
  const route = useRoute()
  const router = useRouter()

  const items = ref([])
  const pagination = ref({ ...DEFAULT_PAGINATION_META })
  const loading = ref(false)
  const errorMessage = ref('')
  const filters = reactive({ ...emptyFilters })

  const hasActiveFilters = computed(() => Object.values(filters).some(hasActiveFilter))
  const canGoPrevious = computed(() => pagination.value.current_page > 1)
  const canGoNext = computed(
    () => pagination.value.current_page < pagination.value.last_page,
  )

  const currentPage = () => getNumberQuery(route.query.page, 1)
  const currentPerPage = () => getNumberQuery(route.query.per_page, defaultPerPage)

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, emptyFilters)
    sanitizeFilters(filters, route.query)
  }

  const fetchItems = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const data = await fetcher({
        search: filters.search || undefined,
        filters: toApiFilters(filters),
        page: currentPage(),
        per_page: currentPerPage(),
        route,
      })

      items.value = data.items
      pagination.value = data.pagination
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
    } finally {
      loading.value = false
    }
  }

  const pushListQuery = (page, perPage) =>
    router.push({
      name: routeName,
      query: buildListQuery(filters, page, perPage, defaultPerPage),
    })

  const applyFilters = () => {
    void pushListQuery(1, pagination.value.per_page)
  }

  const applyFiltersOnFocusOut = (event) => {
    const currentTarget = event.currentTarget
    const relatedTarget = event.relatedTarget

    if (
      currentTarget instanceof HTMLElement &&
      relatedTarget instanceof Node &&
      currentTarget.contains(relatedTarget)
    ) {
      return
    }

    window.setTimeout(() => {
      applyFilters()
    })
  }

  const clearFilters = () => {
    Object.assign(filters, emptyFilters)
    applyFilters()
  }

  const updatePage = (page) => {
    void pushListQuery(page, pagination.value.per_page)
  }

  const updatePerPage = (eventOrValue) => {
    const perPage = Number(
      typeof eventOrValue === 'number' ? eventOrValue : eventOrValue.target.value,
    )

    void pushListQuery(1, perPage)
  }

  watch(
    () => route.query,
    () => {
      syncFiltersFromQuery()
      void fetchItems()
    },
    { immediate: true },
  )

  return {
    items,
    pagination,
    loading,
    errorMessage,
    filters,
    hasActiveFilters,
    canGoPrevious,
    canGoNext,
    fetchItems,
    applyFilters,
    applyFiltersOnFocusOut,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

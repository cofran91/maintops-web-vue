import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService'
import { buildListQuery, getNumberQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
import type { MaintenancePlan, MaintenancePlanFilters, MaintenancePlanPage } from '@/types/maintenancePlan'

const DEFAULT_PER_PAGE = 15

const DEFAULT_PAGINATION = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null as number | null,
  to: null as number | null,
}

const EMPTY_FILTERS: MaintenancePlanFilters = {
  search: '',
  code: '',
  is_active: '',
  name: '',
  task_id: '',
  recommended_interval_days_from: '',
  recommended_interval_days_to: '',
  recommended_interval_km_from: '',
  recommended_interval_km_to: '',
  created_from: '',
  created_to: '',
}

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || requestError.name === 'AbortError' || requestError.name === 'CanceledError'
}

export const useMaintenancePlans = () => {
  const route = useRoute()
  const router = useRouter()
  const plans = ref<MaintenancePlan[]>([])
  const filters = reactive<MaintenancePlanFilters>({ ...EMPTY_FILTERS })
  const pagination = ref<MaintenancePlanPage['pagination']>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  const hasActiveFilters = computed(() => Object.values(filters).some((value) => value !== ''))
  let controller: AbortController | null = null

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, EMPTY_FILTERS)

    if (!['', 'active', 'inactive'].includes(filters.is_active)) {
      filters.is_active = ''
    }
  }

  const pushListQuery = (page: number, nextPerPage: number) => router.push({
    name: 'maintenance-plans',
    query: buildListQuery(filters, page, nextPerPage, DEFAULT_PER_PAGE),
  })

  const fetchPlans = async (page = getNumberQuery(route.query.page, 1)) => {
    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = getNumberQuery(route.query.per_page, DEFAULT_PER_PAGE)
    perPage.value = currentPerPage
    loading.value = true
    errorMessage.value = ''

    try {
      const data: MaintenancePlanPage = await maintenancePlansApi.index(
        {
          search: filters.search.trim(),
          code: filters.code.trim(),
          name: filters.name.trim(),
          is_active: filters.is_active,
          task_id: filters.task_id.trim(),
          recommended_interval_days_from: filters.recommended_interval_days_from.trim(),
          recommended_interval_days_to: filters.recommended_interval_days_to.trim(),
          recommended_interval_km_from: filters.recommended_interval_km_from.trim(),
          recommended_interval_km_to: filters.recommended_interval_km_to.trim(),
          created_from: filters.created_from,
          created_to: filters.created_to,
          page,
          per_page: currentPerPage,
        },
        { signal: nextController.signal },
      )

      plans.value = data.items
      pagination.value = data.pagination
      perPage.value = data.pagination.per_page
    } catch (error) {
      if (!isCanceledRequest(error)) errorMessage.value = normalizeApiError(error).message
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const applyFilters = () => void pushListQuery(1, perPage.value)
  const clearFilters = () => {
    Object.assign(filters, EMPTY_FILTERS)
    applyFilters()
  }
  const updatePage = (page: number) => void pushListQuery(page, perPage.value)
  const updatePerPage = (value: number) => void pushListQuery(1, Number(value))

  watch(
    () => route.query,
    () => {
      syncFiltersFromQuery()
      void fetchPlans()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return { plans, filters, pagination, perPage, loading, errorMessage, hasActiveFilters, fetchPlans, applyFilters, clearFilters, updatePage, updatePerPage }
}

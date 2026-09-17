import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
import { buildListQuery, getNumberQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
import type { Vehicle, VehicleFilters, VehiclePage, VehiclePagination } from '@/types/vehicle'

const DEFAULT_PER_PAGE = 15

const DEFAULT_PAGINATION: VehiclePagination = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null,
  to: null,
}

const EMPTY_FILTERS: VehicleFilters = {
  search: '',
  license_plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  owner_id: '',
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

export const useVehicles = () => {
  const route = useRoute()
  const router = useRouter()
  const vehicles = ref<Vehicle[]>([])
  const filters = reactive<VehicleFilters>({ ...EMPTY_FILTERS })
  const pagination = ref<VehiclePagination>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  const hasActiveFilters = computed(() =>
    Object.values(filters).some((value) => value !== ''),
  )
  let controller: AbortController | null = null

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, EMPTY_FILTERS)
  }

  const pushListQuery = (page: number, nextPerPage: number) =>
    router.push({
      name: 'vehicles',
      query: buildListQuery(filters, page, nextPerPage, DEFAULT_PER_PAGE),
    })

  const fetchVehicles = async (page = getNumberQuery(route.query.page, 1)) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = getNumberQuery(route.query.per_page, DEFAULT_PER_PAGE)
    perPage.value = currentPerPage
    loading.value = true
    errorMessage.value = ''

    try {
      const data: VehiclePage = await vehiclesApi.index(
        {
          search: filters.search.trim(),
          license_plate: filters.license_plate.trim(),
          brand: filters.brand.trim(),
          model: filters.model.trim(),
          year: filters.year.trim(),
          color: filters.color.trim(),
          owner_id: filters.owner_id.trim(),
          created_from: filters.created_from,
          created_to: filters.created_to,
          page,
          per_page: currentPerPage,
        },
        { signal: nextController.signal },
      )

      vehicles.value = data.items
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
      void fetchVehicles()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    vehicles,
    filters,
    pagination,
    perPage,
    loading,
    errorMessage,
    hasActiveFilters,
    fetchVehicles,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
import { buildListQuery, getNumberQuery, replaceBrowserQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
import { useFilterAutoApply } from '@/modules/shared/composables/useFilterAutoApply'
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

  const fetchVehicles = async (page = pagination.value.current_page) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = perPage.value
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

  const updateList = (page: number, nextPerPage: number) => {
    perPage.value = nextPerPage
    replaceBrowserQuery(buildListQuery(filters, page, nextPerPage, DEFAULT_PER_PAGE))
    void fetchVehicles(page)
  }

  const applyFilters = () => updateList(1, perPage.value)
  const filterAutoApply = useFilterAutoApply(filters, applyFilters, { immediateKeys: ['owner_id'] })

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
      void fetchVehicles(getNumberQuery(route.query.page, 1))
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

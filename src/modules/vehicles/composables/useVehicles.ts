import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
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
  const vehicles = ref<Vehicle[]>([])
  const filters = reactive<VehicleFilters>({
    search: '',
    brand: '',
    model: '',
    year: '',
  })
  const pagination = ref<VehiclePagination>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchVehicles = async (page = pagination.value.current_page) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const data: VehiclePage = await vehiclesApi.index(
        {
          search: filters.search.trim(),
          brand: filters.brand.trim(),
          model: filters.model.trim(),
          year: filters.year.trim(),
          page,
          per_page: perPage.value,
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
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchVehicles(1)
  }

  const clearFilters = () => {
    filters.search = ''
    filters.brand = ''
    filters.model = ''
    filters.year = ''
    applyFilters()
  }

  const updatePage = (page: number) => {
    void fetchVehicles(page)
  }

  const updatePerPage = (value: number) => {
    perPage.value = Number(value)
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchVehicles(1)
  }

  onMounted(() => {
    void fetchVehicles(1)
  })

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
    fetchVehicles,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

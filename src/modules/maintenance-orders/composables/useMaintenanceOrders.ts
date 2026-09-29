import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService'
import { buildListQuery, getNumberQuery, replaceBrowserQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
import { useFilterAutoApply } from '@/modules/shared/composables/useFilterAutoApply'
import { MAINTENANCE_ORDER_STATUSES } from '@/types/maintenanceOrder'
import type { MaintenanceOrder, MaintenanceOrderFilters, MaintenanceOrderPage, MaintenanceOrderPagination } from '@/types/maintenanceOrder'

const DEFAULT_PER_PAGE = 15

const DEFAULT_PAGINATION: MaintenanceOrderPagination = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null,
  to: null,
}

const EMPTY_FILTERS: MaintenanceOrderFilters = {
  search: '',
  status: '',
  vehicle_id: '',
  owner_id: '',
  advisor_id: '',
  workshop_id: '',
  without_workshop: false,
  technician_id: '',
  without_technician: false,
  scheduled_from: '',
  scheduled_to: '',
  started_from: '',
  started_to: '',
  finished_from: '',
  finished_to: '',
  delivered_from: '',
  delivered_to: '',
  cancelled_from: '',
  cancelled_to: '',
  created_from: '',
  created_to: '',
}

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || requestError.name === 'AbortError' || requestError.name === 'CanceledError'
}

export const useMaintenanceOrders = () => {
  const route = useRoute()
  const orders = ref<MaintenanceOrder[]>([])
  const filters = reactive<MaintenanceOrderFilters>({ ...EMPTY_FILTERS })
  const pagination = ref<MaintenanceOrderPagination>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  const hasActiveFilters = computed(() => Object.values(filters).some((value) => value !== '' && value !== false))
  let controller: AbortController | null = null

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, EMPTY_FILTERS)
    if (!MAINTENANCE_ORDER_STATUSES.includes(filters.status as typeof MAINTENANCE_ORDER_STATUSES[number])) filters.status = ''
    if (filters.without_workshop) filters.workshop_id = ''
    if (filters.without_technician) filters.technician_id = ''
  }

  const fetchOrders = async (page = pagination.value.current_page) => {
    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = perPage.value
    perPage.value = currentPerPage
    loading.value = true
    errorMessage.value = ''

    try {
      const data: MaintenanceOrderPage = await maintenanceOrdersApi.index(
        {
          search: filters.search.trim(),
          status: filters.status,
          vehicle_id: filters.vehicle_id.trim(),
          owner_id: filters.owner_id.trim(),
          advisor_id: filters.advisor_id.trim(),
          workshop_id: filters.workshop_id.trim(),
          without_workshop: filters.without_workshop,
          technician_id: filters.technician_id.trim(),
          without_technician: filters.without_technician,
          scheduled_from: filters.scheduled_from,
          scheduled_to: filters.scheduled_to,
          started_from: filters.started_from,
          started_to: filters.started_to,
          finished_from: filters.finished_from,
          finished_to: filters.finished_to,
          delivered_from: filters.delivered_from,
          delivered_to: filters.delivered_to,
          cancelled_from: filters.cancelled_from,
          cancelled_to: filters.cancelled_to,
          created_from: filters.created_from,
          created_to: filters.created_to,
          page,
          per_page: currentPerPage,
        },
        { signal: nextController.signal },
      )

      orders.value = data.items
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

  const updateList = (page: number, nextPerPage: number) => {
    perPage.value = nextPerPage
    replaceBrowserQuery(buildListQuery(filters, page, nextPerPage, DEFAULT_PER_PAGE))
    void fetchOrders(page)
  }

  const applyFilters = () => updateList(1, perPage.value)
  const filterAutoApply = useFilterAutoApply(filters, applyFilters, {
    immediateKeys: ['status', 'vehicle_id', 'owner_id', 'advisor_id', 'workshop_id', 'technician_id', 'without_workshop', 'without_technician'],
  })
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
      void fetchOrders(getNumberQuery(route.query.page, 1))
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return { orders, filters, pagination, perPage, loading, errorMessage, hasActiveFilters, fetchOrders, applyFilters, clearFilters, updatePage, updatePerPage }
}

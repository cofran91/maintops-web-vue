import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { normalizeApiError } from '@/api/errors'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService'
import { buildListQuery, getNumberQuery, replaceBrowserQuery, syncQueryFilters } from '@/modules/shared/utils/queryParams'
import { useFilterAutoApply } from '@/modules/shared/composables/useFilterAutoApply'
import type { MaintenanceTask, MaintenanceTaskFilters, MaintenanceTaskPage, MaintenanceTaskPagination } from '@/types/maintenanceTask'

const DEFAULT_PER_PAGE = 15

const DEFAULT_PAGINATION: MaintenanceTaskPagination = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null,
  to: null,
}

const EMPTY_FILTERS: MaintenanceTaskFilters = {
  search: '',
  code: '',
  vehicle_system_id: '',
  status: '',
  name: '',
  is_active: '',
  estimated_duration_from: '',
  estimated_duration_to: '',
  vehicle_id: '',
  without_vehicle: false,
  created_from: '',
  created_to: '',
}

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || requestError.name === 'AbortError' || requestError.name === 'CanceledError'
}

export const useMaintenanceTasks = () => {
  const route = useRoute()
  const tasks = ref<MaintenanceTask[]>([])
  const filters = reactive<MaintenanceTaskFilters>({ ...EMPTY_FILTERS })
  const pagination = ref<MaintenanceTaskPagination>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  const hasActiveFilters = computed(() => Object.values(filters).some((value) => value !== '' && value !== false))
  let controller: AbortController | null = null

  const syncFiltersFromQuery = () => {
    syncQueryFilters(filters, route.query, EMPTY_FILTERS)

    if (!['', 'created', 'scheduled', 'started', 'cancelled', 'completed', 'rejected'].includes(filters.status)) {
      filters.status = ''
    }

    if (!['', 'active', 'inactive'].includes(filters.is_active)) {
      filters.is_active = ''
    }
  }

  const fetchTasks = async (page = pagination.value.current_page) => {
    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    const currentPerPage = perPage.value
    perPage.value = currentPerPage
    loading.value = true
    errorMessage.value = ''

    try {
      const data: MaintenanceTaskPage = await maintenanceTasksApi.index(
        {
          search: filters.search.trim(),
          code: filters.code.trim(),
          name: filters.name.trim(),
          vehicle_system_id: filters.vehicle_system_id.trim(),
          status: filters.status,
          is_active: filters.is_active,
          estimated_duration_from: filters.estimated_duration_from.trim(),
          estimated_duration_to: filters.estimated_duration_to.trim(),
          vehicle_id: filters.vehicle_id.trim(),
          without_vehicle: filters.without_vehicle,
          created_from: filters.created_from,
          created_to: filters.created_to,
          page,
          per_page: currentPerPage,
        },
        { signal: nextController.signal },
      )

      tasks.value = data.items
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
    void fetchTasks(page)
  }

  const applyFilters = () => updateList(1, perPage.value)
  const filterAutoApply = useFilterAutoApply(filters, applyFilters, {
    immediateKeys: ['vehicle_system_id', 'status', 'is_active', 'vehicle_id', 'without_vehicle'],
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
      void fetchTasks(getNumberQuery(route.query.page, 1))
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return { tasks, filters, pagination, perPage, loading, errorMessage, hasActiveFilters, fetchTasks, applyFilters, clearFilters, updatePage, updatePerPage }
}

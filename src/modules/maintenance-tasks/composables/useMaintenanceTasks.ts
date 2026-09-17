import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService'
import type { MaintenanceTask, MaintenanceTaskFilters, MaintenanceTaskPage, MaintenanceTaskPagination } from '@/types/maintenanceTask'

const DEFAULT_PAGINATION: MaintenanceTaskPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
}

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || requestError.name === 'AbortError' || requestError.name === 'CanceledError'
}

export const useMaintenanceTasks = () => {
  const tasks = ref<MaintenanceTask[]>([])
  const filters = reactive<MaintenanceTaskFilters>({ search: '', vehicle_system_id: '', status: '', is_active: '' })
  const pagination = ref<MaintenanceTaskPagination>({ ...DEFAULT_PAGINATION })
  const perPage = ref(15)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchTasks = async (page = 1) => {
    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const data: MaintenanceTaskPage = await maintenanceTasksApi.index({ ...filters, page, per_page: perPage.value }, { signal: nextController.signal })
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

  const applyFilters = () => void fetchTasks(1)
  const clearFilters = () => {
    filters.search = ''
    filters.vehicle_system_id = ''
    filters.status = ''
    filters.is_active = ''
    applyFilters()
  }
  const updatePage = (page: number) => void fetchTasks(page)
  const updatePerPage = (value: number) => {
    perPage.value = Number(value)
    void fetchTasks(1)
  }

  onMounted(() => void fetchTasks())
  onBeforeUnmount(() => controller?.abort())

  return { tasks, filters, pagination, perPage, loading, errorMessage, fetchTasks, applyFilters, clearFilters, updatePage, updatePerPage }
}

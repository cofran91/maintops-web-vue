import { onBeforeUnmount, ref, type Ref, watch } from 'vue'
import { normalizeApiError } from '@/api/errors'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService'
import type { MaintenanceTask } from '@/types/maintenanceTask'

export const useMaintenanceTaskDetail = (taskId: Ref<string>) => {
  const task = ref<MaintenanceTask | null>(null)
  const loading = ref(false)
  const deleting = ref(false)
  const errorMessage = ref('')
  const deleteDialogOpen = ref(false)
  let controller: AbortController | null = null

  const fetchTask = async () => {
    if (!taskId.value) {
      task.value = null
      return
    }

    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      task.value = await maintenanceTasksApi.show(taskId.value, { signal: nextController.signal })
    } catch (error) {
      const requestError = error as { code?: string; name?: string }
      const canceled = requestError.code === 'ERR_CANCELED' || requestError.name === 'AbortError' || requestError.name === 'CanceledError'
      if (!canceled) {
        task.value = null
        errorMessage.value = normalizeApiError(error).message
      }
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const deleteTask = async () => {
    if (!task.value) return false
    deleting.value = true
    errorMessage.value = ''

    try {
      await maintenanceTasksApi.remove(task.value.id)
      deleteDialogOpen.value = false
      return true
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
      return false
    } finally {
      deleting.value = false
    }
  }

  watch(taskId, () => void fetchTask(), { immediate: true })
  onBeforeUnmount(() => controller?.abort())

  return { task, loading, deleting, errorMessage, deleteDialogOpen, fetchTask, deleteTask }
}

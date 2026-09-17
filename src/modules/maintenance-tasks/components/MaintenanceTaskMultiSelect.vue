<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { mdiMagnify, mdiRefresh, mdiWrenchOutline } from '@mdi/js'
import { normalizeApiError } from '@/api/errors'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService'
import type { MaintenanceTask } from '@/types/maintenanceTask'

const props = defineProps({
  modelValue: { type: Array as PropType<Array<number | string>>, default: () => [] },
  selectedItems: { type: Array as PropType<MaintenanceTask[]>, default: () => [] },
  activeOnly: { type: Boolean, default: true },
  disabled: Boolean,
  label: { type: String, default: 'Actividades del plan' },
  placeholder: { type: String, default: 'Busca por código o nombre' },
  errorMessages: { type: [String, Array] as PropType<string | string[]>, default: '' },
  perPage: { type: Number, default: 10 },
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: number[]): void
}>()

const search = ref('')
const options = ref<MaintenanceTask[]>([])
const loading = ref(false)
const menuOpen = ref(false)
const errorMessage = ref('')
const page = ref(1)
const lastPage = ref(1)
let searchTimer: number | undefined
let requestId = 0
let syncRequestId = 0
let controller: AbortController | null = null

const selectedIds = computed(() => props.modelValue
  .map((value) => Number(value))
  .filter((value) => Number.isInteger(value) && value > 0))
const hasMorePages = computed(() => page.value < lastPage.value)
const allOptions = computed(() => mergeTasks([...props.selectedItems, ...options.value]))
const taskOptions = computed(() => allOptions.value.map((task) => ({
  ...task,
  label: [task.code, task.name].filter(Boolean).join(' · '),
  meta: [task.vehicle_system?.name, task.vehicle?.license_plate || 'Reutilizable'].filter(Boolean).join(' · '),
})))
const displayErrors = computed(() => {
  if (errorMessage.value) {
    return [errorMessage.value]
  }

  return props.errorMessages
})

function mergeTasks(nextTasks: MaintenanceTask[]) {
  const taskMap = new Map<number, MaintenanceTask>()
  nextTasks.forEach((task) => {
    if (task?.id) taskMap.set(Number(task.id), task)
  })
  return Array.from(taskMap.values())
}

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || requestError.name === 'AbortError' || requestError.name === 'CanceledError'
}

const loadPage = async (reset = false) => {
  if (props.disabled || (loading.value && !reset) || (!reset && !hasMorePages.value)) return

  controller?.abort()
  controller = new AbortController()
  const currentRequestId = ++requestId
  const nextPage = reset ? 1 : page.value + 1
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await maintenanceTasksApi.index({
      search: search.value.trim(),
      is_active: props.activeOnly ? 'active' : '',
      page: nextPage,
      per_page: props.perPage,
    }, { signal: controller.signal })

    if (currentRequestId !== requestId) return
    options.value = reset ? mergeTasks([...props.selectedItems, ...result.items]) : mergeTasks([...options.value, ...result.items])
    page.value = result.pagination.current_page || nextPage
    lastPage.value = result.pagination.last_page || page.value
  } catch (error) {
    if (currentRequestId === requestId && !isCanceledRequest(error)) errorMessage.value = normalizeApiError(error).message
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
      controller = null
    }
  }
}

const syncSelectedItems = async () => {
  const currentSyncRequestId = ++syncRequestId
  const knownIds = new Set(allOptions.value.map((task) => Number(task.id)))
  const missingIds = selectedIds.value.filter((id) => !knownIds.has(id))
  if (!missingIds.length) return

  const fetchedTasks: MaintenanceTask[] = []
  for (const id of missingIds) {
    try {
      fetchedTasks.push(await maintenanceTasksApi.show(id))
    } catch {
      // The API remains the source of truth if a selected task was removed.
    }
  }

  if (currentSyncRequestId === syncRequestId) options.value = mergeTasks([...fetchedTasks, ...options.value])
}

const handleMenu = (open: boolean) => {
  menuOpen.value = open
  if (open && options.value.length === 0) void loadPage(true)
}

const handleSearch = () => {
  if (!menuOpen.value || props.disabled) return
  if (searchTimer) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => void loadPage(true), 300)
}

const emitSelection = (value: unknown) => {
  const ids = Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
    : []
  emit('update:modelValue', ids)
}

watch(() => props.selectedItems, () => {
  options.value = mergeTasks([...props.selectedItems, ...options.value])
  void syncSelectedItems()
}, { deep: true, immediate: true })
watch(() => props.modelValue, () => void syncSelectedItems(), { deep: true, immediate: true })
watch(search, handleSearch)

onBeforeUnmount(() => {
  if (searchTimer) window.clearTimeout(searchTimer)
  controller?.abort()
})
</script>

<template>
  <v-autocomplete
    :model-value="selectedIds"
    :disabled="disabled"
    :error-messages="displayErrors"
    hide-details="auto"
    :items="taskOptions"
    item-title="label"
    item-value="id"
    :label="label"
    :loading="loading"
    multiple
    :placeholder="placeholder"
    variant="outlined"
    v-model:search="search"
    @update:model-value="emitSelection"
    @update:menu="handleMenu"
  >
    <template #prepend-inner><v-icon :icon="mdiMagnify" /></template>
    <template #selection="{ item, index }">
      <v-chip v-if="index < 3" class="maintenance-task-picker-chip" closable size="small" @click:close="emitSelection(selectedIds.filter((id) => id !== Number(item.value)))">
        <v-icon :icon="mdiWrenchOutline" class="mr-1" size="13" />{{ item.title }}
      </v-chip>
      <span v-else-if="index === 3" class="text-caption text-medium-emphasis">+{{ selectedIds.length - 3 }} más</span>
    </template>
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" :title="item.raw.label" :subtitle="item.raw.meta">
        <template #prepend><v-icon :icon="mdiWrenchOutline" color="primary" size="18" /></template>
      </v-list-item>
    </template>
    <template #append-item>
      <v-list-item v-if="hasMorePages && !loading" class="maintenance-task-picker-more" @click.stop="loadPage(false)">
        <template #prepend><v-icon :icon="mdiRefresh" size="16" /></template>
        <v-list-item-title>Cargar más actividades</v-list-item-title>
      </v-list-item>
      <v-list-item v-else-if="loading && options.length > 0" disabled>
        <v-list-item-title>Cargando actividades…</v-list-item-title>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item><v-list-item-title>{{ loading ? 'Buscando actividades…' : 'No hay actividades disponibles' }}</v-list-item-title></v-list-item>
    </template>
  </v-autocomplete>
</template>

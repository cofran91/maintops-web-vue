<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { mdiMagnify, mdiRefresh, mdiWrenchOutline } from '@mdi/js'
import { normalizeApiError } from '@/api/errors'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService'
import type { MaintenanceTask } from '@/types/maintenanceTask'

const props = defineProps({
  modelValue: { type: [Number, String, null] as PropType<number | string | null>, default: null },
  activeOnly: { type: Boolean, default: true },
  disabled: Boolean,
  label: { type: String, default: 'Actividad' },
  placeholder: { type: String, default: 'Busca por código o nombre' },
  errorMessages: { type: [String, Array] as PropType<string | string[]>, default: '' },
  perPage: { type: Number, default: 10 },
})

const emit = defineEmits<{ (event: 'update:modelValue', value: number | null): void }>()
const search = ref('')
const options = ref<MaintenanceTask[]>([])
const loading = ref(false)
const menuOpen = ref(false)
const localError = ref('')
let timer: number | undefined
let requestId = 0

const selectedId = computed(() => {
  const value = Number(props.modelValue)
  return Number.isInteger(value) && value > 0 ? value : null
})
const taskOptions = computed(() => options.value.map((task) => ({
  ...task,
  label: [task.code, task.name].filter(Boolean).join(' · '),
  meta: [task.vehicle_system?.name, task.vehicle?.license_plate || 'Reutilizable'].filter(Boolean).join(' · '),
})))
const displayErrors = computed(() => localError.value ? [localError.value] : props.errorMessages)

const loadOptions = async () => {
  if (props.disabled) return
  const currentRequestId = ++requestId
  loading.value = true
  localError.value = ''
  try {
    const result = await maintenanceTasksApi.index({
      search: search.value.trim(),
      is_active: props.activeOnly ? 'active' : '',
      page: 1,
      per_page: props.perPage,
    })
    if (currentRequestId === requestId) options.value = result.items
  } catch (error) {
    if (currentRequestId === requestId) localError.value = normalizeApiError(error).message
  } finally {
    if (currentRequestId === requestId) loading.value = false
  }
}

const syncSelected = async () => {
  if (!selectedId.value || options.value.some((task) => task.id === selectedId.value)) return
  try {
    const task = await maintenanceTasksApi.show(selectedId.value)
    options.value = [task, ...options.value.filter((item) => item.id !== task.id)]
    search.value = [task.code, task.name].filter(Boolean).join(' · ')
  } catch {
    emit('update:modelValue', null)
  }
}

const handleMenu = (open: boolean) => {
  menuOpen.value = open
  if (open && options.value.length === 0) void loadOptions()
}

const handleSearch = () => {
  if (!menuOpen.value || props.disabled) return
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => void loadOptions(), 300)
}

const updateValue = (value: unknown) => {
  const id = Number(value)
  emit('update:modelValue', Number.isInteger(id) && id > 0 ? id : null)
}

watch(() => props.modelValue, () => void syncSelected(), { immediate: true })
watch(search, handleSearch)
onBeforeUnmount(() => {
  if (timer) window.clearTimeout(timer)
})
</script>

<template>
  <v-autocomplete
    :model-value="selectedId"
    :disabled="disabled"
    :error-messages="displayErrors"
    hide-details="auto"
    :items="taskOptions"
    item-title="label"
    item-value="id"
    :label="label"
    :loading="loading"
    clearable
    :placeholder="placeholder"
    variant="outlined"
    v-model:search="search"
    @update:model-value="updateValue"
    @update:menu="handleMenu"
  >
    <template #prepend-inner><v-icon :icon="mdiMagnify" /></template>
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" :title="item.raw.label" :subtitle="item.raw.meta">
        <template #prepend><v-icon :icon="mdiWrenchOutline" color="primary" size="18" /></template>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item><v-list-item-title>{{ loading ? 'Buscando actividades…' : 'No hay actividades disponibles' }}</v-list-item-title></v-list-item>
    </template>
    <template #append-inner><v-icon v-if="loading" :icon="mdiRefresh" class="maintenance-task-picker-spin" size="16" /></template>
  </v-autocomplete>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'
import AsyncEntityMultiSelect from '@/modules/shared/components/AsyncEntityMultiSelect.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  selectedItems: {
    type: Array,
    default: () => [],
  },
  activeOnly: {
    type: Boolean,
    default: true,
  },
  disabled: Boolean,
  inputId: String,
  name: String,
  placeholder: {
    type: String,
    default: null,
  },
  perPage: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])
const { t } = useI18n()

const resolvedPlaceholder = computed(() =>
  props.placeholder ?? t('maintenanceTasks.combobox.placeholder'),
)

const taskLabel = (task) => {
  if (!task) {
    return ''
  }

  return [task.code, task.name].filter(Boolean).join(' - ')
}

const taskMeta = (task) =>
  [task.vehicle_system?.name, task.vehicle?.license_plate ?? t('maintenanceTasks.labels.reusable')]
    .filter(Boolean)
    .join(' / ')

const fetchOptions = ({ search, page, perPage }) =>
  maintenanceTasksApi.index({
    search: search || undefined,
    filters: props.activeOnly ? { is_active: true } : {},
    page,
    per_page: perPage,
  })

const fetchSelected = (id) => maintenanceTasksApi.show(id)
</script>

<template>
  <AsyncEntityMultiSelect
    :model-value="modelValue"
    :selected-items="selectedItems"
    :disabled="disabled"
    :input-id="inputId"
    :name="name"
    :placeholder="resolvedPlaceholder"
    :per-page="perPage"
    :fetch-options="fetchOptions"
    :fetch-selected="fetchSelected"
    :get-option-label="taskLabel"
    :get-option-meta="taskMeta"
    :empty-selection-label="t('maintenanceTasks.combobox.noTasksSelected')"
    :remove-label="(task) => t('maintenanceTasks.combobox.remove', { name: taskLabel(task) })"
    :show-label="t('maintenanceTasks.combobox.show')"
    :loading-label="t('maintenanceTasks.combobox.loading')"
    :empty-label="t('maintenanceTasks.combobox.empty')"
    :loading-more-label="t('maintenanceTasks.combobox.loadingMore')"
    @update:model-value="emit('update:modelValue', $event)"
    @select="emit('select', $event)"
  />
</template>

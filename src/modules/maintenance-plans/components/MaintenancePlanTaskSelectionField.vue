<script setup>
import { useI18n } from 'vue-i18n'
import FormField from '@/components/FormField.vue'
import MaintenanceTaskMultiSelect from '@/modules/maintenance-tasks/components/MaintenanceTaskMultiSelect.vue'

defineProps({
  taskIds: {
    type: Array,
    required: true,
  },
  selectedItems: {
    type: Array,
    required: true,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-task-ids', 'select'])
const { t } = useI18n()
</script>

<template>
  <FormField :label="t('maintenancePlans.fields.tasks')" label-for="task_ids" :error="error">
    <MaintenanceTaskMultiSelect
      :model-value="taskIds"
      input-id="task_ids"
      name="task_ids"
      :placeholder="t('maintenancePlans.filters.taskPlaceholder')"
      :selected-items="selectedItems"
      @update:model-value="emit('update-task-ids', $event)"
      @select="emit('select', $event)"
    />
  </FormField>
</template>

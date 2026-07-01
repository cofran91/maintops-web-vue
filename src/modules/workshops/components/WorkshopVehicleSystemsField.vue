<script setup>
import { useI18n } from 'vue-i18n'
import FormField from '@/components/FormField.vue'

const props = defineProps({
  selectedIds: {
    type: Array,
    required: true,
  },
  vehicleSystems: {
    type: Array,
    required: true,
  },
  error: {
    type: String,
    default: '',
  },
})

defineEmits(['update-system'])
const { t } = useI18n()

const isSelected = (id) =>
  props.selectedIds.some((selectedId) => Number(selectedId) === Number(id))
</script>

<template>
  <FormField :label="t('workshops.fields.vehicleSystems')" :error="error">
    <div class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      <label
        v-for="system in vehicleSystems"
        :key="system.id"
        class="flex min-h-11 items-center gap-2 rounded-sm border border-gray-700 px-3 py-2"
      >
        <input
          type="checkbox"
          :value="system.id"
          :checked="isSelected(system.id)"
          @change="$emit('update-system', system.id, $event.target.checked)"
        >
        <span class="text-sm font-semibold text-gray-900 dark:text-slate-100">
          {{ system.name }}
        </span>
      </label>
    </div>
    <p v-if="vehicleSystems.length === 0" class="mt-2 text-sm text-gray-500">
      {{ t('workshops.form.noVehicleSystems') }}
    </p>
  </FormField>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import FormField from '@/components/FormField.vue'

defineProps({
  rows: {
    type: Array,
    required: true,
  },
  fieldError: {
    type: String,
    default: '',
  },
  scheduleError: {
    type: Function,
    required: true,
  },
  dayLabel: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update-row'])
const { t } = useI18n()

const updateRow = (index, field, value) => {
  emit('update-row', index, field, value)
}
</script>

<template>
  <FormField :label="t('workshops.fields.weeklySchedule')" :error="fieldError">
    <div class="overflow-hidden rounded-sm border border-gray-700">
      <div
        v-for="(day, index) in rows"
        :key="day.key"
        class="grid grid-cols-1 gap-3 border-b border-gray-200 p-3 last:border-b-0
          md:grid-cols-[minmax(0,1fr)_150px_150px] md:items-end
          dark:border-slate-700"
      >
        <label
          class="flex items-center gap-2 font-semibold text-gray-900
            dark:text-slate-100"
        >
          <input
            type="checkbox"
            :checked="day.enabled"
            @change="updateRow(index, 'enabled', $event.target.checked)"
          >
          {{ dayLabel(day.key) }}
        </label>
        <label class="grid gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
          {{ t('workshops.fields.opens') }}
          <input
            :value="day.opens_at"
            type="time"
            :disabled="!day.enabled"
            class="h-10 rounded-sm border border-gray-700 bg-white px-2 dark:bg-slate-800"
            @input="updateRow(index, 'opens_at', $event.target.value)"
          >
        </label>
        <label class="grid gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
          {{ t('workshops.fields.closes') }}
          <input
            :value="day.closes_at"
            type="time"
            :disabled="!day.enabled"
            class="h-10 rounded-sm border border-gray-700 bg-white px-2 dark:bg-slate-800"
            @input="updateRow(index, 'closes_at', $event.target.value)"
          >
        </label>
        <p v-if="scheduleError(day.key)" class="text-sm text-red-600 md:col-span-3">
          {{ scheduleError(day.key) }}
        </p>
      </div>
    </div>
  </FormField>
</template>

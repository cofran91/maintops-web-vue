<script setup>
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'

defineProps({
  filters: {
    type: Object,
    required: true,
  },
  loading: Boolean,
  canEditWorkshopFilter: Boolean,
})

const emit = defineEmits(['apply', 'reset', 'update-filter'])
const { t } = useI18n()

const updateFilter = (key, value) => {
  emit('update-filter', key, value)
}
</script>

<template>
  <CardBox class="mb-6">
    <form class="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:items-end" @submit.prevent="emit('apply')">
      <FormField :label="t('analytics.filters.startDate')">
        <FormControl
          :model-value="filters.startDate"
          name="start_date"
          type="date"
          @update:model-value="updateFilter('startDate', $event)"
        />
      </FormField>
      <FormField :label="t('analytics.filters.endDate')">
        <FormControl
          :model-value="filters.endDate"
          name="end_date"
          type="date"
          @update:model-value="updateFilter('endDate', $event)"
        />
      </FormField>
      <FormField :label="t('analytics.filters.technicianId')">
        <FormControl
          :model-value="filters.technicianId"
          name="technician_id"
          inputmode="numeric"
          :placeholder="t('analytics.filters.any')"
          @update:model-value="updateFilter('technicianId', $event)"
        />
      </FormField>
      <FormField :label="t('analytics.filters.workshopId')">
        <FormControl
          v-if="canEditWorkshopFilter"
          :model-value="filters.workshopId"
          name="workshop_id"
          inputmode="numeric"
          :placeholder="t('analytics.filters.any')"
          @update:model-value="updateFilter('workshopId', $event)"
        />
        <input
          v-else
          :value="filters.workshopId"
          class="h-12 w-full rounded-sm border border-gray-700 bg-gray-100 px-3 py-2
            text-gray-600 dark:bg-slate-800 dark:text-slate-300"
          disabled
        >
      </FormField>
      <FormField :label="t('analytics.filters.forecastDays')">
        <FormControl
          :model-value="filters.horizonDays"
          name="horizon_days"
          type="number"
          @update:model-value="updateFilter('horizonDays', $event)"
        />
      </FormField>
      <div class="flex flex-wrap gap-2 lg:col-span-5 lg:justify-end">
        <BaseButton
          color="whiteDark"
          :label="t('common.actions.reset')"
          :disabled="loading"
          @click="emit('reset')"
        />
        <BaseButton
          color="info"
          :label="t('common.actions.apply')"
          type="submit"
          :disabled="loading"
        />
      </div>
    </form>
  </CardBox>
</template>

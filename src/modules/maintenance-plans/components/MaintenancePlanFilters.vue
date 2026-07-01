<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import MaintenanceTaskCombobox from '@/modules/maintenance-tasks/components/MaintenanceTaskCombobox.vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  expanded: Boolean,
  hasActiveFilters: Boolean,
  inputClass: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['apply', 'clear', 'focusout', 'toggle-expanded', 'update-filter'])
const { t } = useI18n()
const advancedFiltersLabel = computed(() =>
  props.expanded
    ? t('maintenancePlans.actions.hideAdvancedFilters')
    : t('maintenancePlans.actions.showAdvancedFilters'),
)

const updateFilter = (key, value) => {
  emit('update-filter', key, value)
}
</script>

<template>
  <CardBox
    is-form
    class="mb-6"
    @submit.prevent="emit('apply')"
    @focusout="emit('focusout')"
  >
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <FormField :label="t('maintenancePlans.filters.search')">
        <FormControl
          :model-value="filters.search"
          name="search"
          :placeholder="t('maintenancePlans.filters.searchPlaceholder')"
          @update:model-value="updateFilter('search', $event)"
        />
      </FormField>
      <FormField :label="t('maintenancePlans.filters.code')">
        <FormControl
          :model-value="filters.code"
          name="code"
          :placeholder="t('maintenancePlans.filters.codePlaceholder')"
          @update:model-value="updateFilter('code', $event)"
        />
      </FormField>
      <FormField :label="t('maintenancePlans.filters.active')">
        <select
          :value="filters.is_active"
          name="is_active"
          :class="inputClass"
          @change="updateFilter('is_active', $event.target.value)"
        >
          <option value="">{{ t('maintenancePlans.filters.all') }}</option>
          <option value="true">{{ t('maintenancePlans.labels.active') }}</option>
          <option value="false">{{ t('maintenancePlans.labels.inactive') }}</option>
        </select>
      </FormField>
    </div>

    <div v-if="expanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <FormField :label="t('maintenancePlans.filters.name')">
        <FormControl
          :model-value="filters.name"
          name="name"
          @update:model-value="updateFilter('name', $event)"
        />
      </FormField>
      <FormField :label="t('maintenancePlans.filters.task')">
        <MaintenanceTaskCombobox
          :model-value="filters.task_id"
          name="task_id"
          :placeholder="t('maintenancePlans.filters.taskPlaceholder')"
          @update:model-value="updateFilter('task_id', $event)"
        />
      </FormField>
      <FormField :label="t('maintenancePlans.filters.daysFrom')">
        <input
          :value="filters.recommended_interval_days_from"
          type="number"
          min="1"
          inputmode="numeric"
          :class="inputClass"
          @input="updateFilter('recommended_interval_days_from', $event.target.value)"
        >
      </FormField>
      <FormField :label="t('maintenancePlans.filters.daysTo')">
        <input
          :value="filters.recommended_interval_days_to"
          type="number"
          min="1"
          inputmode="numeric"
          :class="inputClass"
          @input="updateFilter('recommended_interval_days_to', $event.target.value)"
        >
      </FormField>
      <FormField :label="t('maintenancePlans.filters.kilometersFrom')">
        <input
          :value="filters.recommended_interval_km_from"
          type="number"
          min="1"
          inputmode="numeric"
          :class="inputClass"
          @input="updateFilter('recommended_interval_km_from', $event.target.value)"
        >
      </FormField>
      <FormField :label="t('maintenancePlans.filters.kilometersTo')">
        <input
          :value="filters.recommended_interval_km_to"
          type="number"
          min="1"
          inputmode="numeric"
          :class="inputClass"
          @input="updateFilter('recommended_interval_km_to', $event.target.value)"
        >
      </FormField>
      <FormField :label="t('maintenancePlans.filters.createdFrom')">
        <FormControl
          :model-value="filters.created_from"
          name="created_from"
          type="date"
          @update:model-value="updateFilter('created_from', $event)"
        />
      </FormField>
      <FormField :label="t('maintenancePlans.filters.createdTo')">
        <FormControl
          :model-value="filters.created_to"
          name="created_to"
          type="date"
          @update:model-value="updateFilter('created_to', $event)"
        />
      </FormField>
    </div>

    <div class="mt-2 flex flex-wrap justify-end gap-2">
      <BaseButton
        color="whiteDark"
        :icon="expanded ? mdiChevronUp : mdiChevronDown"
        :title="advancedFiltersLabel"
        :aria-label="advancedFiltersLabel"
        @click="emit('toggle-expanded')"
      />
      <BaseButton
        color="whiteDark"
        :icon="mdiClose"
        :title="t('maintenancePlans.actions.clearFilters')"
        :aria-label="t('maintenancePlans.actions.clearFilters')"
        :disabled="!hasActiveFilters"
        @click="emit('clear')"
      />
      <BaseButton
        color="info"
        :icon="mdiCheck"
        :title="t('maintenancePlans.actions.applyFilters')"
        :aria-label="t('maintenancePlans.actions.applyFilters')"
        type="submit"
      />
    </div>
  </CardBox>
</template>

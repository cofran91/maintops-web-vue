<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import VehicleCombobox from '@/modules/vehicles/components/VehicleCombobox.vue'

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
  statusOptions: {
    type: Array,
    required: true,
  },
  vehicleSystems: {
    type: Array,
    required: true,
  },
  systemsError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'apply',
  'clear',
  'focusout',
  'toggle-expanded',
  'update-filter',
  'without-vehicle-change',
])
const { t } = useI18n()
const advancedFiltersLabel = computed(() =>
  props.expanded
    ? t('maintenanceTasks.actions.hideAdvancedFilters')
    : t('maintenanceTasks.actions.showAdvancedFilters'),
)

const statusLabel = (status) => t(`maintenanceTasks.status.${status}`)
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
      <FormField :label="t('maintenanceTasks.filters.search')">
        <FormControl
          :model-value="filters.search"
          name="search"
          :placeholder="t('maintenanceTasks.filters.searchPlaceholder')"
          @update:model-value="updateFilter('search', $event)"
        />
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.code')">
        <FormControl
          :model-value="filters.code"
          name="code"
          :placeholder="t('maintenanceTasks.filters.codePlaceholder')"
          @update:model-value="updateFilter('code', $event)"
        />
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.vehicleSystem')">
        <select
          :value="filters.vehicle_system_id"
          name="vehicle_system_id"
          :class="inputClass"
          @change="updateFilter('vehicle_system_id', $event.target.value)"
        >
          <option value="">{{ t('maintenanceTasks.filters.allSystems') }}</option>
          <option v-for="system in vehicleSystems" :key="system.id" :value="String(system.id)">
            {{ system.name }}
          </option>
        </select>
      </FormField>
    </div>

    <div v-if="expanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <FormField :label="t('maintenanceTasks.filters.name')">
        <FormControl
          :model-value="filters.name"
          name="name"
          @update:model-value="updateFilter('name', $event)"
        />
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.status')">
        <select
          :value="filters.status"
          name="status"
          :class="inputClass"
          @change="updateFilter('status', $event.target.value)"
        >
          <option value="">{{ t('maintenanceTasks.filters.allStatuses') }}</option>
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ statusLabel(status) }}
          </option>
        </select>
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.active')">
        <select
          :value="filters.is_active"
          name="is_active"
          :class="inputClass"
          @change="updateFilter('is_active', $event.target.value)"
        >
          <option value="">{{ t('maintenanceTasks.filters.all') }}</option>
          <option value="true">{{ t('maintenanceTasks.labels.active') }}</option>
          <option value="false">{{ t('maintenanceTasks.labels.inactive') }}</option>
        </select>
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.durationFrom')">
        <input
          :value="filters.estimated_duration_from"
          type="number"
          min="1"
          inputmode="numeric"
          :placeholder="t('maintenanceTasks.filters.minutesPlaceholder')"
          :class="inputClass"
          @input="updateFilter('estimated_duration_from', $event.target.value)"
        >
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.durationTo')">
        <input
          :value="filters.estimated_duration_to"
          type="number"
          min="1"
          inputmode="numeric"
          :placeholder="t('maintenanceTasks.filters.minutesPlaceholder')"
          :class="inputClass"
          @input="updateFilter('estimated_duration_to', $event.target.value)"
        >
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.vehicle')">
        <VehicleCombobox
          :model-value="filters.vehicle_id"
          name="vehicle_id"
          :placeholder="t('maintenanceTasks.filters.vehiclePlaceholder')"
          :disabled="filters.without_vehicle"
          @update:model-value="updateFilter('vehicle_id', $event)"
        />
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.createdFrom')">
        <FormControl
          :model-value="filters.created_from"
          name="created_from"
          type="date"
          @update:model-value="updateFilter('created_from', $event)"
        />
      </FormField>
      <FormField :label="t('maintenanceTasks.filters.createdTo')">
        <FormControl
          :model-value="filters.created_to"
          name="created_to"
          type="date"
          @update:model-value="updateFilter('created_to', $event)"
        />
      </FormField>
      <label class="flex min-h-12 items-center gap-2 font-semibold">
        <input
          :checked="filters.without_vehicle"
          type="checkbox"
          name="without_vehicle"
          @change="
            updateFilter('without_vehicle', $event.target.checked);
            emit('without-vehicle-change')
          "
        >
        {{ t('maintenanceTasks.filters.reusableTasksOnly') }}
      </label>
    </div>

    <p v-if="systemsError" class="mt-2 text-sm text-red-600 dark:text-red-400">
      {{ systemsError }}
    </p>

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
        :title="t('maintenanceTasks.actions.clearFilters')"
        :aria-label="t('maintenanceTasks.actions.clearFilters')"
        :disabled="!hasActiveFilters"
        @click="emit('clear')"
      />
      <BaseButton
        color="info"
        :icon="mdiCheck"
        :title="t('maintenanceTasks.actions.applyFilters')"
        :aria-label="t('maintenanceTasks.actions.applyFilters')"
        type="submit"
      />
    </div>
  </CardBox>
</template>

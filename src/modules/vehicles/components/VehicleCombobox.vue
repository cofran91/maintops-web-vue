<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AsyncEntityCombobox from '@/modules/shared/components/AsyncEntityCombobox.vue'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService.js'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
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

const value = computed({
  get: () => props.modelValue,
  set: (nextValue) => emit('update:modelValue', nextValue),
})
const resolvedPlaceholder = computed(() => props.placeholder ?? t('vehicles.combobox.placeholder'))

const vehicleLabel = (vehicle) => {
  if (!vehicle) {
    return ''
  }

  return [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
}

const vehicleMetadata = (vehicle) =>
  [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ') ||
  t('vehicles.combobox.noMetadata')

const fetchVehicles = ({ search, page, perPage }) =>
  vehiclesApi.index({
    search: search || undefined,
    page,
    per_page: perPage,
  })

const selectVehicle = (vehicle) => {
  emit('select', vehicle)
}
</script>

<template>
  <AsyncEntityCombobox
    v-model="value"
    :disabled="disabled"
    :input-id="inputId"
    :name="name"
    :placeholder="resolvedPlaceholder"
    :per-page="perPage"
    :fetch-options="fetchVehicles"
    :fetch-selected="vehiclesApi.show"
    :get-option-label="vehicleLabel"
    :clear-label="t('vehicles.combobox.clear')"
    :show-label="t('vehicles.combobox.show')"
    :loading-label="t('vehicles.combobox.loading')"
    :empty-label="t('vehicles.combobox.empty')"
    :loading-more-label="t('vehicles.combobox.loadingMore')"
    @select="selectVehicle"
  >
    <template #option="{ option: vehicle }">
      <span class="block font-semibold text-gray-900 dark:text-slate-100">
        {{ vehicle.license_plate }}
      </span>
      <span class="block text-xs text-gray-500 dark:text-slate-400">
        {{ vehicleMetadata(vehicle) }}
      </span>
    </template>
  </AsyncEntityCombobox>
</template>

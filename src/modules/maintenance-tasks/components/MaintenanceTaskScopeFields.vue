<script setup>
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/ui/AppBadge.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormField from '@/components/FormField.vue'
import VehicleCombobox from '@/modules/vehicles/components/VehicleCombobox.vue'

defineProps({
  form: {
    type: Object,
    required: true,
  },
  generalTask: Boolean,
  advisorRequiresVehicle: Boolean,
  showVehicleField: Boolean,
  fieldError: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update-field', 'update-general-task'])
const { t } = useI18n()

const updateField = (field, value) => {
  emit('update-field', field, value)
}
</script>

<template>
  <div v-if="!advisorRequiresVehicle" class="mb-6 flex items-center gap-3">
    <FormCheckRadio
      :model-value="generalTask"
      name="general_task"
      type="switch"
      :label="t('maintenanceTasks.form.reusableTask')"
      :input-value="true"
      @update:model-value="emit('update-general-task', $event)"
    />
    <AppBadge
      :label="generalTask
        ? t('maintenanceTasks.labels.reusable')
        : t('maintenanceTasks.labels.vehicleSpecific')"
      :color="generalTask ? 'info' : 'warning'"
    />
  </div>

  <FormField
    v-if="showVehicleField"
    :label="t('maintenanceTasks.fields.vehicle')"
    label-for="vehicle_id"
    :error="fieldError('vehicle_id')"
  >
    <VehicleCombobox
      :model-value="form.vehicle_id"
      input-id="vehicle_id"
      name="vehicle_id"
      :placeholder="t('maintenanceTasks.filters.vehiclePlaceholder')"
      @update:model-value="updateField('vehicle_id', $event)"
    />
  </FormField>
</template>

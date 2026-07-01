<script setup>
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/ui/AppBadge.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'

defineProps({
  form: {
    type: Object,
    required: true,
  },
  fieldError: {
    type: Function,
    required: true,
  },
  inputClass: {
    type: String,
    required: true,
  },
  vehicleSystems: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update-field'])
const { t } = useI18n()

const updateField = (field, value) => {
  emit('update-field', field, value)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
    <FormField
      :label="t('maintenanceTasks.fields.vehicleSystem')"
      label-for="vehicle_system_id"
      :error="fieldError('vehicle_system_id')"
    >
      <select
        id="vehicle_system_id"
        :value="form.vehicle_system_id"
        name="vehicle_system_id"
        required
        :class="inputClass"
        @change="updateField('vehicle_system_id', $event.target.value)"
      >
        <option value="" disabled>
          {{ t('maintenanceTasks.form.selectVehicleSystem') }}
        </option>
        <option v-for="system in vehicleSystems" :key="system.id" :value="String(system.id)">
          {{ system.name }}
        </option>
      </select>
    </FormField>

    <FormField :label="t('maintenanceTasks.fields.name')" label-for="name" :error="fieldError('name')">
      <FormControl
        id="name"
        :model-value="form.name"
        name="name"
        required
        maxlength="255"
        @update:model-value="updateField('name', $event)"
      />
    </FormField>

    <FormField :label="t('maintenanceTasks.fields.code')" label-for="code" :error="fieldError('code')">
      <FormControl
        id="code"
        :model-value="form.code"
        name="code"
        required
        maxlength="100"
        placeholder="OIL-CHANGE"
        @update:model-value="updateField('code', $event)"
      />
    </FormField>

    <FormField
      :label="t('maintenanceTasks.fields.estimatedDuration')"
      label-for="estimated_duration_minutes"
      :error="fieldError('estimated_duration_minutes')"
    >
      <input
        id="estimated_duration_minutes"
        :value="form.estimated_duration_minutes"
        name="estimated_duration_minutes"
        type="number"
        min="1"
        max="10080"
        inputmode="numeric"
        required
        :class="inputClass"
        @input="updateField('estimated_duration_minutes', $event.target.value)"
      >
    </FormField>
  </div>

  <FormField :label="t('maintenanceTasks.fields.description')" label-for="description" :error="fieldError('description')">
    <FormControl
      id="description"
      :model-value="form.description"
      name="description"
      type="textarea"
      maxlength="2000"
      @update:model-value="updateField('description', $event)"
    />
  </FormField>

  <div class="mb-6 flex items-center gap-3">
    <FormCheckRadio
      :model-value="form.is_active"
      name="is_active"
      type="switch"
      :label="t('maintenanceTasks.form.activeTask')"
      :input-value="true"
      @update:model-value="updateField('is_active', $event)"
    />
    <AppBadge
      :label="form.is_active
        ? t('maintenanceTasks.labels.active')
        : t('maintenanceTasks.labels.inactive')"
      :color="form.is_active ? 'success' : 'danger'"
    />
  </div>
</template>

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
})

const emit = defineEmits(['update-field'])
const { t } = useI18n()

const updateField = (field, value) => {
  emit('update-field', field, value)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
    <FormField :label="t('maintenancePlans.fields.code')" label-for="code" :error="fieldError('code')">
      <FormControl
        id="code"
        :model-value="form.code"
        name="code"
        required
        maxlength="100"
        :placeholder="t('maintenancePlans.filters.codePlaceholder')"
        @update:model-value="updateField('code', $event)"
      />
    </FormField>

    <FormField :label="t('maintenancePlans.fields.name')" label-for="name" :error="fieldError('name')">
      <FormControl
        id="name"
        :model-value="form.name"
        name="name"
        required
        maxlength="255"
        @update:model-value="updateField('name', $event)"
      />
    </FormField>

    <FormField
      :label="t('maintenancePlans.fields.recommendedDays')"
      label-for="recommended_interval_days"
      :error="fieldError('recommended_interval_days')"
    >
      <input
        id="recommended_interval_days"
        :value="form.recommended_interval_days"
        name="recommended_interval_days"
        type="number"
        min="1"
        max="3650"
        inputmode="numeric"
        :class="inputClass"
        @input="updateField('recommended_interval_days', $event.target.value)"
      >
    </FormField>

    <FormField
      :label="t('maintenancePlans.fields.recommendedKilometers')"
      label-for="recommended_interval_km"
      :error="fieldError('recommended_interval_km')"
    >
      <input
        id="recommended_interval_km"
        :value="form.recommended_interval_km"
        name="recommended_interval_km"
        type="number"
        min="1"
        max="1000000"
        inputmode="numeric"
        :class="inputClass"
        @input="updateField('recommended_interval_km', $event.target.value)"
      >
    </FormField>
  </div>

  <FormField :label="t('maintenancePlans.fields.description')" label-for="description" :error="fieldError('description')">
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
      :label="t('maintenancePlans.form.activePlan')"
      :input-value="true"
      @update:model-value="updateField('is_active', $event)"
    />
    <AppBadge
      :label="form.is_active
        ? t('maintenancePlans.labels.active')
        : t('maintenancePlans.labels.inactive')"
      :color="form.is_active ? 'success' : 'danger'"
    />
  </div>
</template>

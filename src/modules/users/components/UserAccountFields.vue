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
})

const emit = defineEmits(['update-field'])
const { t } = useI18n()

const updateField = (field, value) => {
  emit('update-field', field, value)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
    <FormField :label="t('users.fields.name')" label-for="name" :error="fieldError('name')">
      <FormControl
        id="name"
        :model-value="form.name"
        name="name"
        required
        autocomplete="name"
        maxlength="255"
        @update:model-value="updateField('name', $event)"
      />
    </FormField>

    <FormField :label="t('users.fields.email')" label-for="email" :error="fieldError('email')">
      <FormControl
        id="email"
        :model-value="form.email"
        name="email"
        type="email"
        required
        autocomplete="email"
        maxlength="255"
        @update:model-value="updateField('email', $event)"
      />
    </FormField>

    <FormField :label="t('users.fields.phone')" label-for="phone" :error="fieldError('phone')">
      <FormControl
        id="phone"
        :model-value="form.phone"
        name="phone"
        type="tel"
        maxlength="50"
        @update:model-value="updateField('phone', $event)"
      />
    </FormField>

    <FormField
      :label="t('users.fields.document')"
      label-for="document_number"
      :error="fieldError('document_number')"
    >
      <FormControl
        id="document_number"
        :model-value="form.document_number"
        name="document_number"
        maxlength="100"
        @update:model-value="updateField('document_number', $event)"
      />
    </FormField>
  </div>

  <FormField
    :label="t('users.fields.address')"
    label-for="address"
    :error="fieldError('address')"
  >
    <FormControl
      id="address"
      :model-value="form.address"
      name="address"
      type="textarea"
      maxlength="500"
      @update:model-value="updateField('address', $event)"
    />
  </FormField>

  <div class="mb-6 flex items-center gap-3">
    <FormCheckRadio
      :model-value="form.is_active"
      name="is_active"
      type="switch"
      :label="t('users.form.activeUser')"
      :input-value="true"
      @update:model-value="updateField('is_active', $event)"
    />
    <AppBadge
      :label="form.is_active ? t('users.status.active') : t('users.status.inactive')"
      :color="form.is_active ? 'success' : 'danger'"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ROLES } from '@/types/auth.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'

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
    <FormField
      :label="t('workshops.fields.workshopManager')"
      label-for="manager_user_id"
      :error="fieldError('manager_user_id')"
    >
      <UserCombobox
        :model-value="form.manager_user_id"
        input-id="manager_user_id"
        name="manager_user_id"
        :placeholder="t('workshops.filters.managerPlaceholder')"
        :role="ROLES.WORKSHOP_MANAGER"
        @update:model-value="updateField('manager_user_id', $event)"
      />
    </FormField>

    <FormField :label="t('workshops.fields.name')" label-for="name" :error="fieldError('name')">
      <FormControl
        id="name"
        :model-value="form.name"
        name="name"
        required
        maxlength="255"
        @update:model-value="updateField('name', $event)"
      />
    </FormField>

    <FormField :label="t('workshops.fields.code')" label-for="code" :error="fieldError('code')">
      <FormControl
        id="code"
        :model-value="form.code"
        name="code"
        required
        maxlength="100"
        :placeholder="t('workshops.filters.codePlaceholder')"
        @update:model-value="updateField('code', $event)"
      />
    </FormField>

    <FormField :label="t('workshops.fields.city')" label-for="city" :error="fieldError('city')">
      <FormControl
        id="city"
        :model-value="form.city"
        name="city"
        maxlength="255"
        @update:model-value="updateField('city', $event)"
      />
    </FormField>

    <FormField :label="t('workshops.fields.phone')" label-for="phone" :error="fieldError('phone')">
      <FormControl
        id="phone"
        :model-value="form.phone"
        name="phone"
        type="tel"
        maxlength="50"
        @update:model-value="updateField('phone', $event)"
      />
    </FormField>

    <FormField :label="t('workshops.fields.email')" label-for="email" :error="fieldError('email')">
      <FormControl
        id="email"
        :model-value="form.email"
        name="email"
        type="email"
        maxlength="255"
        @update:model-value="updateField('email', $event)"
      />
    </FormField>
  </div>

  <FormField
    :label="t('workshops.fields.address')"
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
      :label="t('workshops.form.activeWorkshop')"
      :input-value="true"
      @update:model-value="updateField('is_active', $event)"
    />
    <AppBadge
      :label="form.is_active ? t('workshops.status.active') : t('workshops.status.inactive')"
      :color="form.is_active ? 'success' : 'danger'"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
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
    <FormField
      :label="t('users.fields.password')"
      label-for="password"
      :error="fieldError('password')"
    >
      <FormControl
        id="password"
        :model-value="form.password"
        name="password"
        type="password"
        required
        autocomplete="new-password"
        @update:model-value="updateField('password', $event)"
      />
    </FormField>

    <FormField
      :label="t('users.fields.confirmPassword')"
      label-for="password_confirmation"
      :error="fieldError('password_confirmation')"
    >
      <FormControl
        id="password_confirmation"
        :model-value="form.password_confirmation"
        name="password_confirmation"
        type="password"
        required
        autocomplete="new-password"
        @update:model-value="updateField('password_confirmation', $event)"
      />
    </FormField>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import FormField from '@/components/FormField.vue'
import WorkshopCombobox from '@/modules/users/components/WorkshopCombobox.vue'

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
  roleOptions: {
    type: Array,
    required: true,
  },
  roleLabel: {
    type: Function,
    required: true,
  },
  showWorkshopField: Boolean,
})

const emit = defineEmits(['update-field'])
const { t } = useI18n()

const updateField = (field, value) => {
  emit('update-field', field, value)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
    <FormField :label="t('users.fields.role')" label-for="role" :error="fieldError('role')">
      <select
        id="role"
        :value="form.role"
        name="role"
        required
        :class="inputClass"
        @change="updateField('role', $event.target.value)"
      >
        <option v-for="role in roleOptions" :key="role" :value="role">
          {{ roleLabel(role) }}
        </option>
      </select>
    </FormField>

    <FormField
      v-if="showWorkshopField"
      :label="t('users.fields.workshop')"
      label-for="workshop_id"
      :error="fieldError('workshop_id')"
      :help="t('users.form.workshopHelp')"
    >
      <WorkshopCombobox
        :model-value="form.workshop_id"
        input-id="workshop_id"
        name="workshop_id"
        :placeholder="t('users.filters.workshopPlaceholder')"
        @update:model-value="updateField('workshop_id', $event)"
      />
    </FormField>
  </div>
</template>

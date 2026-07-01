<script setup>
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiClose } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'

defineProps({
  filters: {
    type: Object,
    required: true,
  },
  hasActiveFilters: Boolean,
  inputClass: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['apply', 'clear', 'focusout', 'update-filter'])
const { t } = useI18n()

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
      <FormField :label="t('owners.filters.search')">
        <FormControl
          :model-value="filters.search"
          name="search"
          :placeholder="t('owners.filters.searchPlaceholder')"
          @update:model-value="updateFilter('search', $event)"
        />
      </FormField>
      <FormField :label="t('owners.filters.status')">
        <select
          :value="filters.is_active"
          name="is_active"
          :class="inputClass"
          @change="updateFilter('is_active', $event.target.value)"
        >
          <option value="">{{ t('owners.filters.allStatuses') }}</option>
          <option value="true">{{ t('owners.status.active') }}</option>
          <option value="false">{{ t('owners.status.inactive') }}</option>
        </select>
      </FormField>
    </div>

    <div class="mt-2 flex flex-wrap justify-end gap-2">
      <BaseButton
        color="whiteDark"
        :icon="mdiClose"
        :title="t('owners.actions.clearFilters')"
        :aria-label="t('owners.actions.clearFilters')"
        :disabled="!hasActiveFilters"
        @click="emit('clear')"
      />
      <BaseButton
        color="info"
        :icon="mdiCheck"
        :title="t('owners.actions.applyFilters')"
        :aria-label="t('owners.actions.applyFilters')"
        type="submit"
      />
    </div>
  </CardBox>
</template>

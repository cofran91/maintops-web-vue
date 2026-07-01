<script setup>
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiClose } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import WorkshopCombobox from '@/modules/users/components/WorkshopCombobox.vue'

defineProps({
  filters: {
    type: Object,
    required: true,
  },
  roleFilterOptions: {
    type: Array,
    required: true,
  },
  hasActiveFilters: Boolean,
  inputClass: {
    type: String,
    required: true,
  },
  roleLabel: {
    type: Function,
    required: true,
  },
  showWorkshopFilters: Boolean,
})

const emit = defineEmits([
  'apply',
  'clear',
  'focusout',
  'update-filter',
  'without-workshop-change',
])
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
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <FormField :label="t('users.filters.search')">
        <FormControl
          :model-value="filters.search"
          name="search"
          :placeholder="t('users.filters.searchPlaceholder')"
          @update:model-value="updateFilter('search', $event)"
        />
      </FormField>
      <FormField :label="t('users.filters.role')">
        <select
          :value="filters.role"
          name="role"
          :class="inputClass"
          @change="updateFilter('role', $event.target.value)"
        >
          <option value="">{{ t('users.filters.allRoles') }}</option>
          <option v-for="role in roleFilterOptions" :key="role" :value="role">
            {{ roleLabel(role) }}
          </option>
        </select>
      </FormField>
      <FormField :label="t('users.filters.status')">
        <select
          :value="filters.is_active"
          name="is_active"
          :class="inputClass"
          @change="updateFilter('is_active', $event.target.value)"
        >
          <option value="">{{ t('users.filters.allStatuses') }}</option>
          <option value="true">{{ t('users.status.active') }}</option>
          <option value="false">{{ t('users.status.inactive') }}</option>
        </select>
      </FormField>
      <FormField v-if="showWorkshopFilters" :label="t('users.filters.workshop')">
        <WorkshopCombobox
          :model-value="filters.workshop_id"
          name="workshop_id"
          :placeholder="t('users.filters.workshopPlaceholder')"
          :disabled="filters.without_workshop"
          @update:model-value="updateFilter('workshop_id', $event)"
        />
      </FormField>
    </div>

    <div class="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <label
        v-if="showWorkshopFilters"
        class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200"
      >
        <input
          :checked="filters.without_workshop"
          type="checkbox"
          class="rounded border-gray-700"
          @change="
            updateFilter('without_workshop', $event.target.checked);
            emit('without-workshop-change')
          "
        >
        {{ t('users.filters.withoutAssignedWorkshop') }}
      </label>
      <div class="flex flex-wrap gap-2 md:ml-auto">
        <BaseButton
          color="whiteDark"
          :icon="mdiClose"
          :title="t('users.actions.clearFilters')"
          :aria-label="t('users.actions.clearFilters')"
          :disabled="!hasActiveFilters"
          @click="emit('clear')"
        />
        <BaseButton
          color="info"
          :icon="mdiCheck"
          :title="t('users.actions.applyFilters')"
          :aria-label="t('users.actions.applyFilters')"
          type="submit"
        />
      </div>
    </div>
  </CardBox>
</template>

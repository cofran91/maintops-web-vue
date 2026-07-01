<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js'
import { ROLES } from '@/types/auth.js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  expanded: Boolean,
  hasActiveFilters: Boolean,
  inputClass: {
    type: String,
    required: true,
  },
  vehicleSystems: {
    type: Array,
    required: true,
  },
  vehicleSystemsError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['apply', 'clear', 'focusout', 'toggle-expanded', 'update-filter'])
const { t } = useI18n()
const advancedFiltersLabel = computed(() =>
  props.expanded
    ? t('workshops.actions.hideAdvancedFilters')
    : t('workshops.actions.showAdvancedFilters'),
)

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
      <FormField :label="t('workshops.filters.search')">
        <FormControl
          :model-value="filters.search"
          name="search"
          :placeholder="t('workshops.filters.searchPlaceholder')"
          @update:model-value="updateFilter('search', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.code')">
        <FormControl
          :model-value="filters.code"
          name="code"
          :placeholder="t('workshops.filters.codePlaceholder')"
          @update:model-value="updateFilter('code', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.status')">
        <select
          :value="filters.is_active"
          name="is_active"
          :class="inputClass"
          @change="updateFilter('is_active', $event.target.value)"
        >
          <option value="">{{ t('workshops.filters.allStatuses') }}</option>
          <option value="true">{{ t('workshops.status.active') }}</option>
          <option value="false">{{ t('workshops.status.inactive') }}</option>
        </select>
      </FormField>
    </div>

    <div v-if="expanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <FormField :label="t('workshops.filters.name')">
        <FormControl
          :model-value="filters.name"
          name="name"
          @update:model-value="updateFilter('name', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.city')">
        <FormControl
          :model-value="filters.city"
          name="city"
          :placeholder="t('workshops.filters.cityPlaceholder')"
          @update:model-value="updateFilter('city', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.phone')">
        <FormControl
          :model-value="filters.phone"
          name="phone"
          @update:model-value="updateFilter('phone', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.email')">
        <FormControl
          :model-value="filters.email"
          name="email"
          type="email"
          @update:model-value="updateFilter('email', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.manager')">
        <UserCombobox
          :model-value="filters.manager_user_id"
          name="manager_user_id"
          :placeholder="t('workshops.filters.managerPlaceholder')"
          :role="ROLES.WORKSHOP_MANAGER"
          @update:model-value="updateFilter('manager_user_id', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.vehicleSystem')">
        <select
          :value="filters.vehicle_system_id"
          name="vehicle_system_id"
          :class="inputClass"
          @change="updateFilter('vehicle_system_id', $event.target.value)"
        >
          <option value="">{{ t('workshops.filters.allSystems') }}</option>
          <option
            v-for="system in vehicleSystems"
            :key="system.id"
            :value="String(system.id)"
          >
            {{ system.name }}
          </option>
        </select>
        <p v-if="vehicleSystemsError" class="mt-1 text-xs text-red-600 dark:text-red-400">
          {{ vehicleSystemsError }}
        </p>
      </FormField>
      <FormField :label="t('workshops.filters.createdFrom')">
        <FormControl
          :model-value="filters.created_from"
          name="created_from"
          type="date"
          @update:model-value="updateFilter('created_from', $event)"
        />
      </FormField>
      <FormField :label="t('workshops.filters.createdTo')">
        <FormControl
          :model-value="filters.created_to"
          name="created_to"
          type="date"
          @update:model-value="updateFilter('created_to', $event)"
        />
      </FormField>
    </div>

    <div class="mt-2 flex flex-wrap justify-end gap-2">
      <BaseButton
        color="whiteDark"
        :icon="expanded ? mdiChevronUp : mdiChevronDown"
        :title="advancedFiltersLabel"
        :aria-label="advancedFiltersLabel"
        @click="emit('toggle-expanded')"
      />
      <BaseButton
        color="whiteDark"
        :icon="mdiClose"
        :title="t('workshops.actions.clearFilters')"
        :aria-label="t('workshops.actions.clearFilters')"
        :disabled="!hasActiveFilters"
        @click="emit('clear')"
      />
      <BaseButton
        color="info"
        :icon="mdiCheck"
        :title="t('workshops.actions.applyFilters')"
        :aria-label="t('workshops.actions.applyFilters')"
        type="submit"
      />
    </div>
  </CardBox>
</template>

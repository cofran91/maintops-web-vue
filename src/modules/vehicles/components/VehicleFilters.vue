<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import OwnerCombobox from '@/modules/owners/components/OwnerCombobox.vue'

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
})

const emit = defineEmits(['apply', 'clear', 'focusout', 'toggle-expanded', 'update-filter'])
const { t } = useI18n()
const advancedFiltersLabel = computed(() =>
  props.expanded
    ? t('vehicles.actions.hideAdvancedFilters')
    : t('vehicles.actions.showAdvancedFilters'),
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
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <FormField :label="t('vehicles.filters.search')">
        <FormControl
          :model-value="filters.search"
          name="search"
          :placeholder="t('vehicles.filters.searchPlaceholder')"
          @update:model-value="updateFilter('search', $event)"
        />
      </FormField>
      <FormField :label="t('vehicles.filters.licensePlate')">
        <FormControl
          :model-value="filters.license_plate"
          name="license_plate"
          :placeholder="t('vehicles.filters.licensePlatePlaceholder')"
          @update:model-value="updateFilter('license_plate', $event)"
        />
      </FormField>
      <FormField :label="t('vehicles.filters.brand')">
        <FormControl
          :model-value="filters.brand"
          name="brand"
          @update:model-value="updateFilter('brand', $event)"
        />
      </FormField>
      <FormField :label="t('vehicles.filters.owner')">
        <OwnerCombobox
          :model-value="filters.owner_id"
          name="owner_id"
          :placeholder="t('vehicles.filters.ownerPlaceholder')"
          @update:model-value="updateFilter('owner_id', $event)"
        />
      </FormField>
    </div>

    <div v-if="expanded" class="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <FormField :label="t('vehicles.filters.model')">
        <FormControl
          :model-value="filters.model"
          name="model"
          @update:model-value="updateFilter('model', $event)"
        />
      </FormField>
      <FormField :label="t('vehicles.filters.year')">
        <input
          :value="filters.year"
          type="number"
          min="1900"
          inputmode="numeric"
          :class="inputClass"
          @input="updateFilter('year', $event.target.value)"
        >
      </FormField>
      <FormField :label="t('vehicles.filters.color')">
        <FormControl
          :model-value="filters.color"
          name="color"
          @update:model-value="updateFilter('color', $event)"
        />
      </FormField>
      <FormField :label="t('vehicles.filters.createdFrom')">
        <FormControl
          :model-value="filters.created_from"
          name="created_from"
          type="date"
          @update:model-value="updateFilter('created_from', $event)"
        />
      </FormField>
      <FormField :label="t('vehicles.filters.createdTo')">
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
        :title="t('vehicles.actions.clearFilters')"
        :aria-label="t('vehicles.actions.clearFilters')"
        :disabled="!hasActiveFilters"
        @click="emit('clear')"
      />
      <BaseButton
        color="info"
        :icon="mdiCheck"
        :title="t('vehicles.actions.applyFilters')"
        :aria-label="t('vehicles.actions.applyFilters')"
        type="submit"
      />
    </div>
  </CardBox>
</template>

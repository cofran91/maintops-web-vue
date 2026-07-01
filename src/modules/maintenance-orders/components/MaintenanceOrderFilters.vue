<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiCheck, mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js'
import { ROLES } from '@/types/auth.js'
import { MAINTENANCE_ORDER_STATUSES } from '@/types/maintenanceOrder.js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import OwnerCombobox from '@/modules/owners/components/OwnerCombobox.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'
import VehicleCombobox from '@/modules/vehicles/components/VehicleCombobox.vue'
import WorkshopCombobox from '@/modules/users/components/WorkshopCombobox.vue'

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

const emit = defineEmits([
  'apply',
  'clear',
  'focusout',
  'toggle-expanded',
  'update-filter',
  'without-technician-change',
  'without-workshop-change',
])

const { t } = useI18n()
const advancedFiltersLabel = computed(() =>
  props.expanded
    ? t('orders.actions.hideAdvancedFilters')
    : t('orders.actions.showAdvancedFilters'),
)
const orderStatusLabel = (status) => t(`orders.status.${status}`)
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
      <FormField :label="t('orders.filters.search')">
        <FormControl
          :model-value="filters.search"
          name="search"
          :placeholder="t('orders.filters.searchPlaceholder')"
          @update:model-value="updateFilter('search', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.status')">
        <select
          :value="filters.status"
          name="status"
          :class="inputClass"
          @change="updateFilter('status', $event.target.value)"
        >
          <option value="">{{ t('orders.filters.allStatuses') }}</option>
          <option v-for="status in MAINTENANCE_ORDER_STATUSES" :key="status" :value="status">
            {{ orderStatusLabel(status) }}
          </option>
        </select>
      </FormField>
      <FormField :label="t('orders.filters.vehicle')">
        <VehicleCombobox
          :model-value="filters.vehicle_id"
          name="vehicle_id"
          :placeholder="t('orders.filters.vehiclePlaceholder')"
          @update:model-value="updateFilter('vehicle_id', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.advisor')">
        <UserCombobox
          :model-value="filters.advisor_id"
          name="advisor_id"
          :placeholder="t('orders.filters.advisorPlaceholder')"
          :role="ROLES.ADVISOR"
          @update:model-value="updateFilter('advisor_id', $event)"
        />
      </FormField>
    </div>

    <div v-if="expanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <FormField :label="t('orders.filters.owner')">
        <OwnerCombobox
          :model-value="filters.owner_id"
          name="owner_id"
          :placeholder="t('orders.filters.ownerPlaceholder')"
          @update:model-value="updateFilter('owner_id', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.workshop')">
        <WorkshopCombobox
          :model-value="filters.workshop_id"
          name="workshop_id"
          :placeholder="t('orders.filters.workshopPlaceholder')"
          :disabled="filters.without_workshop"
          @update:model-value="updateFilter('workshop_id', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.technician')">
        <UserCombobox
          :model-value="filters.technician_id"
          name="technician_id"
          :placeholder="t('orders.filters.technicianPlaceholder')"
          :role="ROLES.TECHNICIAN"
          :disabled="filters.without_technician"
          @update:model-value="updateFilter('technician_id', $event)"
        />
      </FormField>
      <label class="flex min-h-12 items-center gap-2 font-semibold">
        <input
          :checked="filters.without_workshop"
          type="checkbox"
          name="without_workshop"
          @change="
            updateFilter('without_workshop', $event.target.checked);
            emit('without-workshop-change')
          "
        >
        {{ t('orders.filters.withoutWorkshop') }}
      </label>
      <label class="flex min-h-12 items-center gap-2 font-semibold">
        <input
          :checked="filters.without_technician"
          type="checkbox"
          name="without_technician"
          @change="
            updateFilter('without_technician', $event.target.checked);
            emit('without-technician-change')
          "
        >
        {{ t('orders.filters.withoutTechnician') }}
      </label>
      <FormField :label="t('orders.filters.scheduledFrom')">
        <FormControl
          :model-value="filters.scheduled_from"
          name="scheduled_from"
          type="date"
          @update:model-value="updateFilter('scheduled_from', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.scheduledTo')">
        <FormControl
          :model-value="filters.scheduled_to"
          name="scheduled_to"
          type="date"
          @update:model-value="updateFilter('scheduled_to', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.startedFrom')">
        <FormControl
          :model-value="filters.started_from"
          name="started_from"
          type="date"
          @update:model-value="updateFilter('started_from', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.startedTo')">
        <FormControl
          :model-value="filters.started_to"
          name="started_to"
          type="date"
          @update:model-value="updateFilter('started_to', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.finishedFrom')">
        <FormControl
          :model-value="filters.finished_from"
          name="finished_from"
          type="date"
          @update:model-value="updateFilter('finished_from', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.finishedTo')">
        <FormControl
          :model-value="filters.finished_to"
          name="finished_to"
          type="date"
          @update:model-value="updateFilter('finished_to', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.deliveredFrom')">
        <FormControl
          :model-value="filters.delivered_from"
          name="delivered_from"
          type="date"
          @update:model-value="updateFilter('delivered_from', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.deliveredTo')">
        <FormControl
          :model-value="filters.delivered_to"
          name="delivered_to"
          type="date"
          @update:model-value="updateFilter('delivered_to', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.cancelledFrom')">
        <FormControl
          :model-value="filters.cancelled_from"
          name="cancelled_from"
          type="date"
          @update:model-value="updateFilter('cancelled_from', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.cancelledTo')">
        <FormControl
          :model-value="filters.cancelled_to"
          name="cancelled_to"
          type="date"
          @update:model-value="updateFilter('cancelled_to', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.createdFrom')">
        <FormControl
          :model-value="filters.created_from"
          name="created_from"
          type="date"
          @update:model-value="updateFilter('created_from', $event)"
        />
      </FormField>
      <FormField :label="t('orders.filters.createdTo')">
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
        :title="t('orders.actions.clearFilters')"
        :aria-label="t('orders.actions.clearFilters')"
        :disabled="!hasActiveFilters"
        @click="emit('clear')"
      />
      <BaseButton
        color="info"
        :icon="mdiCheck"
        :title="t('orders.actions.applyFilters')"
        :aria-label="t('orders.actions.applyFilters')"
        type="submit"
      />
    </div>
  </CardBox>
</template>

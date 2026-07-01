<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import FormField from '@/components/FormField.vue'

const props = defineProps({
  error: {
    type: String,
    default: '',
  },
  selectedTechnicians: {
    type: Array,
    required: true,
  },
  search: {
    type: String,
    required: true,
  },
  isOpen: Boolean,
  options: {
    type: Array,
    required: true,
  },
  loading: Boolean,
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:search',
  'focus-search',
  'input-search',
  'toggle-options',
  'scroll-options',
  'select-technician',
  'remove-technician',
])

const { t } = useI18n()

const selectedTechnicianIds = computed(
  () => new Set(props.selectedTechnicians.map((technician) => Number(technician.id))),
)

const isSelected = (id) => selectedTechnicianIds.value.has(Number(id))

const updateSearch = (event) => {
  emit('update:search', event.target.value.trim())
  emit('input-search')
}
</script>

<template>
  <FormField :label="t('workshops.fields.assignedTechnicians')" :error="error">
    <div class="space-y-3">
      <div
        class="flex min-h-12 flex-wrap items-center gap-2 rounded-sm border border-gray-700
          px-3 py-2"
      >
        <span
          v-if="selectedTechnicians.length === 0"
          class="text-sm text-gray-500 dark:text-slate-400"
        >
          {{ t('workshops.form.noTechniciansSelected') }}
        </span>
        <span
          v-for="technician in selectedTechnicians"
          :key="technician.id"
          class="inline-flex items-center gap-2 rounded-sm bg-blue-50 px-2 py-1
            text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
        >
          {{ technician.name }}
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            small
            :title="t('workshops.actions.removeTechnician', { name: technician.name })"
            :aria-label="t('workshops.actions.removeTechnician', { name: technician.name })"
            @click="$emit('remove-technician', technician.id)"
          />
        </span>
      </div>

      <div class="relative">
        <input
          :value="search"
          type="text"
          autocomplete="off"
          role="combobox"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :placeholder="t('workshops.form.searchAvailableTechnicians')"
          class="h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 pr-12
            dark:bg-slate-800"
          @focus="$emit('focus-search')"
          @input="updateSearch"
        >
        <button
          type="button"
          class="absolute right-1 top-1 flex h-10 w-10 items-center justify-center
            rounded-sm text-gray-500 hover:bg-gray-100 dark:text-slate-300
            dark:hover:bg-slate-700"
          :title="t('workshops.actions.showTechnicians')"
          :aria-label="t('workshops.actions.showTechnicians')"
          @click="$emit('toggle-options')"
        >
          <BaseIcon :path="mdiChevronDown" size="18" />
        </button>

        <div
          v-if="isOpen"
          class="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-md border
            border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
          role="listbox"
          @scroll="$emit('scroll-options', $event)"
        >
          <button
            v-for="technician in options"
            :key="technician.id"
            type="button"
            class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100
              dark:hover:bg-slate-800"
            :class="{
              'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
                isSelected(technician.id),
            }"
            role="option"
            :aria-selected="isSelected(technician.id)"
            @click="$emit('select-technician', technician)"
          >
            <span class="block font-semibold text-gray-900 dark:text-slate-100">
              {{ technician.name }}
            </span>
            <span class="block text-xs text-gray-500 dark:text-slate-400">
              {{ technician.email || t('workshops.form.noContactData') }}
            </span>
          </button>

          <p v-if="loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
            {{ t('workshops.form.loadingTechnicians') }}
          </p>
          <p v-else-if="!loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
            {{ t('workshops.form.noTechniciansFound') }}
          </p>
          <p v-if="errorMessage" class="px-3 py-3 text-sm text-red-600">
            {{ errorMessage }}
          </p>
          <p v-if="loading && options.length > 0" class="px-3 py-3 text-sm text-gray-500">
            {{ t('workshops.form.loadingMore') }}
          </p>
        </div>
      </div>
    </div>
  </FormField>
</template>

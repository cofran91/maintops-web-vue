<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AsyncEntityCombobox from '@/modules/shared/components/AsyncEntityCombobox.vue'
import workshopsApi from '@/modules/workshops/services/workshopsService.js'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  disabled: Boolean,
  inputId: String,
  name: String,
  placeholder: {
    type: String,
    default: null,
  },
  perPage: {
    type: Number,
    default: 10,
  },
  activeOnly: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])
const { t } = useI18n()

const value = computed({
  get: () => props.modelValue,
  set: (nextValue) => emit('update:modelValue', nextValue),
})
const resolvedPlaceholder = computed(() => props.placeholder ?? t('workshops.combobox.placeholder'))
const resetKey = computed(() => [props.activeOnly])

const workshopLabel = (workshop) => {
  if (!workshop) {
    return ''
  }

  return [workshop.code, workshop.name, workshop.city].filter(Boolean).join(' - ')
}

const workshopTitle = (workshop) =>
  [workshop.code, workshop.name].filter(Boolean).join(' - ')

const fetchWorkshops = ({ search, page, perPage }) =>
  workshopsApi.index({
    search: search || undefined,
    filters: props.activeOnly ? { is_active: true } : {},
    page,
    per_page: perPage,
  })

const selectWorkshop = (workshop) => {
  emit('select', workshop)
}
</script>

<template>
  <AsyncEntityCombobox
    v-model="value"
    :disabled="disabled"
    :input-id="inputId"
    :name="name"
    :placeholder="resolvedPlaceholder"
    :per-page="perPage"
    :fetch-options="fetchWorkshops"
    :fetch-selected="workshopsApi.show"
    :get-option-label="workshopLabel"
    :clear-label="t('workshops.combobox.clear')"
    :show-label="t('workshops.combobox.show')"
    :loading-label="t('workshops.combobox.loading')"
    :empty-label="t('workshops.combobox.empty')"
    :loading-more-label="t('workshops.combobox.loadingMore')"
    :reset-key="resetKey"
    @select="selectWorkshop"
  >
    <template #option="{ option: workshop }">
      <span class="block font-semibold text-gray-900 dark:text-slate-100">
        {{ workshopTitle(workshop) }}
      </span>
      <span class="block text-xs text-gray-500 dark:text-slate-400">
        {{ workshop.city || t('workshops.combobox.noCity') }}
      </span>
    </template>
  </AsyncEntityCombobox>
</template>

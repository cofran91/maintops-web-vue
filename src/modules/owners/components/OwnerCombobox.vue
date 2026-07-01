<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AsyncEntityCombobox from '@/modules/shared/components/AsyncEntityCombobox.vue'
import ownersApi from '@/modules/owners/services/ownersService.js'

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
const resolvedPlaceholder = computed(() => props.placeholder ?? t('owners.combobox.placeholder'))
const resetKey = computed(() => [props.activeOnly])

const ownerLabel = (owner) => {
  if (!owner) {
    return ''
  }

  return [owner.name, owner.email].filter(Boolean).join(' - ')
}

const fetchOwners = ({ search, page, perPage }) =>
  ownersApi.index({
    search: search || undefined,
    filters: props.activeOnly ? { is_active: true } : {},
    page,
    per_page: perPage,
  })

const selectOwner = (owner) => {
  emit('select', owner)
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
    :fetch-options="fetchOwners"
    :fetch-selected="ownersApi.show"
    :get-option-label="ownerLabel"
    :clear-label="t('owners.combobox.clear')"
    :show-label="t('owners.combobox.show')"
    :loading-label="t('owners.combobox.loading')"
    :empty-label="t('owners.combobox.empty')"
    :loading-more-label="t('owners.combobox.loadingMore')"
    :reset-key="resetKey"
    @select="selectOwner"
  >
    <template #option="{ option: owner }">
      <span class="block font-semibold text-gray-900 dark:text-slate-100">
        {{ owner.name }}
      </span>
      <span class="block text-xs text-gray-500 dark:text-slate-400">
        {{ owner.email || owner.document_number || t('owners.combobox.noContactData') }}
      </span>
    </template>
  </AsyncEntityCombobox>
</template>

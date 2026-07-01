<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AsyncEntityCombobox from '@/modules/shared/components/AsyncEntityCombobox.vue'
import usersApi from '@/modules/users/services/usersService.js'

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
  role: {
    type: String,
    default: '',
  },
  perPage: {
    type: Number,
    default: 10,
  },
  activeOnly: {
    type: Boolean,
    default: true,
  },
  withoutWorkshop: Boolean,
})

const emit = defineEmits(['update:modelValue', 'select'])
const { t } = useI18n()

const value = computed({
  get: () => props.modelValue,
  set: (nextValue) => emit('update:modelValue', nextValue),
})
const resolvedPlaceholder = computed(() => props.placeholder ?? t('users.combobox.placeholder'))
const resetKey = computed(() => [props.role, props.activeOnly, props.withoutWorkshop])

const userLabel = (user) => {
  if (!user) {
    return ''
  }

  return [user.name, user.email].filter(Boolean).join(' - ')
}

const apiFilters = () => ({
  ...(props.role ? { role: props.role } : {}),
  ...(props.activeOnly ? { is_active: true } : {}),
  ...(props.withoutWorkshop ? { without_workshop: true } : {}),
})

const fetchUsers = ({ search, page, perPage }) =>
  usersApi.index({
    search: search || undefined,
    filters: apiFilters(),
    page,
    per_page: perPage,
  })

const selectUser = (user) => {
  emit('select', user)
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
    :fetch-options="fetchUsers"
    :fetch-selected="usersApi.show"
    :get-option-label="userLabel"
    :clear-label="t('users.combobox.clear')"
    :show-label="t('users.combobox.show')"
    :loading-label="t('users.combobox.loading')"
    :empty-label="t('users.combobox.empty')"
    :loading-more-label="t('users.combobox.loadingMore')"
    :reset-key="resetKey"
    @select="selectUser"
  >
    <template #option="{ option: user }">
      <span class="block font-semibold text-gray-900 dark:text-slate-100">
        {{ user.name }}
      </span>
      <span class="block text-xs text-gray-500 dark:text-slate-400">
        {{ user.email || user.document_number || t('users.combobox.noContactData') }}
      </span>
    </template>
  </AsyncEntityCombobox>
</template>

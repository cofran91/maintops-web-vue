<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import BaseIcon from '@/components/BaseIcon.vue'
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

const search = ref('')
const options = ref([])
const selectedUser = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const isOpen = ref(false)
const page = ref(1)
const lastPage = ref(1)

let searchTimeout
let requestId = 0

const normalizedModelValue = computed(() =>
  props.modelValue === null || props.modelValue === undefined ? '' : String(props.modelValue),
)
const hasMorePages = computed(() => page.value < lastPage.value)
const resolvedPlaceholder = computed(() => props.placeholder ?? t('users.combobox.placeholder'))

const userLabel = (user) => {
  if (!user) {
    return ''
  }

  return [user.name, user.email].filter(Boolean).join(' - ')
}

const mergeUsers = (users) => {
  const userMap = new Map()

  users.forEach((user) => {
    if (user?.id !== undefined && user?.id !== null) {
      userMap.set(Number(user.id), user)
    }
  })

  return Array.from(userMap.values())
}

const apiFilters = () => ({
  ...(props.role ? { role: props.role } : {}),
  ...(props.activeOnly ? { is_active: true } : {}),
  ...(props.withoutWorkshop ? { without_workshop: true } : {}),
})

const setSelectedUser = (user, shouldEmit = false) => {
  selectedUser.value = user
  search.value = userLabel(user)
  options.value = mergeUsers([user, ...options.value])

  if (shouldEmit) {
    emit('update:modelValue', String(user.id))
    emit('select', user)
  }
}

const clearSelection = (shouldEmit = true) => {
  selectedUser.value = null
  search.value = ''

  if (shouldEmit) {
    emit('update:modelValue', '')
    emit('select', null)
  }
}

const fetchUsers = async ({ reset = false } = {}) => {
  if (props.disabled || (loading.value && !reset)) {
    return
  }

  if (!reset && !hasMorePages.value) {
    return
  }

  const currentRequestId = ++requestId
  const nextPage = reset ? 1 : page.value + 1

  loading.value = true
  errorMessage.value = ''

  try {
    const data = await usersApi.index({
      search: search.value || undefined,
      filters: apiFilters(),
      page: nextPage,
      per_page: props.perPage,
    })

    if (currentRequestId !== requestId) {
      return
    }

    options.value = reset
      ? mergeUsers([
          ...(selectedUser.value ? [selectedUser.value] : []),
          ...data.items,
        ])
      : mergeUsers([...options.value, ...data.items])
    page.value = data.pagination.current_page
    lastPage.value = data.pagination.last_page
  } catch (error) {
    if (currentRequestId === requestId) {
      errorMessage.value = normalizeApiError(error).message
    }
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

const syncFromModelValue = async () => {
  const value = normalizedModelValue.value

  if (value === '') {
    clearSelection(false)
    return
  }

  if (selectedUser.value && String(selectedUser.value.id) === value) {
    search.value = userLabel(selectedUser.value)
    return
  }

  const existingUser = options.value.find((user) => String(user.id) === value)

  if (existingUser) {
    setSelectedUser(existingUser)
    return
  }

  try {
    setSelectedUser(await usersApi.show(value))
  } catch {
    clearSelection(false)
  }
}

const openOptions = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = true

  if (options.value.length === 0) {
    void fetchUsers({ reset: true })
  }
}

const toggleOptions = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value && options.value.length === 0) {
    void fetchUsers({ reset: true })
  }
}

const handleSearchInput = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = true

  if (selectedUser.value && search.value !== userLabel(selectedUser.value)) {
    selectedUser.value = null
    emit('update:modelValue', '')
    emit('select', null)
  }

  if (searchTimeout) {
    window.clearTimeout(searchTimeout)
  }

  searchTimeout = window.setTimeout(() => {
    void fetchUsers({ reset: true })
  }, 300)
}

const handleScroll = (event) => {
  const target = event.target
  const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24

  if (reachedBottom) {
    void fetchUsers({ reset: false })
  }
}

const selectUser = (user) => {
  setSelectedUser(user, true)
  isOpen.value = false
}

watch(
  () => props.modelValue,
  () => {
    void syncFromModelValue()
  },
  { immediate: true },
)

watch(
  () => [props.role, props.activeOnly, props.withoutWorkshop],
  () => {
    options.value = selectedUser.value ? [selectedUser.value] : []
    page.value = 1
    lastPage.value = 1
  },
)

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      isOpen.value = false
    }
  },
)

onBeforeUnmount(() => {
  if (searchTimeout) {
    window.clearTimeout(searchTimeout)
  }
})
</script>

<template>
  <div class="relative">
    <input
      :id="inputId"
      v-model.trim="search"
      :name="name"
      type="text"
      autocomplete="off"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :placeholder="resolvedPlaceholder"
      :disabled="disabled"
      class="h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 pr-20
        disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800"
      @focus="openOptions"
      @input="handleSearchInput"
    >
    <div class="absolute inset-y-0 right-1 flex items-center gap-1">
      <button
        v-if="normalizedModelValue"
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-sm text-gray-500
          hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        :disabled="disabled"
        :title="t('users.combobox.clear')"
        :aria-label="t('users.combobox.clear')"
        @click="clearSelection(true)"
      >
        <BaseIcon :path="mdiClose" size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-sm text-gray-500
          hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        :disabled="disabled"
        :title="t('users.combobox.show')"
        :aria-label="t('users.combobox.show')"
        @click="toggleOptions"
      >
        <BaseIcon :path="mdiChevronDown" size="18" />
      </button>
    </div>

    <div
      v-if="isOpen && !disabled"
      class="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200
        bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
      role="listbox"
      @scroll="handleScroll"
    >
      <button
        v-for="user in options"
        :key="user.id"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
        :class="{
          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
            String(user.id) === normalizedModelValue,
        }"
        role="option"
        :aria-selected="String(user.id) === normalizedModelValue"
        @click="selectUser(user)"
      >
        <span class="block font-semibold text-gray-900 dark:text-slate-100">
          {{ user.name }}
        </span>
        <span class="block text-xs text-gray-500 dark:text-slate-400">
          {{ user.email || user.document_number || t('users.combobox.noContactData') }}
        </span>
      </button>

      <p v-if="loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        {{ t('users.combobox.loading') }}
      </p>
      <p v-else-if="!loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        {{ t('users.combobox.empty') }}
      </p>
      <p v-if="errorMessage" class="px-3 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>
      <p v-if="loading && options.length > 0" class="px-3 py-3 text-sm text-gray-500">
        {{ t('users.combobox.loadingMore') }}
      </p>
    </div>
  </div>
</template>

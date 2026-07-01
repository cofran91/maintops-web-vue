<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import BaseIcon from '@/components/BaseIcon.vue'

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
    default: '',
  },
  perPage: {
    type: Number,
    default: 10,
  },
  fetchOptions: {
    type: Function,
    required: true,
  },
  fetchSelected: {
    type: Function,
    required: true,
  },
  getOptionId: {
    type: Function,
    default: (option) => option?.id,
  },
  getOptionLabel: {
    type: Function,
    required: true,
  },
  clearLabel: {
    type: String,
    required: true,
  },
  showLabel: {
    type: String,
    required: true,
  },
  loadingLabel: {
    type: String,
    required: true,
  },
  emptyLabel: {
    type: String,
    required: true,
  },
  loadingMoreLabel: {
    type: String,
    required: true,
  },
  debounceMs: {
    type: Number,
    default: 300,
  },
  resetKey: {
    type: [String, Number, Boolean, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const search = ref('')
const options = ref([])
const selectedOption = ref(null)
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

const optionId = (option) => props.getOptionId(option)
const optionLabel = (option) => props.getOptionLabel(option)
const isSelected = (option) => String(optionId(option)) === normalizedModelValue.value

const mergeOptions = (nextOptions) => {
  const optionMap = new Map()

  nextOptions.forEach((option) => {
    const id = optionId(option)

    if (id !== undefined && id !== null) {
      optionMap.set(String(id), option)
    }
  })

  return Array.from(optionMap.values())
}

const setSelectedOption = (option, shouldEmit = false) => {
  selectedOption.value = option
  search.value = optionLabel(option)
  options.value = mergeOptions([option, ...options.value])

  if (shouldEmit) {
    emit('update:modelValue', String(optionId(option)))
    emit('select', option)
  }
}

const clearSelection = (shouldEmit = true) => {
  selectedOption.value = null
  search.value = ''

  if (shouldEmit) {
    emit('update:modelValue', '')
    emit('select', null)
  }
}

const fetchPage = async ({ reset = false } = {}) => {
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
    const data = await props.fetchOptions({
      search: search.value,
      page: nextPage,
      perPage: props.perPage,
    })

    if (currentRequestId !== requestId) {
      return
    }

    const items = Array.isArray(data?.items) ? data.items : []
    const pagination = data?.pagination ?? {}

    options.value = reset
      ? mergeOptions([
          ...(selectedOption.value ? [selectedOption.value] : []),
          ...items,
        ])
      : mergeOptions([...options.value, ...items])
    page.value = pagination.current_page ?? nextPage
    lastPage.value = pagination.last_page ?? page.value
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

  if (selectedOption.value && String(optionId(selectedOption.value)) === value) {
    search.value = optionLabel(selectedOption.value)
    return
  }

  const existingOption = options.value.find((option) => String(optionId(option)) === value)

  if (existingOption) {
    setSelectedOption(existingOption)
    return
  }

  try {
    setSelectedOption(await props.fetchSelected(value))
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
    void fetchPage({ reset: true })
  }
}

const toggleOptions = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value && options.value.length === 0) {
    void fetchPage({ reset: true })
  }
}

const handleSearchInput = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = true

  if (selectedOption.value && search.value !== optionLabel(selectedOption.value)) {
    selectedOption.value = null
    emit('update:modelValue', '')
    emit('select', null)
  }

  if (searchTimeout) {
    window.clearTimeout(searchTimeout)
  }

  searchTimeout = window.setTimeout(() => {
    void fetchPage({ reset: true })
  }, props.debounceMs)
}

const handleScroll = (event) => {
  const target = event.target
  const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24

  if (reachedBottom) {
    void fetchPage({ reset: false })
  }
}

const selectOption = (option) => {
  setSelectedOption(option, true)
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
  () => props.resetKey,
  () => {
    options.value = selectedOption.value ? [selectedOption.value] : []
    page.value = 1
    lastPage.value = 1
  },
  { deep: true },
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
      :placeholder="placeholder"
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
        :title="clearLabel"
        :aria-label="clearLabel"
        @click="clearSelection(true)"
      >
        <BaseIcon :path="mdiClose" size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-sm text-gray-500
          hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        :disabled="disabled"
        :title="showLabel"
        :aria-label="showLabel"
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
        v-for="option in options"
        :key="optionId(option)"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
        :class="{
          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300': isSelected(option),
        }"
        role="option"
        :aria-selected="isSelected(option)"
        @click="selectOption(option)"
      >
        <slot
          name="option"
          :option="option"
          :selected="isSelected(option)"
          :label="optionLabel(option)"
        >
          <span class="block font-semibold text-gray-900 dark:text-slate-100">
            {{ optionLabel(option) }}
          </span>
        </slot>
      </button>

      <p v-if="loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        {{ loadingLabel }}
      </p>
      <p v-else-if="!loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        {{ emptyLabel }}
      </p>
      <p v-if="errorMessage" class="px-3 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>
      <p v-if="loading && options.length > 0" class="px-3 py-3 text-sm text-gray-500">
        {{ loadingMoreLabel }}
      </p>
    </div>
  </div>
</template>

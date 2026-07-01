<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  selectedItems: {
    type: Array,
    default: () => [],
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
  getOptionMeta: {
    type: Function,
    default: () => '',
  },
  emptySelectionLabel: {
    type: String,
    required: true,
  },
  removeLabel: {
    type: Function,
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
})

const emit = defineEmits(['update:modelValue', 'select'])

const search = ref('')
const options = ref([])
const selectedOptions = ref([])
const loading = ref(false)
const errorMessage = ref('')
const isOpen = ref(false)
const page = ref(1)
const lastPage = ref(1)

let searchTimeout
let requestId = 0
let syncRequestId = 0

const normalizedModelValue = computed(() =>
  props.modelValue
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0),
)
const hasMorePages = computed(() => page.value < lastPage.value)

const optionId = (option) => props.getOptionId(option)
const optionLabel = (option) => props.getOptionLabel(option)
const optionMeta = (option) => props.getOptionMeta(option)

const mergeOptions = (nextOptions) => {
  const optionMap = new Map()

  nextOptions.forEach((option) => {
    const id = optionId(option)

    if (id !== undefined && id !== null) {
      optionMap.set(Number(id), option)
    }
  })

  return Array.from(optionMap.values())
}

const emitSelection = () => {
  emit('update:modelValue', selectedOptions.value.map((option) => Number(optionId(option))))
  emit('select', selectedOptions.value)
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
      ? mergeOptions([...selectedOptions.value, ...items])
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
  const currentRequestId = ++syncRequestId
  const ids = normalizedModelValue.value

  if (ids.length === 0) {
    selectedOptions.value = []
    return
  }

  const knownOptions = mergeOptions([
    ...selectedOptions.value,
    ...props.selectedItems,
    ...options.value,
  ])
  const nextSelectedOptions = []

  for (const id of ids) {
    const knownOption = knownOptions.find((option) => Number(optionId(option)) === id)

    if (knownOption) {
      nextSelectedOptions.push(knownOption)
      continue
    }

    try {
      nextSelectedOptions.push(await props.fetchSelected(id))
    } catch {
      // Ignore missing selected records and let API validation own persistence.
    }
  }

  if (currentRequestId !== syncRequestId) {
    return
  }

  selectedOptions.value = mergeOptions(nextSelectedOptions)
  options.value = mergeOptions([...selectedOptions.value, ...options.value])
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

const isSelected = (id) =>
  selectedOptions.value.some((option) => Number(optionId(option)) === Number(id))

const selectOption = (option) => {
  if (!isSelected(optionId(option))) {
    selectedOptions.value = mergeOptions([...selectedOptions.value, option])
    emitSelection()
  }

  search.value = ''
  isOpen.value = false
}

const removeOption = (id) => {
  selectedOptions.value = selectedOptions.value.filter(
    (option) => Number(optionId(option)) !== Number(id),
  )
  emitSelection()
}

watch(
  () => props.modelValue,
  () => {
    void syncFromModelValue()
  },
  { immediate: true, deep: true },
)

watch(
  () => props.selectedItems,
  () => {
    options.value = mergeOptions([...selectedOptions.value, ...props.selectedItems, ...options.value])
    void syncFromModelValue()
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
  <div class="space-y-3">
    <div
      class="flex min-h-12 flex-wrap items-center gap-2 rounded-sm border border-gray-700 px-3 py-2"
    >
      <span
        v-if="selectedOptions.length === 0"
        class="text-sm text-gray-500 dark:text-slate-400"
      >
        {{ emptySelectionLabel }}
      </span>
      <span
        v-for="option in selectedOptions"
        :key="optionId(option)"
        class="inline-flex items-center gap-2 rounded-sm bg-blue-50 px-2 py-1
          text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
      >
        <span>{{ optionLabel(option) }}</span>
        <BaseButton
          color="whiteDark"
          :icon="mdiClose"
          small
          :title="removeLabel(option)"
          :aria-label="removeLabel(option)"
          :disabled="disabled"
          @click="removeOption(optionId(option))"
        />
      </span>
    </div>

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
        class="h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 pr-12
          disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800"
        @focus="openOptions"
        @input="handleSearchInput"
        @keydown.enter.prevent
      >
      <button
        type="button"
        class="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-sm
          text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        :disabled="disabled"
        :title="showLabel"
        :aria-label="showLabel"
        @click="toggleOptions"
      >
        <BaseIcon :path="mdiChevronDown" size="18" />
      </button>

      <div
        v-if="isOpen && !disabled"
        class="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-md border
          border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        role="listbox"
        @scroll="handleScroll"
      >
        <button
          v-for="option in options"
          :key="optionId(option)"
          type="button"
          class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100
            dark:hover:bg-slate-800"
          :class="{
            'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
              isSelected(optionId(option)),
          }"
          role="option"
          :aria-selected="isSelected(optionId(option))"
          @click="selectOption(option)"
        >
          <span class="block font-semibold text-gray-900 dark:text-slate-100">
            {{ optionLabel(option) }}
          </span>
          <span class="block text-xs text-gray-500 dark:text-slate-400">
            {{ optionMeta(option) }}
          </span>
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
  </div>
</template>

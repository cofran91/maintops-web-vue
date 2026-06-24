<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import BaseIcon from '@/components/BaseIcon.vue'
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
    default: 'Search workshops',
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

const search = ref('')
const options = ref([])
const selectedWorkshop = ref(null)
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

const workshopLabel = (workshop) => {
  if (!workshop) {
    return ''
  }

  return [workshop.code, workshop.name, workshop.city].filter(Boolean).join(' - ')
}

const mergeWorkshops = (workshops) => {
  const workshopMap = new Map()

  workshops.forEach((workshop) => {
    if (workshop?.id !== undefined && workshop?.id !== null) {
      workshopMap.set(Number(workshop.id), workshop)
    }
  })

  return Array.from(workshopMap.values())
}

const setSelectedWorkshop = (workshop, shouldEmit = false) => {
  selectedWorkshop.value = workshop
  search.value = workshopLabel(workshop)
  options.value = mergeWorkshops([workshop, ...options.value])

  if (shouldEmit) {
    emit('update:modelValue', String(workshop.id))
    emit('select', workshop)
  }
}

const clearSelection = (shouldEmit = true) => {
  selectedWorkshop.value = null
  search.value = ''

  if (shouldEmit) {
    emit('update:modelValue', '')
    emit('select', null)
  }
}

const fetchWorkshops = async ({ reset = false } = {}) => {
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
    const data = await workshopsApi.index({
      search: search.value || undefined,
      filters: props.activeOnly ? { is_active: true } : {},
      page: nextPage,
      per_page: props.perPage,
    })

    if (currentRequestId !== requestId) {
      return
    }

    const nextOptions = data.items

    options.value = reset
      ? mergeWorkshops([
          ...(selectedWorkshop.value ? [selectedWorkshop.value] : []),
          ...nextOptions,
        ])
      : mergeWorkshops([...options.value, ...nextOptions])
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

  if (selectedWorkshop.value && String(selectedWorkshop.value.id) === value) {
    search.value = workshopLabel(selectedWorkshop.value)
    return
  }

  const existingWorkshop = options.value.find((workshop) => String(workshop.id) === value)

  if (existingWorkshop) {
    setSelectedWorkshop(existingWorkshop)
    return
  }

  try {
    setSelectedWorkshop(await workshopsApi.show(value))
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
    void fetchWorkshops({ reset: true })
  }
}

const toggleOptions = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value && options.value.length === 0) {
    void fetchWorkshops({ reset: true })
  }
}

const handleSearchInput = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = true

  if (
    selectedWorkshop.value &&
    search.value !== workshopLabel(selectedWorkshop.value)
  ) {
    selectedWorkshop.value = null
    emit('update:modelValue', '')
    emit('select', null)
  }

  if (searchTimeout) {
    window.clearTimeout(searchTimeout)
  }

  searchTimeout = window.setTimeout(() => {
    void fetchWorkshops({ reset: true })
  }, 300)
}

const handleScroll = (event) => {
  const target = event.target
  const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24

  if (reachedBottom) {
    void fetchWorkshops({ reset: false })
  }
}

const selectWorkshop = (workshop) => {
  setSelectedWorkshop(workshop, true)
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
        title="Clear workshop"
        aria-label="Clear workshop"
        @click="clearSelection(true)"
      >
        <BaseIcon :path="mdiClose" size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-sm text-gray-500
          hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        :disabled="disabled"
        title="Show workshops"
        aria-label="Show workshops"
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
        v-for="workshop in options"
        :key="workshop.id"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
        :class="{
          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
            String(workshop.id) === normalizedModelValue,
        }"
        role="option"
        :aria-selected="String(workshop.id) === normalizedModelValue"
        @click="selectWorkshop(workshop)"
      >
        <span class="block font-semibold text-gray-900 dark:text-slate-100">
          {{ workshop.code }} - {{ workshop.name }}
        </span>
        <span class="block text-xs text-gray-500 dark:text-slate-400">
          {{ workshop.city || 'No city' }}
        </span>
      </button>

      <p v-if="loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        Loading workshops...
      </p>
      <p v-else-if="!loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        No workshops found.
      </p>
      <p v-if="errorMessage" class="px-3 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>
      <p v-if="loading && options.length > 0" class="px-3 py-3 text-sm text-gray-500">
        Loading more...
      </p>
    </div>
  </div>
</template>

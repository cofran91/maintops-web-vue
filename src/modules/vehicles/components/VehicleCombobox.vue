<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import BaseIcon from '@/components/BaseIcon.vue'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService.js'

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
    default: 'Search vehicles',
  },
  perPage: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const search = ref('')
const options = ref([])
const selectedVehicle = ref(null)
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

const vehicleLabel = (vehicle) => {
  if (!vehicle) {
    return ''
  }

  return [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
}

const mergeVehicles = (vehicles) => {
  const vehicleMap = new Map()

  vehicles.forEach((vehicle) => {
    if (vehicle?.id !== undefined && vehicle?.id !== null) {
      vehicleMap.set(Number(vehicle.id), vehicle)
    }
  })

  return Array.from(vehicleMap.values())
}

const setSelectedVehicle = (vehicle, shouldEmit = false) => {
  selectedVehicle.value = vehicle
  search.value = vehicleLabel(vehicle)
  options.value = mergeVehicles([vehicle, ...options.value])

  if (shouldEmit) {
    emit('update:modelValue', String(vehicle.id))
    emit('select', vehicle)
  }
}

const clearSelection = (shouldEmit = true) => {
  selectedVehicle.value = null
  search.value = ''

  if (shouldEmit) {
    emit('update:modelValue', '')
    emit('select', null)
  }
}

const fetchVehicles = async ({ reset = false } = {}) => {
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
    const data = await vehiclesApi.index({
      search: search.value || undefined,
      page: nextPage,
      per_page: props.perPage,
    })

    if (currentRequestId !== requestId) {
      return
    }

    options.value = reset
      ? mergeVehicles([
          ...(selectedVehicle.value ? [selectedVehicle.value] : []),
          ...data.items,
        ])
      : mergeVehicles([...options.value, ...data.items])
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

  if (selectedVehicle.value && String(selectedVehicle.value.id) === value) {
    search.value = vehicleLabel(selectedVehicle.value)
    return
  }

  const existingVehicle = options.value.find((vehicle) => String(vehicle.id) === value)

  if (existingVehicle) {
    setSelectedVehicle(existingVehicle)
    return
  }

  try {
    setSelectedVehicle(await vehiclesApi.show(value))
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
    void fetchVehicles({ reset: true })
  }
}

const toggleOptions = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value && options.value.length === 0) {
    void fetchVehicles({ reset: true })
  }
}

const handleSearchInput = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = true

  if (selectedVehicle.value && search.value !== vehicleLabel(selectedVehicle.value)) {
    selectedVehicle.value = null
    emit('update:modelValue', '')
    emit('select', null)
  }

  if (searchTimeout) {
    window.clearTimeout(searchTimeout)
  }

  searchTimeout = window.setTimeout(() => {
    void fetchVehicles({ reset: true })
  }, 300)
}

const handleScroll = (event) => {
  const target = event.target
  const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24

  if (reachedBottom) {
    void fetchVehicles({ reset: false })
  }
}

const selectVehicle = (vehicle) => {
  setSelectedVehicle(vehicle, true)
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
        title="Clear vehicle"
        aria-label="Clear vehicle"
        @click="clearSelection(true)"
      >
        <BaseIcon :path="mdiClose" size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-sm text-gray-500
          hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        :disabled="disabled"
        title="Show vehicles"
        aria-label="Show vehicles"
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
        v-for="vehicle in options"
        :key="vehicle.id"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
        :class="{
          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
            String(vehicle.id) === normalizedModelValue,
        }"
        role="option"
        :aria-selected="String(vehicle.id) === normalizedModelValue"
        @click="selectVehicle(vehicle)"
      >
        <span class="block font-semibold text-gray-900 dark:text-slate-100">
          {{ vehicle.license_plate }}
        </span>
        <span class="block text-xs text-gray-500 dark:text-slate-400">
          {{
            [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ') ||
            'No metadata'
          }}
        </span>
      </button>

      <p v-if="loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        Loading vehicles...
      </p>
      <p v-else-if="!loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        No vehicles found.
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

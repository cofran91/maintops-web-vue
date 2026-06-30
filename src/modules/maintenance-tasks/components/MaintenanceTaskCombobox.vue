<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import BaseIcon from '@/components/BaseIcon.vue'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  activeOnly: {
    type: Boolean,
    default: true,
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
})

const emit = defineEmits(['update:modelValue', 'select'])
const { t } = useI18n()

const search = ref('')
const options = ref([])
const selectedTask = ref(null)
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
const resolvedPlaceholder = computed(() =>
  props.placeholder ?? t('maintenanceTasks.combobox.placeholder'),
)
const hasMorePages = computed(() => page.value < lastPage.value)

const taskLabel = (task) => {
  if (!task) {
    return ''
  }

  return [task.code, task.name].filter(Boolean).join(' - ')
}

const taskMeta = (task) =>
  [task.vehicle_system?.name, task.vehicle?.license_plate ?? t('maintenanceTasks.labels.reusable')]
    .filter(Boolean)
    .join(' / ')

const mergeTasks = (tasks) => {
  const taskMap = new Map()

  tasks.forEach((task) => {
    if (task?.id !== undefined && task?.id !== null) {
      taskMap.set(Number(task.id), task)
    }
  })

  return Array.from(taskMap.values())
}

const setSelectedTask = (task, shouldEmit = false) => {
  selectedTask.value = task
  search.value = taskLabel(task)
  options.value = mergeTasks([task, ...options.value])

  if (shouldEmit) {
    emit('update:modelValue', String(task.id))
    emit('select', task)
  }
}

const clearSelection = (shouldEmit = true) => {
  selectedTask.value = null
  search.value = ''

  if (shouldEmit) {
    emit('update:modelValue', '')
    emit('select', null)
  }
}

const fetchTasks = async ({ reset = false } = {}) => {
  if (props.disabled || (loading.value && !reset)) {
    return
  }

  if (!reset && !hasMorePages.value) {
    return
  }

  const currentRequestId = ++requestId
  const nextPage = reset ? 1 : page.value + 1
  const filters = props.activeOnly ? { is_active: true } : {}

  loading.value = true
  errorMessage.value = ''

  try {
    const data = await maintenanceTasksApi.index({
      search: search.value || undefined,
      filters,
      page: nextPage,
      per_page: props.perPage,
    })

    if (currentRequestId !== requestId) {
      return
    }

    options.value = reset
      ? mergeTasks([
          ...(selectedTask.value ? [selectedTask.value] : []),
          ...data.items,
        ])
      : mergeTasks([...options.value, ...data.items])
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

  if (selectedTask.value && String(selectedTask.value.id) === value) {
    search.value = taskLabel(selectedTask.value)
    return
  }

  const existingTask = options.value.find((task) => String(task.id) === value)

  if (existingTask) {
    setSelectedTask(existingTask)
    return
  }

  try {
    setSelectedTask(await maintenanceTasksApi.show(value))
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
    void fetchTasks({ reset: true })
  }
}

const toggleOptions = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value && options.value.length === 0) {
    void fetchTasks({ reset: true })
  }
}

const handleSearchInput = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = true

  if (selectedTask.value && search.value !== taskLabel(selectedTask.value)) {
    selectedTask.value = null
    emit('update:modelValue', '')
    emit('select', null)
  }

  if (searchTimeout) {
    window.clearTimeout(searchTimeout)
  }

  searchTimeout = window.setTimeout(() => {
    void fetchTasks({ reset: true })
  }, 300)
}

const handleScroll = (event) => {
  const target = event.target
  const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24

  if (reachedBottom) {
    void fetchTasks({ reset: false })
  }
}

const selectTask = (task) => {
  setSelectedTask(task, true)
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
        :title="t('maintenanceTasks.combobox.clear')"
        :aria-label="t('maintenanceTasks.combobox.clear')"
        @click="clearSelection(true)"
      >
        <BaseIcon :path="mdiClose" size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-sm text-gray-500
          hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        :disabled="disabled"
        :title="t('maintenanceTasks.combobox.show')"
        :aria-label="t('maintenanceTasks.combobox.show')"
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
        v-for="task in options"
        :key="task.id"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
        :class="{
          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
            String(task.id) === normalizedModelValue,
        }"
        role="option"
        :aria-selected="String(task.id) === normalizedModelValue"
        @click="selectTask(task)"
      >
        <span class="block font-semibold text-gray-900 dark:text-slate-100">
          {{ taskLabel(task) }}
        </span>
        <span class="block text-xs text-gray-500 dark:text-slate-400">
          {{ taskMeta(task) }}
        </span>
      </button>

      <p v-if="loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        {{ t('maintenanceTasks.combobox.loading') }}
      </p>
      <p v-else-if="!loading && options.length === 0" class="px-3 py-3 text-sm text-gray-500">
        {{ t('maintenanceTasks.combobox.empty') }}
      </p>
      <p v-if="errorMessage" class="px-3 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>
      <p v-if="loading && options.length > 0" class="px-3 py-3 text-sm text-gray-500">
        {{ t('maintenanceTasks.combobox.loadingMore') }}
      </p>
    </div>
  </div>
</template>

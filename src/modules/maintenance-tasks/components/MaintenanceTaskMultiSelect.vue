<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  selectedItems: {
    type: Array,
    default: () => [],
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
const selectedTasks = ref([])
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

const emitSelection = () => {
  emit('update:modelValue', selectedTasks.value.map((task) => Number(task.id)))
  emit('select', selectedTasks.value)
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
      ? mergeTasks([...selectedTasks.value, ...data.items])
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
  const currentRequestId = ++syncRequestId
  const ids = normalizedModelValue.value

  if (ids.length === 0) {
    selectedTasks.value = []
    return
  }

  const knownTasks = mergeTasks([
    ...selectedTasks.value,
    ...props.selectedItems,
    ...options.value,
  ])
  const nextSelectedTasks = []

  for (const id of ids) {
    const knownTask = knownTasks.find((task) => Number(task.id) === id)

    if (knownTask) {
      nextSelectedTasks.push(knownTask)
      continue
    }

    try {
      nextSelectedTasks.push(await maintenanceTasksApi.show(id))
    } catch {
      // Ignore missing selected records and let API validation own persistence.
    }
  }

  if (currentRequestId !== syncRequestId) {
    return
  }

  selectedTasks.value = mergeTasks(nextSelectedTasks)
  options.value = mergeTasks([...selectedTasks.value, ...options.value])
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

const isSelected = (taskId) =>
  selectedTasks.value.some((task) => Number(task.id) === Number(taskId))

const selectTask = (task) => {
  if (!isSelected(task.id)) {
    selectedTasks.value = mergeTasks([...selectedTasks.value, task])
    emitSelection()
  }

  search.value = ''
  isOpen.value = false
}

const removeTask = (taskId) => {
  selectedTasks.value = selectedTasks.value.filter(
    (task) => Number(task.id) !== Number(taskId),
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
    options.value = mergeTasks([...selectedTasks.value, ...props.selectedItems, ...options.value])
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
        v-if="selectedTasks.length === 0"
        class="text-sm text-gray-500 dark:text-slate-400"
      >
        {{ t('maintenanceTasks.combobox.noTasksSelected') }}
      </span>
      <span
        v-for="task in selectedTasks"
        :key="task.id"
        class="inline-flex items-center gap-2 rounded-sm bg-blue-50 px-2 py-1
          text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
      >
        <span>{{ taskLabel(task) }}</span>
        <BaseButton
          color="whiteDark"
          :icon="mdiClose"
          small
          :title="t('maintenanceTasks.combobox.remove', { name: taskLabel(task) })"
          :aria-label="t('maintenanceTasks.combobox.remove', { name: taskLabel(task) })"
          :disabled="disabled"
          @click="removeTask(task.id)"
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
        :placeholder="resolvedPlaceholder"
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
        :title="t('maintenanceTasks.combobox.show')"
        :aria-label="t('maintenanceTasks.combobox.show')"
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
          v-for="task in options"
          :key="task.id"
          type="button"
          class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100
            dark:hover:bg-slate-800"
          :class="{
            'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
              isSelected(task.id),
          }"
          role="option"
          :aria-selected="isSelected(task.id)"
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
  </div>
</template>

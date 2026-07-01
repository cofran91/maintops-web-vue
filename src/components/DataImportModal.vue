<script setup>
import { computed, ref, watch } from 'vue'
import { mdiClose, mdiUpload } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormFilePicker from '@/components/FormFilePicker.vue'

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    required: true,
  },
  importAction: {
    type: Function,
    required: true,
  },
  summaryFields: {
    type: Array,
    required: true,
  },
  accept: {
    type: String,
    default:
      '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
  },
  buttonColor: {
    type: String,
    default: 'info',
  },
  fileLabel: {
    type: String,
    required: true,
  },
  fileHint: {
    type: String,
    default: '',
  },
  importLabel: {
    type: String,
    required: true,
  },
  importingLabel: {
    type: String,
    required: true,
  },
  doneLabel: {
    type: String,
    required: true,
  },
  selectFileMessage: {
    type: String,
    required: true,
  },
  waitingMessage: {
    type: String,
    required: true,
  },
  errorFallback: {
    type: String,
    required: true,
  },
  errorsTitle: {
    type: String,
    required: true,
  },
  rowLabel: {
    type: String,
    required: true,
  },
  noRowErrorsLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'imported', 'processing'])

const file = ref(null)
const result = ref(null)
const errorMessage = ref('')
const isProcessing = ref(false)

const value = computed({
  get: () => props.modelValue,
  set: (nextValue) => emit('update:modelValue', nextValue),
})

const actionLabel = computed(() => {
  if (isProcessing.value) {
    return props.importingLabel
  }

  if (result.value) {
    return props.doneLabel
  }

  return props.importLabel
})

const summaryItems = computed(() =>
  props.summaryFields.map((field) => ({
    ...field,
    value: result.value?.[field.key] ?? 0,
  })),
)

const reset = () => {
  file.value = null
  result.value = null
  errorMessage.value = ''
}

const setProcessing = (nextValue) => {
  isProcessing.value = nextValue
  emit('processing', nextValue)
}

const close = () => {
  value.value = false
}

const importFile = async () => {
  if (!file.value) {
    errorMessage.value = props.selectFileMessage

    return
  }

  setProcessing(true)
  errorMessage.value = ''
  result.value = null

  try {
    result.value = await props.importAction(file.value)
    file.value = null
    emit('imported', result.value)
  } catch (error) {
    const apiError = normalizeApiError(error)

    errorMessage.value = apiError.message || props.errorFallback
  } finally {
    setProcessing(false)
  }
}

const confirm = () => {
  if (result.value) {
    close()

    return
  }

  void importFile()
}

const formatRowLabel = (row) => props.rowLabel.replace('{row}', row)

const formatRowErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return []
  }

  return Object.values(errors).flatMap((messages) =>
    Array.isArray(messages) ? messages : [messages],
  )
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      reset()
    }
  },
)
</script>

<template>
  <CardBoxModal
    v-model="value"
    :title="title"
    :button="buttonColor"
    :button-label="actionLabel"
    :button-icon="result ? null : mdiUpload"
    :cancel-icon="mdiClose"
    has-cancel
    is-form
    :is-processing="isProcessing"
    @confirm="confirm"
  >
    <div class="space-y-5">
      <div v-if="!result" class="space-y-3">
        <FormFilePicker v-model="file" :label="fileLabel" :accept="accept" :color="buttonColor" />
        <p v-if="fileHint" class="text-xs text-gray-500 dark:text-slate-400">
          {{ fileHint }}
        </p>
      </div>

      <div
        v-if="isProcessing"
        class="rounded-sm border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
      >
        {{ waitingMessage }}
      </div>

      <div
        v-if="errorMessage"
        class="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        {{ errorMessage }}
      </div>

      <div v-if="result" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="item in summaryItems"
            :key="item.key"
            class="rounded-sm border border-gray-200 px-3 py-2 dark:border-slate-700"
          >
            <p class="text-xs text-gray-500 dark:text-slate-400">{{ item.label }}</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {{ item.value }}
            </p>
          </div>
        </div>

        <div v-if="result.errors?.length" class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-slate-100">
            {{ errorsTitle }}
          </h3>
          <div
            class="max-h-64 divide-y divide-gray-200 overflow-y-auto rounded-sm border border-gray-200 dark:divide-slate-700 dark:border-slate-700"
          >
            <div
              v-for="rowError in result.errors"
              :key="rowError.row"
              class="space-y-2 px-3 py-2"
            >
              <p class="text-sm font-semibold text-gray-800 dark:text-slate-100">
                {{ formatRowLabel(rowError.row) }}
              </p>
              <ul class="list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-slate-300">
                <li
                  v-for="message in formatRowErrors(rowError.errors)"
                  :key="`${rowError.row}-${message}`"
                >
                  {{ message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-gray-500 dark:text-slate-400">
          {{ noRowErrorsLabel }}
        </p>
      </div>
    </div>
  </CardBoxModal>
</template>

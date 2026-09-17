<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  mdiAlertCircleOutline,
  mdiCheckCircleOutline,
  mdiClose,
  mdiFileDocumentOutline,
  mdiUpload,
} from '@mdi/js'
import { normalizeApiError } from '@/api/errors'
import type { ImportSummary, ImportSummaryField } from '@/types/import'

const DEFAULT_ACCEPT =
  '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  importAction: (file: File) => Promise<ImportSummary>
  summaryFields: ImportSummaryField[]
  accept?: string
  fileHint?: string
  importLabel?: string
  importingLabel?: string
  doneLabel?: string
}>(), {
  accept: DEFAULT_ACCEPT,
  fileHint: 'Archivos XLSX o XLS. La primera fila debe contener los encabezados.',
  importLabel: 'Importar archivo',
  importingLabel: 'Importando...',
  doneLabel: 'Cerrar',
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'imported', value: ImportSummary): void
  (event: 'processing', value: boolean): void
}>()

const file = ref<File | null>(null)
const result = ref<ImportSummary | null>(null)
const errorMessage = ref('')
const processing = ref(false)

const dialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const actionLabel = computed(() => {
  if (processing.value) return props.importingLabel
  if (result.value) return props.doneLabel
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

const setProcessing = (value: boolean) => {
  processing.value = value
  emit('processing', value)
}

const setFile = (value: File | File[] | null) => {
  file.value = Array.isArray(value) ? value[0] ?? null : value
  errorMessage.value = ''
}

const close = () => {
  if (!processing.value) dialog.value = false
}

const importFile = async () => {
  if (!file.value) {
    errorMessage.value = 'Selecciona un archivo antes de importar.'
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
    errorMessage.value = normalizeApiError(error).message
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

const rowErrorMessages = (errors: Record<string, string[]>) =>
  Object.values(errors).flatMap((messages) => messages)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) reset()
  },
)
</script>

<template>
  <v-dialog v-model="dialog" class="data-import-dialog-container" max-width="680" :persistent="processing">
    <v-card class="data-import-dialog">
      <v-card-title class="data-import-dialog__title">
        <span class="data-import-dialog__title-icon"><v-icon :icon="mdiUpload" size="19" /></span>
        <span>{{ title }}</span>
        <v-spacer />
        <v-btn :disabled="processing" :icon="mdiClose" size="small" variant="text" @click="close" />
      </v-card-title>

      <v-card-text class="data-import-dialog__body">
        <div v-if="!result" class="data-import-dialog__dropzone">
          <span class="data-import-dialog__file-icon"><v-icon :icon="mdiFileDocumentOutline" size="28" /></span>
          <strong>Selecciona el archivo de datos</strong>
          <span>Importa registros nuevos o actualizados desde una plantilla Excel.</span>
          <v-file-input
            class="data-import-dialog__file-input"
            clearable
            hide-details
            :accept="accept"
            label="Archivo Excel"
            prepend-icon=""
            show-size
            variant="outlined"
            :model-value="file"
            @update:model-value="setFile"
          />
          <small>{{ fileHint }}</small>
        </div>

        <v-alert v-if="processing" class="data-import-dialog__alert" :icon="mdiUpload" type="info" variant="tonal">
          Procesando el archivo y validando sus filas...
        </v-alert>

        <v-alert v-if="errorMessage" class="data-import-dialog__alert" :icon="mdiAlertCircleOutline" type="error" variant="tonal">
          {{ errorMessage }}
        </v-alert>

        <template v-if="result">
          <v-alert class="data-import-dialog__result" :icon="result.rows_with_errors ? mdiAlertCircleOutline : mdiCheckCircleOutline" :type="result.rows_with_errors ? 'warning' : 'success'" variant="tonal">
            {{ result.rows_with_errors ? 'La importación terminó con algunas filas pendientes de revisión.' : 'La importación terminó correctamente.' }}
          </v-alert>

          <div class="data-import-dialog__summary">
            <article v-for="item in summaryItems" :key="item.key" class="data-import-dialog__summary-card">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>

          <div v-if="result.errors.length" class="data-import-dialog__errors">
            <h3>Filas con errores</h3>
            <div class="data-import-dialog__error-list">
              <article v-for="rowError in result.errors" :key="rowError.row" class="data-import-dialog__error-row">
                <strong>Fila {{ rowError.row }}</strong>
                <ul>
                  <li v-for="message in rowErrorMessages(rowError.errors)" :key="`${rowError.row}-${message}`">
                    {{ message }}
                  </li>
                </ul>
              </article>
            </div>
          </div>

          <p v-else class="data-import-dialog__no-errors">No se reportaron errores por fila.</p>
        </template>
      </v-card-text>

      <v-card-actions class="data-import-dialog__actions">
        <v-btn :disabled="processing" variant="text" @click="close">{{ result ? 'Cerrar' : 'Cancelar' }}</v-btn>
        <v-btn color="primary" :disabled="!result && !file" :loading="processing" @click="confirm">
          <v-icon v-if="!result" :icon="mdiUpload" class="mr-2" size="17" />
          {{ actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style src="@/styles/components/data-import.scss" lang="scss"></style>

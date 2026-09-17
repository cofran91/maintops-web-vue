<script setup lang="ts">
import { computed } from 'vue'
import { mdiAlertOutline, mdiClose, mdiTrashCanOutline } from '@mdi/js'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  processing?: boolean
}>(), {
  confirmLabel: 'Eliminar',
  cancelLabel: 'Cancelar',
  processing: false,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'confirm'): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const close = () => {
  if (!props.processing) dialog.value = false
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="450" :persistent="processing">
    <v-card class="confirm-delete-dialog">
      <v-card-title class="confirm-delete-dialog__title">
        <span class="confirm-delete-dialog__icon"><v-icon :icon="mdiAlertOutline" size="21" /></span>
        <span>{{ title }}</span>
        <v-spacer />
        <v-btn :disabled="processing" :icon="mdiClose" size="small" variant="text" @click="close" />
      </v-card-title>
      <v-card-text class="confirm-delete-dialog__message">{{ message }}</v-card-text>
      <v-card-actions class="confirm-delete-dialog__actions">
        <v-btn :disabled="processing" variant="text" @click="close">{{ cancelLabel }}</v-btn>
        <v-btn color="error" :loading="processing" @click="emit('confirm')">
          <v-icon :icon="mdiTrashCanOutline" class="mr-2" size="17" />
          {{ confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style src="@/styles/components/confirm-delete.scss" lang="scss"></style>

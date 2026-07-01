<script setup>
import { computed } from 'vue'
import { mdiClose, mdiTrashCanOutline } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  deleteLabel: {
    type: String,
    required: true,
  },
  processing: Boolean,
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <CardBoxModal
    v-model="isOpen"
    :title="title"
    button="danger"
    :button-label="deleteLabel"
    :button-icon="mdiTrashCanOutline"
    :cancel-icon="mdiClose"
    has-cancel
    :is-processing="processing"
    @confirm="$emit('confirm')"
  >
    <p>{{ message }}</p>
    <slot />
  </CardBoxModal>
</template>

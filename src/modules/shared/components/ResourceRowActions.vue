<script setup>
import { mdiEyeOutline, mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'

defineProps({
  detailTo: {
    type: Object,
    required: true,
  },
  editTo: {
    type: Object,
    required: true,
  },
  canUpdate: Boolean,
  canDelete: Boolean,
  openLabel: {
    type: String,
    required: true,
  },
  editLabel: {
    type: String,
    required: true,
  },
  deleteLabel: {
    type: String,
    required: true,
  },
})

defineEmits(['delete'])
</script>

<template>
  <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
    <BaseButton
      :to="detailTo"
      color="whiteDark"
      :icon="mdiEyeOutline"
      :title="openLabel"
      :aria-label="openLabel"
      small
    />
    <BaseButton
      v-if="canUpdate"
      :to="editTo"
      color="whiteDark"
      :icon="mdiPencil"
      :title="editLabel"
      :aria-label="editLabel"
      small
    />
    <BaseButton
      v-if="canDelete"
      color="danger"
      :icon="mdiTrashCanOutline"
      :title="deleteLabel"
      :aria-label="deleteLabel"
      small
      @click="$emit('delete')"
    />
  </BaseButtons>
</template>

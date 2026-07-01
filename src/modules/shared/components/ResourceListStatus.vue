<script setup>
import { mdiRefresh } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import NotificationBar from '@/components/NotificationBar.vue'

defineProps({
  errorMessage: {
    type: String,
    default: '',
  },
  loading: Boolean,
  loadingLabel: {
    type: String,
    required: true,
  },
  retryLabel: {
    type: String,
    required: true,
  },
  retryIcon: {
    type: String,
    default: mdiRefresh,
  },
})

defineEmits(['retry'])
</script>

<template>
  <NotificationBar v-if="errorMessage" color="danger" :icon="retryIcon">
    {{ errorMessage }}
    <template #right>
      <BaseButton
        color="white"
        :icon="retryIcon"
        :title="retryLabel"
        :aria-label="retryLabel"
        small
        @click="$emit('retry')"
      />
    </template>
  </NotificationBar>

  <CardBox v-if="loading">
    <p class="text-sm text-gray-500 dark:text-slate-400">
      {{ loadingLabel }}
    </p>
  </CardBox>
</template>

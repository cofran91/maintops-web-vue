<script setup>
import { mdiInboxOutline } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'

defineProps({
  icon: {
    type: String,
    default: mdiInboxOutline,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <CardBox>
    <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
      <BaseIcon :path="icon" size="42" class="mb-4 text-gray-400 dark:text-slate-500" />
      <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">{{ title }}</h2>
      <p class="mt-2 max-w-md text-sm text-gray-500 dark:text-slate-400">{{ description }}</p>
      <div v-if="$slots.default" class="mt-5">
        <slot />
      </div>
    </div>
  </CardBox>
</template>

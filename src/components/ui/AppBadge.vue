<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'info',
  },
  icon: String,
})

const colorClass = computed(() => {
  const colors = {
    info: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300',
    success:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    warning:
      'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-300',
    danger: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300',
    neutral:
      'bg-gray-100 text-gray-700 ring-gray-600/20 dark:bg-slate-700 dark:text-slate-200',
  }

  return colors[props.color] ?? colors.info
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
    :class="colorClass"
  >
    <BaseIcon v-if="icon" :path="icon" size="14" />
    {{ label }}
  </span>
</template>

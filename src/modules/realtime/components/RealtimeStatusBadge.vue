<script setup>
import { computed } from 'vue'
import { useRealtimeConnection } from '@/modules/realtime/services/realtimeClientService.js'

const realtimeConnection = useRealtimeConnection()

const statusMeta = computed(() => {
  const statuses = {
    disabled: {
      label: 'Realtime disabled',
      shortLabel: 'Off',
      classes: 'border-gray-200 text-gray-500 dark:border-slate-700 dark:text-slate-400',
      dot: 'bg-gray-400',
    },
    disconnected: {
      label: 'Realtime disconnected',
      shortLabel: 'Disconnected',
      classes: 'border-gray-200 text-gray-500 dark:border-slate-700 dark:text-slate-400',
      dot: 'bg-gray-400',
    },
    connecting: {
      label: 'Realtime connecting',
      shortLabel: 'Connecting',
      classes: 'border-blue-100 text-blue-600 dark:border-blue-500/30 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    connected: {
      label: 'Realtime connected',
      shortLabel: 'Live',
      classes: 'border-emerald-100 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    error: {
      label: 'Realtime error',
      shortLabel: 'Error',
      classes: 'border-red-100 text-red-600 dark:border-red-500/30 dark:text-red-300',
      dot: 'bg-red-500',
    },
  }

  return statuses[realtimeConnection.status] ?? statuses.disconnected
})
</script>

<template>
  <div
    class="flex items-center px-2"
    :title="realtimeConnection.errorMessage || statusMeta.label"
    :aria-label="realtimeConnection.errorMessage || statusMeta.label"
  >
    <div
      class="inline-flex h-8 items-center gap-2 rounded-sm border px-2 text-xs font-semibold"
      :class="statusMeta.classes"
    >
      <span class="h-2 w-2 rounded-full" :class="statusMeta.dot" />
      <span class="hidden whitespace-nowrap lg:inline">{{ statusMeta.shortLabel }}</span>
    </div>
  </div>
</template>

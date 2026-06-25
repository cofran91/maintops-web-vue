<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { onApiUnauthorized } from '@/api/http.js'
import { clearRealtimePresence } from '@/modules/realtime/services/realtimePresenceService.js'
import {
  startRealtime,
  stopRealtime,
} from '@/modules/realtime/services/realtimeClientService.js'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const removeUnauthorizedListener = onApiUnauthorized(() => {
  stopRealtime()
  clearRealtimePresence()
})

const stopWatchingAuth = watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      startRealtime()
      return
    }

    stopRealtime()
    clearRealtimePresence()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopWatchingAuth()
  removeUnauthorizedListener()
  stopRealtime()
  clearRealtimePresence()
})
</script>

<template>
  <slot />
</template>

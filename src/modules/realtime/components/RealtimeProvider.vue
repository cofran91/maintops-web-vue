<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { onApiUnauthorized } from '@/api/http.js'
import OperationalEventToast from '@/modules/realtime/components/OperationalEventToast.vue'
import { clearLiveActivity } from '@/modules/realtime/services/liveActivityService.js'
import { clearRealtimePresence } from '@/modules/realtime/services/realtimePresenceService.js'
import {
  startRealtime,
  stopRealtime,
} from '@/modules/realtime/services/realtimeClientService.js'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const removeUnauthorizedListener = onApiUnauthorized(() => {
  stopRealtime()
  clearLiveActivity()
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
    clearLiveActivity()
    clearRealtimePresence()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopWatchingAuth()
  removeUnauthorizedListener()
  stopRealtime()
  clearLiveActivity()
  clearRealtimePresence()
})
</script>

<template>
  <slot />
  <OperationalEventToast />
</template>

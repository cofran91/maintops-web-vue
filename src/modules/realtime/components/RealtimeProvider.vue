<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { onApiUnauthorized } from '@/api/http.js'
import OperationalEventToast from '@/modules/realtime/components/OperationalEventToast.vue'
import { setLiveActivityScope } from '@/modules/realtime/services/liveActivityService.js'
import { clearRealtimePresence } from '@/modules/realtime/services/realtimePresenceService.js'
import {
  startRealtime,
  stopRealtime,
} from '@/modules/realtime/services/realtimeClientService.js'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const removeUnauthorizedListener = onApiUnauthorized(() => {
  stopRealtime()
  setLiveActivityScope(null)
  clearRealtimePresence()
})

const stopWatchingAuth = watch(
  () => [authStore.isAuthenticated, authStore.user?.id],
  ([isAuthenticated, userId]) => {
    if (isAuthenticated) {
      setLiveActivityScope(userId)
      startRealtime()
      return
    }

    stopRealtime()
    setLiveActivityScope(null)
    clearRealtimePresence()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopWatchingAuth()
  removeUnauthorizedListener()
  stopRealtime()
  setLiveActivityScope(null)
  clearRealtimePresence()
})
</script>

<template>
  <slot />
  <OperationalEventToast />
</template>

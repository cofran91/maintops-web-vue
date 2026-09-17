<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { onApiUnauthorized } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import {
  startRealtime,
  stopRealtime,
} from '@/modules/realtime/services/realtimeClientService'
import {
  setLiveActivityScope,
  startLiveActivity,
  stopLiveActivity,
} from '@/modules/realtime/services/liveActivityService'
import { clearRealtimePresence } from '@/modules/realtime/services/realtimePresenceService'
import OperationalEventToast from '@/components/layout/OperationalEventToast.vue'

const authStore = useAuthStore()

const stopWatchingAuth = watch(
  () => [authStore.isAuthenticated, authStore.user?.id],
  ([isAuthenticated, userId]) => {
    if (isAuthenticated) {
      setLiveActivityScope(typeof userId === 'number' ? userId : null)
      startLiveActivity()
      startRealtime()
      return
    }

    stopLiveActivity()
    setLiveActivityScope(null)
    clearRealtimePresence()
    stopRealtime()
  },
  { immediate: true },
)

const removeUnauthorizedListener = onApiUnauthorized(() => {
  clearRealtimePresence()
  stopRealtime()
})

onBeforeUnmount(() => {
  stopWatchingAuth()
  removeUnauthorizedListener()
  stopLiveActivity()
  setLiveActivityScope(null)
  clearRealtimePresence()
  stopRealtime()
})
</script>

<template>
  <slot />
  <OperationalEventToast />
</template>

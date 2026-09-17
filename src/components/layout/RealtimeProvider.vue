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
    stopRealtime()
  },
  { immediate: true },
)

const removeUnauthorizedListener = onApiUnauthorized(() => stopRealtime())

onBeforeUnmount(() => {
  stopWatchingAuth()
  removeUnauthorizedListener()
  stopLiveActivity()
  setLiveActivityScope(null)
  stopRealtime()
})
</script>

<template>
  <slot />
  <OperationalEventToast />
</template>

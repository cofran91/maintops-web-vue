<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { onApiUnauthorized } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import {
  startRealtime,
  stopRealtime,
} from '@/modules/realtime/services/realtimeClientService'

const authStore = useAuthStore()

const stopWatchingAuth = watch(
  () => [authStore.isAuthenticated, authStore.user?.id],
  ([isAuthenticated]) => {
    if (isAuthenticated) {
      startRealtime()
      return
    }

    stopRealtime()
  },
  { immediate: true },
)

const removeUnauthorizedListener = onApiUnauthorized(() => stopRealtime())

onBeforeUnmount(() => {
  stopWatchingAuth()
  removeUnauthorizedListener()
  stopRealtime()
})
</script>

<template>
  <slot />
</template>

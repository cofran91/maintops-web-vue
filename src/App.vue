<script setup>
import { RouterView } from 'vue-router'
import RealtimeProvider from '@/modules/realtime/components/RealtimeProvider.vue'
</script>

<template>
  <RealtimeProvider>
    <RouterView />
  </RealtimeProvider>
</template>

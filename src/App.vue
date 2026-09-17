<script setup lang="ts">
import { RouterView } from 'vue-router'
import RealtimeProvider from '@/components/layout/RealtimeProvider.vue'
</script>

<template>
  <v-app>
    <RealtimeProvider>
      <RouterView />
    </RealtimeProvider>
  </v-app>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from 'vuetify'
import RealtimeProvider from '@/components/layout/RealtimeProvider.vue'
import { useThemeStore } from '@/stores/theme'

const vuetifyTheme = useTheme()
const themeStore = useThemeStore()
themeStore.initialize()

watch(
  () => themeStore.isDark,
  (isDark) => {
    vuetifyTheme.global.name.value = isDark ? 'maintopsDark' : 'maintopsLight'
  },
  { immediate: true },
)
</script>

<template>
  <v-app>
    <RealtimeProvider>
      <RouterView />
    </RealtimeProvider>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { t } = useI18n()
const label = computed(() => themeStore.isDark ? t('theme.switchToLight') : t('theme.switchToDark'))
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :aria-label="label"
        class="theme-switcher"
        :icon="themeStore.isDark ? mdiWhiteBalanceSunny : mdiWeatherNight"
        rounded="lg"
        size="small"
        variant="tonal"
        @click="themeStore.toggle"
      />
    </template>
    <span>{{ label }}</span>
  </v-tooltip>
</template>

<style scoped src="@/styles/components/theme-switcher.scss" lang="scss"></style>

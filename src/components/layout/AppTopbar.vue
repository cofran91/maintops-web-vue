<script setup lang="ts">
import {
  mdiChevronDown,
  mdiMagnify,
  mdiMenu,
} from '@mdi/js'
import { useI18n } from 'vue-i18n'
import RealtimeActivityTray from '@/components/layout/RealtimeActivityTray.vue'
import RealtimeStatusBadge from '@/components/layout/RealtimeStatusBadge.vue'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'

withDefaults(defineProps<{
  userName: string
  userInitials: string
  context?: string
}>(), {
  context: '',
})

const emit = defineEmits<{
  (event: 'openMenu'): void
}>()

const { t } = useI18n()
</script>

<template>
  <v-app-bar class="topbar" color="#ffffff" flat height="76">
    <v-btn
      class="topbar-menu"
      :icon="mdiMenu"
      :aria-label="t('topbar.openNavigation')"
      variant="text"
      @click="emit('openMenu')"
    />

    <div class="topbar-context">
      <small>MaintOps</small>
      <span>{{ context || t('topbar.operationalPanel') }}</span>
    </div>

    <v-spacer />

    <div class="topbar-search">
      <v-icon :icon="mdiMagnify" size="20" />
      <input :aria-label="t('topbar.search')" :placeholder="t('topbar.searchPlaceholder')" type="search" />
      <kbd>⌘ K</kbd>
    </div>

    <LanguageSwitcher />

    <ThemeSwitcher />

    <RealtimeActivityTray />

    <span class="topbar-realtime-status"><RealtimeStatusBadge /></span>

    <span class="topbar-divider" />

    <button class="profile-button" type="button">
      <span class="profile-avatar">{{ userInitials }}</span>
      <span class="profile-copy"><strong>{{ userName }}</strong><small>{{ t('topbar.administrator') }}</small></span>
      <v-icon :icon="mdiChevronDown" size="17" />
    </button>
  </v-app-bar>
</template>

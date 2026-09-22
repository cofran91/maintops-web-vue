<script setup lang="ts">
import {
  mdiChevronDown,
  mdiMagnify,
  mdiMenu,
  mdiLogoutVariant,
} from '@mdi/js'
import { useI18n } from 'vue-i18n'
import RealtimeActivityTray from '@/components/layout/RealtimeActivityTray.vue'
import RealtimeStatusBadge from '@/components/layout/RealtimeStatusBadge.vue'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  userName: string
  userInitials: string
  context?: string
  showSearch?: boolean
}>(), {
  context: '',
  showSearch: true,
})

const emit = defineEmits<{
  (event: 'openMenu'): void
  (event: 'signOut'): void
}>()
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
      <span>{{ props.context || t('topbar.operationalPanel') }}</span>
    </div>

    <v-spacer />

    <div v-if="props.showSearch" class="topbar-search">
      <v-icon :icon="mdiMagnify" size="20" />
      <input :aria-label="t('topbar.search')" :placeholder="t('topbar.searchPlaceholder')" type="search" />
      <kbd>⌘ K</kbd>
    </div>

    <LanguageSwitcher />

    <ThemeSwitcher />

    <RealtimeActivityTray />

    <span class="topbar-realtime-status"><RealtimeStatusBadge /></span>

    <span class="topbar-divider" />

    <v-menu location="bottom end" min-width="220">
      <template #activator="{ props: menuProps }">
        <button v-bind="menuProps" class="profile-button" type="button">
          <span class="profile-avatar">{{ props.userInitials }}</span>
          <span class="profile-copy"><strong>{{ props.userName }}</strong><small>{{ t('topbar.administrator') }}</small></span>
          <v-icon :icon="mdiChevronDown" size="17" />
        </button>
      </template>
      <v-list density="compact" nav>
        <v-list-item
          :prepend-icon="mdiLogoutVariant"
          :title="t('nav.signOut')"
          @click="emit('signOut')"
        />
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

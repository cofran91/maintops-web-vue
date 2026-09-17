<script setup lang="ts">
import {
  mdiBellOutline,
  mdiChevronDown,
  mdiMagnify,
  mdiMenu,
} from '@mdi/js'

withDefaults(defineProps<{
  userName: string
  userInitials: string
  context?: string
}>(), {
  context: 'Panel de operación',
})

const emit = defineEmits<{
  (event: 'openMenu'): void
}>()
</script>

<template>
  <v-app-bar class="topbar" color="#ffffff" flat height="76">
    <v-btn
      class="topbar-menu"
      :icon="mdiMenu"
      aria-label="Abrir navegación"
      variant="text"
      @click="emit('openMenu')"
    />

    <div class="topbar-context">
      <small>MaintOps</small>
      <span>{{ context }}</span>
    </div>

    <v-spacer />

    <div class="topbar-search">
      <v-icon :icon="mdiMagnify" size="20" />
      <input aria-label="Buscar" placeholder="Buscar orden, vehículo o placa..." type="search" />
      <kbd>⌘ K</kbd>
    </div>

    <button class="notification-button" aria-label="Notificaciones" type="button">
      <v-icon :icon="mdiBellOutline" size="22" />
      <i />
    </button>

    <span class="topbar-divider" />

    <button class="profile-button" type="button">
      <span class="profile-avatar">{{ userInitials }}</span>
      <span class="profile-copy"><strong>{{ userName }}</strong><small>Administrador</small></span>
      <v-icon :icon="mdiChevronDown" size="17" />
    </button>
  </v-app-bar>
</template>

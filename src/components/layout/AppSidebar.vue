<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountGroupOutline,
  mdiCalendarClockOutline,
  mdiCalendarMonthOutline,
  mdiCarMultiple,
  mdiChartBoxOutline,
  mdiChevronDown,
  mdiChevronRight,
  mdiClipboardTextOutline,
  mdiCogOutline,
  mdiGarageVariant,
  mdiHelpCircleOutline,
  mdiLogoutVariant,
  mdiViewDashboardOutline,
  mdiWrenchCogOutline,
} from '@mdi/js'

defineProps<{
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'signOut'): void
}>()

const { mdAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()

const navigation = [
  { label: 'Inicio', icon: mdiViewDashboardOutline, route: 'dashboard' },
  { label: 'Órdenes de mantenimiento', icon: mdiClipboardTextOutline, route: 'orders', badge: '12' },
  { label: 'Vehículos', icon: mdiCarMultiple, route: 'vehicles' },
  { label: 'Propietarios', icon: mdiAccountGroupOutline, route: 'owners' },
  { label: 'Planes de mantenimiento', icon: mdiCalendarClockOutline },
  { label: 'Talleres', icon: mdiGarageVariant, route: 'workshops' },
  { label: 'Usuarios', icon: mdiAccountGroupOutline },
]

const analysisNavigation = [
  { label: 'Analítica', icon: mdiChartBoxOutline },
  { label: 'Reportes', icon: mdiCalendarMonthOutline },
]

const closeOnMobile = () => {
  if (mdAndDown.value) {
    emit('close')
  }
}

const navigate = (routeName?: string) => {
  closeOnMobile()

  if (routeName) {
    void router.push({ name: routeName })
  }
}

const isActive = (routeName?: string) => routeName === route.name
</script>

<template>
  <v-navigation-drawer
    :model-value="mobileOpen || !mdAndDown"
    :temporary="mdAndDown"
    class="sidebar"
    color="#111d35"
    width="270"
    @update:model-value="closeOnMobile"
  >
    <div class="sidebar__content">
      <div class="sidebar-brand">
        <span class="sidebar-brand__mark">
          <v-icon :icon="mdiWrenchCogOutline" size="22" />
        </span>
        <span>Maint<strong>Ops</strong></span>
      </div>

      <div class="workspace-switcher">
        <span class="workspace-avatar">AT</span>
        <div><small>Organización</small><strong>Autofleet Transportes</strong></div>
        <v-icon :icon="mdiChevronDown" size="17" />
      </div>

      <nav class="sidebar-nav" aria-label="Navegación principal">
        <span class="nav-section-label">Operación</span>
        <button
          v-for="item in navigation"
          :key="item.label"
          :class="['nav-item', { 'nav-item--active': isActive(item.route) }]"
          type="button"
          @click="navigate(item.route)"
        >
          <v-icon :icon="item.icon" size="20" />
          <span>{{ item.label }}</span>
          <small v-if="item.badge">{{ item.badge }}</small>
        </button>

        <span class="nav-section-label nav-section-label--spaced">Análisis</span>
        <button
          v-for="item in analysisNavigation"
          :key="item.label"
          class="nav-item"
          type="button"
          @click="closeOnMobile"
        >
          <v-icon :icon="item.icon" size="20" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-help">
        <span><v-icon :icon="mdiHelpCircleOutline" size="21" /></span>
        <div><strong>¿Necesitas ayuda?</strong><small>Consulta el centro de soporte</small></div>
        <v-icon :icon="mdiChevronRight" size="18" />
      </div>

      <div class="sidebar-bottom">
        <button class="nav-item" type="button">
          <v-icon :icon="mdiCogOutline" size="20" />
          <span>Configuración</span>
        </button>
        <button class="nav-item" type="button" @click="emit('signOut')">
          <v-icon :icon="mdiLogoutVariant" size="20" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'
import { canAccessRoute } from '@/auth/permissions'
import { useAuthStore } from '@/stores/auth'
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
  mdiHistory,
  mdiLogoutVariant,
  mdiViewDashboardOutline,
  mdiWrenchCogOutline,
  mdiWrenchOutline,
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
const authStore = useAuthStore()
const { t } = useI18n()

const navigation = [
  { labelKey: 'nav.home', icon: mdiViewDashboardOutline, route: 'dashboard' },
  { labelKey: 'nav.orders', icon: mdiClipboardTextOutline, route: 'orders', badge: '12' },
  { labelKey: 'nav.vehicles', icon: mdiCarMultiple, route: 'vehicles' },
  { labelKey: 'nav.owners', icon: mdiAccountGroupOutline, route: 'owners' },
  { labelKey: 'nav.plans', icon: mdiCalendarClockOutline, route: 'maintenance-plans' },
  { labelKey: 'nav.tasks', icon: mdiWrenchOutline, route: 'maintenance-tasks' },
  { labelKey: 'nav.workshops', icon: mdiGarageVariant, route: 'workshops' },
  { labelKey: 'nav.users', icon: mdiAccountGroupOutline, route: 'users' },
]

const analysisNavigation = [
  { labelKey: 'nav.analytics', icon: mdiChartBoxOutline, route: 'analytics' },
  { labelKey: 'nav.reports', icon: mdiCalendarMonthOutline, route: 'reports' },
  { labelKey: 'nav.audits', icon: mdiHistory, route: 'access-audit' },
]

const visibleNavigation = computed(() =>
  navigation.filter((item) => canAccessRoute(item.route, authStore.user?.roles)),
)
const visibleAnalysisNavigation = computed(() =>
  analysisNavigation.filter((item) => canAccessRoute(item.route, authStore.user?.roles)),
)

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

      <nav class="sidebar-nav" aria-label="Navegación principal">
        <span class="nav-section-label">{{ t('nav.operation') }}</span>
        <button
          v-for="item in visibleNavigation"
          :key="item.route"
          :class="['nav-item', { 'nav-item--active': isActive(item.route) }]"
          type="button"
          @click="navigate(item.route)"
        >
          <v-icon :icon="item.icon" size="20" />
          <span>{{ t(item.labelKey) }}</span>
          <small v-if="item.badge">{{ item.badge }}</small>
        </button>

        <span class="nav-section-label nav-section-label--spaced">{{ t('nav.analysis') }}</span>
        <button
          v-for="item in visibleAnalysisNavigation"
          :key="item.route"
          :class="['nav-item', { 'nav-item--active': isActive(item.route) }]"
          type="button"
          @click="navigate(item.route)"
        >
          <v-icon :icon="item.icon" size="20" />
          <span>{{ t(item.labelKey) }}</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <button class="nav-item" type="button" @click="emit('signOut')">
          <v-icon :icon="mdiLogoutVariant" size="20" />
          <span>{{ t('nav.signOut') }}</span>
        </button>
      </div>
    </div>
  </v-navigation-drawer>
</template>

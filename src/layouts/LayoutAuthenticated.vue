<script setup>
import { mdiBackburger, mdiForwardburger, mdiMenu } from '@mdi/js'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filterNavigationByPermissions } from '@/auth/permissions.js'
import { menuAsideMain, menuAsideBottom } from '@/menuAside.js'
import menuNavBar from '@/menuNavBar.js'
import { useDarkModeStore } from '@/stores/darkMode.js'
import BaseIcon from '@/components/BaseIcon.vue'
import NavBar from '@/components/NavBar.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import AsideMenu from '@/components/AsideMenu.vue'
import FooterBar from '@/components/FooterBar.vue'
import RealtimeActivityTray from '@/modules/realtime/components/RealtimeActivityTray.vue'
import RealtimeStatusBadge from '@/modules/realtime/components/RealtimeStatusBadge.vue'
import { useAuthStore } from '@/stores/auth.js'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { localizedRouteSection, localizedRouteTitle } from '@/i18n/routeLabels.js'

const layoutAsidePadding = 'xl:pl-60'

const darkModeStore = useDarkModeStore()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)

const routeTitle = computed(() => localizedRouteTitle(route))
const routeSection = computed(() => localizedRouteSection(route))
const filteredMenuAsideMain = computed(() =>
  filterNavigationByPermissions(menuAsideMain, authStore.roles),
)

const closeAside = () => {
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
}

watch(() => route.fullPath, () => {
  closeAside()
})

const menuClick = async (event, item) => {
  if (item.isToggleLightDark) {
    darkModeStore.set(null, true)
  }

  if (item.isLogout) {
    event.preventDefault()
    await authStore.logout()
    await router.replace('/login')
  }
}
</script>

<template>
  <div
    :class="{
      'overflow-hidden lg:overflow-visible': isAsideMobileExpanded,
    }"
  >
    <div
      :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
      class="min-h-screen w-screen bg-gray-50 pt-14 transition-(--transition-position)
        lg:w-auto dark:bg-slate-800 dark:text-slate-100"
    >
      <NavBar
        :menu="menuNavBar"
        :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
        @menu-click="menuClick"
      >
        <NavBarItemPlain
          display="flex lg:hidden"
          @click.prevent="isAsideMobileExpanded = !isAsideMobileExpanded"
        >
          <BaseIcon :path="isAsideMobileExpanded ? mdiBackburger : mdiForwardburger" size="24" />
        </NavBarItemPlain>
        <NavBarItemPlain display="hidden lg:flex xl:hidden" @click.prevent="isAsideLgActive = true">
          <BaseIcon :path="mdiMenu" size="24" />
        </NavBarItemPlain>
        <div class="flex min-w-0 flex-1 items-center px-3">
          <div class="min-w-0">
            <p class="hidden text-xs font-semibold text-blue-600 md:block dark:text-blue-300">
              {{ routeSection }}
            </p>
            <p class="truncate text-sm font-semibold text-gray-700 dark:text-slate-100">
              {{ routeTitle }}
            </p>
          </div>
        </div>
        <div class="flex items-center px-2">
          <LanguageSwitcher compact />
        </div>
        <RealtimeStatusBadge />
        <RealtimeActivityTray />
      </NavBar>
      <AsideMenu
        :is-aside-mobile-expanded="isAsideMobileExpanded"
        :is-aside-lg-active="isAsideLgActive"
        :menu="filteredMenuAsideMain"
        :menu-bottom="menuAsideBottom"
        @menu-click="menuClick"
        @aside-lg-close-click="closeAside"
      />
      <slot />
      <FooterBar />
    </div>
  </div>
</template>

<script setup>
import { mdiBackburger, mdiBellOutline, mdiForwardburger, mdiMenu } from '@mdi/js'
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
import RealtimeStatusBadge from '@/modules/realtime/components/RealtimeStatusBadge.vue'
import { useAuthStore } from '@/stores/auth.js'

const layoutAsidePadding = 'xl:pl-60'

const darkModeStore = useDarkModeStore()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)
const isNotificationsOpen = ref(false)

const routeTitle = computed(() => route.meta?.title ?? 'Dashboard')
const routeSection = computed(() => route.meta?.section ?? 'MaintOps')
const filteredMenuAsideMain = computed(() =>
  filterNavigationByPermissions(menuAsideMain, authStore.roles),
)

const closeAside = () => {
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
}

watch(() => route.fullPath, () => {
  closeAside()
  isNotificationsOpen.value = false
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
      class="min-h-screen w-screen bg-gray-50 pt-14 transition-(--transition-position) lg:w-auto dark:bg-slate-800 dark:text-slate-100"
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
        <RealtimeStatusBadge />
        <NavBarItemPlain display="flex" @click.prevent="isNotificationsOpen = !isNotificationsOpen">
          <div class="relative">
            <BaseIcon :path="mdiBellOutline" size="22" />
            <span
              class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2
                ring-gray-50 dark:ring-slate-800"
            />
          </div>
        </NavBarItemPlain>
      </NavBar>
      <div
        v-if="isNotificationsOpen"
        class="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-md border border-gray-100
          bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <p class="font-semibold text-gray-900 dark:text-slate-100">No notifications</p>
        <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">No new activity.</p>
      </div>
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

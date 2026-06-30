<script setup>
import { computed, ref, watch } from 'vue'
import { mdiBellOutline, mdiCheck, mdiClose } from '@mdi/js'
import { useRoute } from 'vue-router'
import AppBadge from '@/components/ui/AppBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import { useLiveActivity } from '@/modules/realtime/services/liveActivityService.js'
import { useI18n } from 'vue-i18n'

const open = ref(false)
const route = useRoute()
const { locale, t } = useI18n()
const {
  activities,
  unreadCount,
  dismissLiveActivity,
  markAllLiveActivitiesAsRead,
} = useLiveActivity()

const countLabel = computed(() =>
  unreadCount.value > 99 ? '99+' : String(unreadCount.value),
)

const relativeTime = (timestamp) => {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))

  if (seconds < 60) {
    return t('realtime.relativeTime.justNow')
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return t('realtime.relativeTime.minutesAgo', { count: minutes })
  }

  const hours = Math.floor(minutes / 60)

  return hours < 24
    ? t('realtime.relativeTime.hoursAgo', { count: hours })
    : new Intl.DateTimeFormat(locale.value).format(timestamp)
}

const dateTime = (timestamp) => new Date(timestamp).toISOString()

const kindLabel = (kind) => (kind === 'item' ? t('realtime.activity.item') : t('realtime.activity.order'))

const kindColor = (kind) => (kind === 'item' ? 'warning' : 'info')

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
</script>

<template>
  <div class="flex items-stretch">
    <NavBarItemPlain
      display="flex"
      :title="t('realtime.activity.notifications')"
      :aria-label="t('realtime.activity.notifications')"
      :aria-expanded="open"
      aria-controls="realtime-notifications-panel"
      role="button"
      tabindex="0"
      @click.prevent="open = !open"
      @keydown.enter.prevent="open = !open"
      @keydown.space.prevent="open = !open"
    >
      <div class="relative">
        <BaseIcon :path="mdiBellOutline" size="22" />
        <span
          v-if="unreadCount > 0"
          class="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full
            bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-gray-50
            dark:ring-slate-800"
        >
          {{ countLabel }}
        </span>
      </div>
    </NavBarItemPlain>

    <aside
      v-if="open"
      id="realtime-notifications-panel"
      class="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-md rounded-sm border
        border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
      :aria-label="t('realtime.activity.notifications')"
    >
      <header
        class="flex items-start justify-between gap-3 border-b border-gray-100 p-4
          dark:border-slate-700"
      >
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-slate-100">
            {{ t('realtime.activity.notifications') }}
          </h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
            {{ t('realtime.activity.storedUntilRead') }}
          </p>
        </div>
        <div class="flex flex-none items-center gap-2">
          <BaseButton
            v-if="activities.length > 0"
            color="whiteDark"
            :icon="mdiCheck"
            :title="t('realtime.activity.clear')"
            :aria-label="t('realtime.activity.clear')"
            small
            @click="markAllLiveActivitiesAsRead"
          />
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            :title="t('realtime.activity.close')"
            :aria-label="t('realtime.activity.close')"
            small
            @click="open = false"
          />
        </div>
      </header>

      <ul v-if="activities.length > 0" class="max-h-[28rem] overflow-y-auto">
        <li
          v-for="activity in activities"
          :key="activity.id"
          class="flex items-start gap-3 border-b border-gray-100 p-4 last:border-b-0
            dark:border-slate-700"
        >
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex items-center gap-2">
              <AppBadge :label="kindLabel(activity.kind)" :color="kindColor(activity.kind)" />
              <time
                class="text-xs text-gray-500 dark:text-slate-400"
                :datetime="dateTime(activity.occurredAt)"
              >
                {{ relativeTime(activity.occurredAt) }}
              </time>
            </div>
            <p class="text-sm font-semibold text-gray-800 dark:text-slate-100">
              {{ activity.message }}
            </p>
          </div>
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            :title="t('realtime.activity.dismiss')"
            :aria-label="t('realtime.activity.dismiss')"
            small
            @click="dismissLiveActivity(activity.id)"
          />
        </li>
      </ul>

      <div v-else class="p-6 text-center">
        <p class="text-sm font-semibold text-gray-900 dark:text-slate-100">
          {{ t('realtime.activity.emptyTitle') }}
        </p>
        <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
          {{ t('realtime.activity.emptyDescription') }}
        </p>
      </div>
    </aside>
  </div>
</template>

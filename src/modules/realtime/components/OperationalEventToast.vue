<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { mdiBellRingOutline, mdiClose } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import {
  hideLiveActivityToast,
  useLiveActivity,
} from '@/modules/realtime/services/liveActivityService.js'
import { useI18n } from 'vue-i18n'

const TOAST_VISIBLE_MS = 5000
const { latestActivity } = useLiveActivity()
const { t } = useI18n()
let dismissTimer = null

const clearDismissTimer = () => {
  if (dismissTimer === null) {
    return
  }

  clearTimeout(dismissTimer)
  dismissTimer = null
}

watch(
  latestActivity,
  (activity) => {
    clearDismissTimer()

    if (activity === null) {
      return
    }

    dismissTimer = setTimeout(() => {
      hideLiveActivityToast(activity.id)
      dismissTimer = null
    }, TOAST_VISIBLE_MS)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearDismissTimer()
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="latestActivity"
      class="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3
        rounded-sm border border-blue-100 bg-white p-4 shadow-lg dark:border-blue-500/30
        dark:bg-slate-900"
      role="status"
    >
      <BaseIcon :path="mdiBellRingOutline" size="20" class="mt-0.5 text-blue-500" />
      <p class="min-w-0 flex-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
        {{ latestActivity.message }}
      </p>
      <BaseButton
        color="whiteDark"
        :icon="mdiClose"
        :title="t('realtime.activity.toastDismiss')"
        :aria-label="t('realtime.activity.toastDismiss')"
        small
        @click="hideLiveActivityToast(latestActivity.id)"
      />
    </div>
  </Transition>
</template>

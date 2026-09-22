<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiBellRingOutline, mdiClose } from '@mdi/js'
import { hideLiveActivityToast, useLiveActivity } from '@/modules/realtime/services/liveActivityService'

const TOAST_VISIBLE_MS = 5000
const { latestActivity } = useLiveActivity()
const { t } = useI18n()
let dismissTimer: ReturnType<typeof setTimeout> | null = null

const clearDismissTimer = () => {
  if (dismissTimer !== null) clearTimeout(dismissTimer)
  dismissTimer = null
}

watch(latestActivity, (activity) => {
  clearDismissTimer()
  if (!activity) return

  dismissTimer = setTimeout(() => {
    hideLiveActivityToast(activity.id)
    dismissTimer = null
  }, TOAST_VISIBLE_MS)
}, { immediate: true })

onBeforeUnmount(clearDismissTimer)
</script>

<template>
  <Transition name="realtime-toast">
    <div v-if="latestActivity" class="operational-event-toast" role="status">
      <span class="operational-event-toast__icon"><v-icon :icon="mdiBellRingOutline" size="19" /></span>
      <p>{{ latestActivity.message }}</p>
      <button :aria-label="t('realtime.activity.toastDismiss')" type="button" @click="hideLiveActivityToast(latestActivity.id)"><v-icon :icon="mdiClose" size="17" /></button>
    </div>
  </Transition>
</template>

<style src="@/styles/components/realtime-activity.scss" lang="scss"></style>

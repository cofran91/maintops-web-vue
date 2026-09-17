<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mdiBellOutline, mdiCheckAll, mdiClose, mdiClipboardTextOutline, mdiFormatListBulleted } from '@mdi/js'
import { useLiveActivity } from '@/modules/realtime/services/liveActivityService'

const open = ref(false)
const route = useRoute()
const { activities, dismissLiveActivity, markAllLiveActivitiesAsRead, unreadCount } = useLiveActivity()

const countLabel = () => unreadCount.value > 99 ? '99+' : String(unreadCount.value)
const kindLabel = (kind: string) => kind === 'item' ? 'Actividad' : 'Orden'
const kindColor = (kind: string) => kind === 'item' ? '#d58930' : '#3158e7'

const relativeTime = (timestamp: number) => {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return 'Ahora mismo'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`

  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(timestamp)
}

watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <div class="realtime-activity-tray">
    <button
      class="notification-button"
      :aria-expanded="open"
      aria-controls="realtime-notifications-panel"
      aria-label="Notificaciones"
      type="button"
      @click="open = !open"
    >
      <v-icon :icon="mdiBellOutline" size="22" />
      <span v-if="unreadCount > 0" class="notification-count">{{ countLabel() }}</span>
      <i v-if="unreadCount > 0" />
    </button>

    <aside v-if="open" id="realtime-notifications-panel" class="realtime-notifications-panel" aria-label="Notificaciones">
      <header class="realtime-notifications-panel__header">
        <div><span class="realtime-notifications-panel__eyebrow">Actividad en vivo</span><h2>Notificaciones</h2><p>Eventos operativos almacenados hasta que los revises.</p></div>
        <div class="realtime-notifications-panel__actions">
          <button v-if="activities.length" aria-label="Marcar todas como leídas" title="Marcar todas como leídas" type="button" @click="markAllLiveActivitiesAsRead"><v-icon :icon="mdiCheckAll" size="17" /></button>
          <button aria-label="Cerrar notificaciones" title="Cerrar" type="button" @click="open = false"><v-icon :icon="mdiClose" size="18" /></button>
        </div>
      </header>

      <ul v-if="activities.length" class="realtime-notifications-list">
        <li v-for="activity in activities" :key="activity.id" class="realtime-notification-item">
          <span class="realtime-notification-item__icon" :style="{ color: kindColor(activity.kind), background: `${kindColor(activity.kind)}16` }"><v-icon :icon="activity.kind === 'item' ? mdiFormatListBulleted : mdiClipboardTextOutline" size="17" /></span>
          <div class="realtime-notification-item__body"><div><span :style="{ color: kindColor(activity.kind) }">{{ kindLabel(activity.kind) }}</span><time :datetime="new Date(activity.occurredAt).toISOString()">{{ relativeTime(activity.occurredAt) }}</time></div><p>{{ activity.message }}</p></div>
          <button aria-label="Descartar notificación" title="Descartar" type="button" @click="dismissLiveActivity(activity.id)"><v-icon :icon="mdiClose" size="16" /></button>
        </li>
      </ul>

      <div v-else class="realtime-notifications-empty"><span><v-icon :icon="mdiBellOutline" size="23" /></span><strong>No hay notificaciones pendientes</strong><p>Los cambios de órdenes y actividades aparecerán aquí.</p></div>
    </aside>
  </div>
</template>

<style src="@/styles/components/realtime-activity.scss" lang="scss"></style>

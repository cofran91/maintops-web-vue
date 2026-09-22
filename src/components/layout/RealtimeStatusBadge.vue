<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiWifi, mdiWifiOff } from '@mdi/js'
import { useRealtimeConnection } from '@/modules/realtime/services/realtimeClientService'

const realtime = useRealtimeConnection()
const { t } = useI18n()
const statusMeta = computed(() => ({
  disabled: { label: t('realtime.status.disabled'), short: t('realtime.status.shortDisabled'), color: 'grey', icon: mdiWifiOff },
  disconnected: { label: t('realtime.status.disconnected'), short: t('realtime.status.shortDisconnected'), color: 'grey', icon: mdiWifiOff },
  connecting: { label: t('realtime.status.connecting'), short: t('realtime.status.shortConnecting'), color: 'info', icon: mdiWifi },
  connected: { label: t('realtime.status.connected'), short: t('realtime.status.shortConnected'), color: 'success', icon: mdiWifi },
  error: { label: realtime.errorMessage || t('realtime.status.error'), short: t('realtime.status.shortError'), color: 'error', icon: mdiWifiOff },
}[realtime.status]))
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <span v-bind="props" class="realtime-status-badge" :aria-label="statusMeta.label">
        <v-icon :color="statusMeta.color" :icon="statusMeta.icon" size="16" />
        <span>{{ statusMeta.short }}</span>
      </span>
    </template>
    <span>{{ statusMeta.label }}</span>
  </v-tooltip>
</template>

<style scoped lang="scss">
.realtime-status-badge {
  align-items: center;
  color: #74829a;
  display: inline-flex;
  font-size: .7rem;
  font-weight: 700;
  gap: 5px;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .realtime-status-badge span { display: none; }
}
</style>

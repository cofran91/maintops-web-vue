<script setup lang="ts">
import { computed } from 'vue'
import { mdiWifi, mdiWifiOff } from '@mdi/js'
import { useRealtimeConnection } from '@/modules/realtime/services/realtimeClientService'

const realtime = useRealtimeConnection()
const statusMeta = computed(() => ({
  disabled: { label: 'Tiempo real desactivado', short: 'Desactivado', color: 'grey', icon: mdiWifiOff },
  disconnected: { label: 'Sin conexión en tiempo real', short: 'Desconectado', color: 'grey', icon: mdiWifiOff },
  connecting: { label: 'Conectando al servicio en tiempo real', short: 'Conectando', color: 'info', icon: mdiWifi },
  connected: { label: 'Conectado al servicio en tiempo real', short: 'En línea', color: 'success', icon: mdiWifi },
  error: { label: realtime.errorMessage || 'Error en la conexión en tiempo real', short: 'Con error', color: 'error', icon: mdiWifiOff },
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

<script setup lang="ts">
import { computed } from 'vue'
import { isUserPresent } from '@/modules/realtime/services/realtimePresenceService'

const props = defineProps<{ userId?: string | number | null }>()
const online = computed(() => isUserPresent(props.userId))
</script>

<template>
  <span :class="['realtime-presence-dot', { 'realtime-presence-dot--online': online }]" :title="online ? 'En línea' : 'Sin conexión'" :aria-label="online ? 'En línea' : 'Sin conexión'" />
</template>

<style scoped lang="scss">
.realtime-presence-dot {
  background: #a8b3c2;
  border: 2px solid #fff;
  border-radius: 50%;
  bottom: -1px;
  height: 11px;
  position: absolute;
  right: -1px;
  width: 11px;
}

.realtime-presence-dot--online {
  background: #22ae7c;
  box-shadow: 0 0 0 3px rgba(34, 174, 124, .12);
}
</style>

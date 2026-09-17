import { onBeforeUnmount, onMounted } from 'vue'
import {
  subscribeToOperationalEvents,
} from '@/modules/realtime/services/operationalEventsService'
import type { OperationalEvent } from '@/types/realtime'

export const useOperationalEventListener = (listener: (event: OperationalEvent) => void) => {
  let unsubscribe: (() => boolean) | null = null

  onMounted(() => {
    unsubscribe = subscribeToOperationalEvents(listener)
  })

  onBeforeUnmount(() => {
    unsubscribe?.()
    unsubscribe = null
  })
}

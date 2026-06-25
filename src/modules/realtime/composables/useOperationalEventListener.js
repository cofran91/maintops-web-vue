import { onBeforeUnmount, onMounted } from 'vue'
import { subscribeToOperationalEvents } from '@/modules/realtime/services/operationalEventsService.js'

export const useOperationalEventListener = (listener) => {
  let unsubscribe = null

  onMounted(() => {
    unsubscribe = subscribeToOperationalEvents(listener)
  })

  onBeforeUnmount(() => {
    unsubscribe?.()
    unsubscribe = null
  })
}

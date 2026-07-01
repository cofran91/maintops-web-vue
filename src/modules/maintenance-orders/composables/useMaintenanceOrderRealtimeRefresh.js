import { onBeforeUnmount } from 'vue'
import { useOperationalEventListener } from '@/modules/realtime/composables/useOperationalEventListener.js'

export function useMaintenanceOrderRealtimeRefresh(refresh) {
  let realtimeRefreshTimer = null

  const scheduleRealtimeRefresh = () => {
    if (realtimeRefreshTimer !== null) {
      clearTimeout(realtimeRefreshTimer)
    }

    realtimeRefreshTimer = setTimeout(() => {
      realtimeRefreshTimer = null
      void refresh()
    }, 200)
  }

  useOperationalEventListener(() => {
    scheduleRealtimeRefresh()
  })

  onBeforeUnmount(() => {
    if (realtimeRefreshTimer !== null) {
      clearTimeout(realtimeRefreshTimer)
      realtimeRefreshTimer = null
    }
  })

  return {
    scheduleRealtimeRefresh,
  }
}

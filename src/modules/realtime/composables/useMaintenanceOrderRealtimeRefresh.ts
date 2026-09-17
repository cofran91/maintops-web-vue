import { onBeforeUnmount } from 'vue'
import { useOperationalEventListener } from '@/modules/realtime/composables/useOperationalEventListener'
import type { OperationalEvent } from '@/types/realtime'

export const useMaintenanceOrderRealtimeRefresh = (
  refresh: () => void | Promise<void>,
  shouldRefresh: (event: OperationalEvent) => boolean = () => true,
) => {
  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  const scheduleRefresh = () => {
    if (refreshTimer !== null) {
      clearTimeout(refreshTimer)
    }

    refreshTimer = setTimeout(() => {
      refreshTimer = null
      void refresh()
    }, 250)
  }

  useOperationalEventListener((event) => {
    if (shouldRefresh(event)) {
      scheduleRefresh()
    }
  })

  onBeforeUnmount(() => {
    if (refreshTimer !== null) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  })
}

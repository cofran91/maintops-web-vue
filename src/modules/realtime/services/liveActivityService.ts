import { computed, readonly, ref } from 'vue'
import { maintenanceOrderIdForEvent, subscribeToOperationalEvents } from '@/modules/realtime/services/operationalEventsService'
import type { LiveActivity, OperationalEvent } from '@/types/realtime'

const MAX_ACTIVITY_ITEMS = 50
const STORAGE_KEY_PREFIX = 'maintops.live-activity'

const ORDER_ACTIONS: Record<string, string> = {
  created: 'fue creada',
  updated: 'fue actualizada',
  pending_owner_approval: 'quedó pendiente de aprobación',
  approved: 'fue aprobada',
  partially_approved: 'fue aprobada parcialmente',
  rejected: 'fue rechazada',
  scheduled: 'fue programada',
  in_progress: 'entró en proceso',
  completed: 'fue finalizada',
  delivered: 'fue entregada',
  cancelled: 'fue cancelada',
}

const ITEM_ACTIONS: Record<string, string> = {
  created: 'fue agregada',
  updated: 'fue actualizada',
  pending_owner_approval: 'quedó pendiente de aprobación',
  scheduled: 'fue programada',
  in_progress: 'entró en proceso',
  completed: 'fue finalizada',
  rejected: 'fue rechazada',
  cancelled: 'fue cancelada',
}

const activities = ref<LiveActivity[]>([])
const latestActivityId = ref<string | null>(null)
let storageKey: string | null = null
let unsubscribe: (() => boolean) | null = null

const isLiveActivity = (value: unknown): value is LiveActivity => {
  if (typeof value !== 'object' || value === null) return false

  const activity = value as Partial<LiveActivity>
  return (
    typeof activity.id === 'string' &&
    typeof activity.message === 'string' &&
    typeof activity.occurredAt === 'number' &&
    (activity.kind === 'order' || activity.kind === 'item')
  )
}

const readStoredActivities = () => {
  if (typeof window === 'undefined' || storageKey === null) return []

  try {
    const stored = window.localStorage.getItem(storageKey)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed.filter(isLiveActivity) : []
  } catch {
    return []
  }
}

const persistActivities = () => {
  if (typeof window === 'undefined' || storageKey === null) return

  if (activities.value.length === 0) {
    window.localStorage.removeItem(storageKey)
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(activities.value))
}

const actionFromEvent = (event: OperationalEvent) => event.event_type.split('.')[1] || 'updated'

export const operationalEventMessage = (event: OperationalEvent) => {
  const orderId = String(maintenanceOrderIdForEvent(event))
  const action = actionFromEvent(event)

  if (event.aggregate.type === 'maintenance_order') {
    const actionLabel = ORDER_ACTIONS[action]
    return actionLabel ? `La orden OT-${orderId.padStart(5, '0')} ${actionLabel}.` : null
  }

  const actionLabel = ITEM_ACTIONS[action]
  if (!actionLabel) return null

  const taskName = typeof event.data.maintenance_task_name === 'string'
    ? event.data.maintenance_task_name.trim()
    : ''
  const taskId = event.data.maintenance_task_id
  const itemLabel = taskName || (typeof taskId === 'number' ? `actividad #${taskId}` : 'una actividad')

  return `La actividad ${itemLabel} de OT-${orderId.padStart(5, '0')} ${actionLabel}.`
}

const recordOperationalActivity = (event: OperationalEvent) => {
  if (activities.value.some((activity) => activity.id === event.event_id)) return

  const message = operationalEventMessage(event)
  if (!message) return

  const parsedTimestamp = Date.parse(event.occurred_at)
  const occurredAt = Number.isNaN(parsedTimestamp) ? Date.now() : parsedTimestamp

  activities.value = [
    {
      id: event.event_id,
      kind: event.aggregate.type === 'maintenance_order' ? ('order' as const) : ('item' as const),
      message,
      occurredAt,
    },
    ...activities.value,
  ].slice(0, MAX_ACTIVITY_ITEMS)
  latestActivityId.value = event.event_id
  persistActivities()
}

export const setLiveActivityScope = (scopeId: number | string | null | undefined) => {
  persistActivities()
  storageKey = scopeId === null || scopeId === undefined ? null : `${STORAGE_KEY_PREFIX}:${scopeId}`
  activities.value = readStoredActivities()
  latestActivityId.value = null
}

export const startLiveActivity = () => {
  if (unsubscribe === null) {
    unsubscribe = subscribeToOperationalEvents(recordOperationalActivity)
  }
}

export const stopLiveActivity = () => {
  unsubscribe?.()
  unsubscribe = null
  latestActivityId.value = null
}

export const dismissLiveActivity = (activityId: string) => {
  activities.value = activities.value.filter((activity) => activity.id !== activityId)
  if (latestActivityId.value === activityId) latestActivityId.value = null
  persistActivities()
}

export const hideLiveActivityToast = (activityId: string) => {
  if (latestActivityId.value === activityId) latestActivityId.value = null
}

export const markAllLiveActivitiesAsRead = () => {
  activities.value = []
  latestActivityId.value = null
  persistActivities()
}

export const useLiveActivity = () => ({
  activities: readonly(computed(() => activities.value)),
  latestActivity: readonly(computed(() => activities.value.find((activity) => activity.id === latestActivityId.value) ?? null)),
  unreadCount: readonly(computed(() => activities.value.length)),
  dismissLiveActivity,
  hideLiveActivityToast,
  markAllLiveActivitiesAsRead,
})

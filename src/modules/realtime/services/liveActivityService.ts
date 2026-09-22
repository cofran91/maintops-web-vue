import { computed, readonly, ref } from 'vue'
import { maintenanceOrderIdForEvent, subscribeToOperationalEvents } from '@/modules/realtime/services/operationalEventsService'
import { t } from '@/i18n'
import type { LiveActivity, OperationalEvent } from '@/types/realtime'

const MAX_ACTIVITY_ITEMS = 50
const STORAGE_KEY_PREFIX = 'maintops.live-activity'

const ORDER_ACTIONS = [
  'created', 'updated', 'pending_owner_approval', 'approved', 'partially_approved',
  'rejected', 'scheduled', 'in_progress', 'completed', 'delivered', 'cancelled',
] as const

const ITEM_ACTIONS = [
  'created', 'updated', 'pending_owner_approval', 'scheduled', 'in_progress',
  'completed', 'rejected', 'cancelled',
] as const

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
    if (!ORDER_ACTIONS.includes(action as (typeof ORDER_ACTIONS)[number])) return null
    return t('realtime.liveActivity.orderMessage', {
      action: t(`realtime.liveActivityActions.${action}`),
      orderId,
    })
  }

  if (!ITEM_ACTIONS.includes(action as (typeof ITEM_ACTIONS)[number])) return null

  const taskName = typeof event.data.maintenance_task_name === 'string'
    ? event.data.maintenance_task_name.trim()
    : ''
  const taskId = event.data.maintenance_task_id
  const itemLabel = taskName || (typeof taskId === 'number'
    ? t('realtime.liveActivity.task', { id: taskId })
    : t('realtime.liveActivity.orderItem'))

  return t('realtime.liveActivity.itemMessage', {
    action: t(`realtime.liveActivityActions.${action}`),
    name: itemLabel,
    orderId,
  })
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

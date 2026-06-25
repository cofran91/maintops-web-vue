import { computed, readonly, ref } from 'vue'
import { maintenanceOrderIdForEvent } from '@/modules/realtime/services/operationalEventsService.js'

const MAX_ACTIVITY_ITEMS = 50
const STORAGE_KEY_PREFIX = 'maintops.live-activity'
const ORDER_ACTION_LABELS = Object.freeze({
  created: 'created',
  updated: 'updated',
  pending_owner_approval: 'sent for owner approval',
  approved: 'approved',
  partially_approved: 'partially approved',
  rejected: 'rejected',
  scheduled: 'scheduled',
  in_progress: 'started',
  completed: 'completed',
  delivered: 'delivered',
  cancelled: 'cancelled',
})
const ITEM_ACTION_LABELS = Object.freeze({
  created: 'created',
  updated: 'updated',
  pending_owner_approval: 'sent for owner approval',
  scheduled: 'scheduled',
  in_progress: 'started',
  completed: 'completed',
  rejected: 'rejected',
  cancelled: 'cancelled',
})

const activities = ref([])
const latestActivityId = ref(null)
let storageKey = null

const actionFromEvent = (event) => event.event_type.split('.')[1]
const activityKind = (event) =>
  event.aggregate.type === 'maintenance_order' ? 'order' : 'item'

const isLiveActivityItem = (value) =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.id === 'string' &&
  typeof value.message === 'string' &&
  typeof value.occurredAt === 'number' &&
  (value.kind === 'order' || value.kind === 'item')

const readStoredActivities = () => {
  if (typeof window === 'undefined' || storageKey === null) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    const parsed = stored === null ? [] : JSON.parse(stored)

    return Array.isArray(parsed) ? parsed.filter(isLiveActivityItem) : []
  } catch {
    return []
  }
}

const persistActivities = () => {
  if (typeof window === 'undefined' || storageKey === null) {
    return
  }

  if (activities.value.length === 0) {
    window.localStorage.removeItem(storageKey)
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(activities.value))
}

export const operationalEventMessage = (event) => {
  const orderId = maintenanceOrderIdForEvent(event)
  const action = actionFromEvent(event)

  if (event.aggregate.type === 'maintenance_order') {
    const label = ORDER_ACTION_LABELS[action]

    return label === undefined ? null : `Order #${orderId} was ${label}.`
  }

  const label = ITEM_ACTION_LABELS[action]

  if (label === undefined) {
    return null
  }

  const activityName =
    event.data.maintenance_task_name?.trim() ||
    (event.data.maintenance_task_id === null
      ? 'An order item'
      : `Task #${event.data.maintenance_task_id}`)

  return `${activityName} on order #${orderId} was ${label}.`
}

export const recordOperationalActivity = (event) => {
  if (activities.value.some((activity) => activity.id === event.event_id)) {
    return
  }

  const message = operationalEventMessage(event)

  if (message === null) {
    return
  }

  const parsedOccurredAt = Date.parse(event.occurred_at)
  const occurredAt = Number.isNaN(parsedOccurredAt) ? Date.now() : parsedOccurredAt

  activities.value = [
    {
      id: event.event_id,
      kind: activityKind(event),
      message,
      occurredAt,
    },
    ...activities.value,
  ].slice(0, MAX_ACTIVITY_ITEMS)
  latestActivityId.value = event.event_id
  persistActivities()
}

export const dismissLiveActivity = (activityId) => {
  activities.value = activities.value.filter((activity) => activity.id !== activityId)

  if (latestActivityId.value === activityId) {
    latestActivityId.value = null
  }

  persistActivities()
}

export const hideLiveActivityToast = (activityId) => {
  if (latestActivityId.value === activityId) {
    latestActivityId.value = null
  }
}

export const markAllLiveActivitiesAsRead = () => {
  activities.value = []
  latestActivityId.value = null
  persistActivities()
}

export const setLiveActivityScope = (scopeId) => {
  persistActivities()
  storageKey =
    scopeId === null || scopeId === undefined ? null : `${STORAGE_KEY_PREFIX}:${scopeId}`
  activities.value = readStoredActivities()
  latestActivityId.value = null
}

export const useLiveActivity = () => ({
  activities: readonly(computed(() => activities.value)),
  latestActivity: readonly(computed(() =>
    activities.value.find((activity) => activity.id === latestActivityId.value) ?? null,
  )),
  unreadCount: readonly(computed(() => activities.value.length)),
  dismissLiveActivity,
  hideLiveActivityToast,
  markAllLiveActivitiesAsRead,
})

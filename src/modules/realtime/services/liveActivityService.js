import { computed, readonly, ref } from 'vue'
import { maintenanceOrderIdForEvent } from '@/modules/realtime/services/operationalEventsService.js'

const MAX_ACTIVITY_ITEMS = 20
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

const actionFromEvent = (event) => event.event_type.split('.')[1]

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
      message,
      occurredAt,
    },
    ...activities.value,
  ].slice(0, MAX_ACTIVITY_ITEMS)
}

export const dismissLiveActivity = (activityId) => {
  activities.value = activities.value.filter((activity) => activity.id !== activityId)
}

export const clearLiveActivity = () => {
  activities.value = []
}

export const useLiveActivity = () => ({
  activities: readonly(computed(() => activities.value)),
  latestActivity: readonly(computed(() => activities.value[0] ?? null)),
  dismissLiveActivity,
})

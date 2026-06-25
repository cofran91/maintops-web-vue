const MAX_RECENT_EVENT_IDS = 300

const listeners = new Set()
const recentEventIds = new Set()
const recentEventIdQueue = []

const isRecord = (value) => typeof value === 'object' && value !== null
const isEntityId = (value) => typeof value === 'string' || typeof value === 'number'
const isNullableNumber = (value) => value === null || typeof value === 'number'
const isNullableString = (value) => value === null || typeof value === 'string'
const isOperationalEventType = (value) =>
  typeof value === 'string' &&
  /^(maintenance_order|maintenance_order_item)\.[a-z0-9_]+\.v\d+$/.test(value)

const isMaintenanceOrderEventType = (value) => value.startsWith('maintenance_order.')
const isMaintenanceOrderItemEventType = (value) => value.startsWith('maintenance_order_item.')

const eventEnvelope = (payload) => {
  if (!isRecord(payload)) {
    return null
  }

  if (!isRecord(payload.payload)) {
    return payload
  }

  return {
    ...payload.payload,
    event_id: payload.payload.event_id ?? payload.event_id,
    event_type: payload.payload.event_type ?? payload.event_type,
  }
}

const isMaintenanceOrderData = (value) =>
  isRecord(value) &&
  typeof value.maintenance_order_id === 'number' &&
  isNullableNumber(value.vehicle_id) &&
  isNullableNumber(value.advisor_id) &&
  isNullableNumber(value.workshop_id) &&
  isNullableNumber(value.technician_id) &&
  typeof value.status === 'string' &&
  isNullableString(value.previous_status) &&
  isNullableString(value.scheduled_at) &&
  isNullableString(value.started_at) &&
  isNullableString(value.finished_at) &&
  isNullableString(value.delivered_at) &&
  isNullableString(value.cancelled_at)

const isMaintenanceOrderItemData = (value) =>
  isRecord(value) &&
  typeof value.maintenance_order_item_id === 'number' &&
  typeof value.maintenance_order_id === 'number' &&
  isNullableNumber(value.maintenance_task_id) &&
  isNullableNumber(value.maintenance_plan_id) &&
  typeof value.status === 'string' &&
  isNullableString(value.previous_status) &&
  isNullableString(value.scheduled_at) &&
  isNullableNumber(value.planned_duration_minutes) &&
  isNullableString(value.scheduled_ends_at) &&
  isNullableString(value.started_at) &&
  isNullableString(value.finished_at) &&
  isNullableString(value.rejected_at) &&
  isNullableString(value.cancelled_at)

const rememberEventId = (eventId) => {
  if (recentEventIds.has(eventId)) {
    return false
  }

  recentEventIds.add(eventId)
  recentEventIdQueue.push(eventId)

  while (recentEventIdQueue.length > MAX_RECENT_EVENT_IDS) {
    recentEventIds.delete(recentEventIdQueue.shift())
  }

  return true
}

export const parseOperationalEvent = (eventName, payload) => {
  const envelope = eventEnvelope(payload)

  if (!isOperationalEventType(eventName) || !isRecord(envelope)) {
    return null
  }

  const {
    actor,
    aggregate,
    data,
    event_id: eventId,
    event_type: eventType,
    occurred_at: occurredAt,
    targets,
    version,
  } = envelope

  if (
    typeof eventId !== 'string' ||
    eventType !== eventName ||
    !isOperationalEventType(eventType) ||
    typeof version !== 'number' ||
    typeof occurredAt !== 'string' ||
    !isRecord(actor) ||
    !isNullableNumber(actor.user_id) ||
    !isRecord(aggregate) ||
    !isRecord(targets) ||
    !isRecord(data) ||
    !isNullableNumber(targets.workshop_id) ||
    (
      targets.workshop_manager_id !== undefined &&
      !isNullableNumber(targets.workshop_manager_id)
    ) ||
    !isNullableNumber(targets.technician_id) ||
    !isNullableNumber(targets.advisor_id) ||
    !isEntityId(aggregate.id)
  ) {
    return null
  }

  const baseEvent = {
    event_id: eventId,
    event_type: eventType,
    version,
    occurred_at: occurredAt,
    actor: { user_id: actor.user_id },
    targets: {
      workshop_id: targets.workshop_id,
      workshop_manager_id: targets.workshop_manager_id ?? null,
      technician_id: targets.technician_id,
      advisor_id: targets.advisor_id,
    },
  }

  if (
    aggregate.type === 'maintenance_order' &&
    isMaintenanceOrderEventType(eventType) &&
    isMaintenanceOrderData(data)
  ) {
    return {
      ...baseEvent,
      aggregate: {
        type: 'maintenance_order',
        id: aggregate.id,
      },
      data,
    }
  }

  if (
    aggregate.type === 'maintenance_order_item' &&
    isMaintenanceOrderItemEventType(eventType) &&
    isMaintenanceOrderItemData(data)
  ) {
    return {
      ...baseEvent,
      aggregate: {
        type: 'maintenance_order_item',
        id: aggregate.id,
      },
      data,
    }
  }

  return null
}

export const subscribeToOperationalEvents = (listener) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const publishOperationalEvent = (event) => {
  if (!rememberEventId(event.event_id)) {
    return false
  }

  listeners.forEach((listener) => {
    try {
      listener(event)
    } catch (error) {
      console.error('Operational event listener failed.', error)
    }
  })

  return true
}

export const maintenanceOrderIdForEvent = (event) =>
  event.aggregate.type === 'maintenance_order'
    ? event.aggregate.id
    : event.data.maintenance_order_id

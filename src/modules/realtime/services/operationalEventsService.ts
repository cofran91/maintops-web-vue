import type { OperationalEvent } from '@/types/realtime'

const listeners = new Set<(event: OperationalEvent) => void>()
const recentEventIds = new Set<string>()
const recentEventQueue: string[] = []
const MAX_RECENT_EVENT_IDS = 300

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const unwrapPayload = (payload: unknown) => {
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

const isOperationalEventType = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^(maintenance_order|maintenance_order_item)\.[a-z0-9_]+\.v\d+$/.test(value)

export const parseOperationalEvent = (
  eventName: string,
  payload: unknown,
): OperationalEvent | null => {
  const envelope = unwrapPayload(payload)

  if (!envelope || !isOperationalEventType(eventName)) {
    return null
  }

  const eventType = envelope.event_type ?? eventName
  const aggregate = envelope.aggregate
  const data = envelope.data

  if (
    eventType !== eventName ||
    !isOperationalEventType(eventType) ||
    typeof envelope.event_id !== 'string' ||
    typeof envelope.version !== 'number' ||
    typeof envelope.occurred_at !== 'string' ||
    !isRecord(aggregate) ||
    (aggregate.type !== 'maintenance_order' && aggregate.type !== 'maintenance_order_item') ||
    (typeof aggregate.id !== 'string' && typeof aggregate.id !== 'number') ||
    !isRecord(data)
  ) {
    return null
  }

  return {
    event_id: envelope.event_id,
    event_type: eventType,
    version: envelope.version,
    occurred_at: envelope.occurred_at,
    aggregate: {
      type: aggregate.type,
      id: aggregate.id,
    },
    actor: isRecord(envelope.actor) ? { user_id: typeof envelope.actor.user_id === 'number' ? envelope.actor.user_id : null } : undefined,
    data,
  }
}

const rememberEvent = (eventId: string) => {
  if (recentEventIds.has(eventId)) {
    return false
  }

  recentEventIds.add(eventId)
  recentEventQueue.push(eventId)

  while (recentEventQueue.length > MAX_RECENT_EVENT_IDS) {
    const oldestEventId = recentEventQueue.shift()

    if (oldestEventId) {
      recentEventIds.delete(oldestEventId)
    }
  }

  return true
}

export const subscribeToOperationalEvents = (listener: (event: OperationalEvent) => void) => {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export const publishOperationalEvent = (event: OperationalEvent) => {
  if (!rememberEvent(event.event_id)) {
    return false
  }

  listeners.forEach((listener) => listener(event))

  return true
}

export const maintenanceOrderIdForEvent = (event: OperationalEvent) =>
  event.aggregate.type === 'maintenance_order'
    ? event.aggregate.id
    : event.data.maintenance_order_id

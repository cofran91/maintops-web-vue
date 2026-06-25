/**
 * @typedef {'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error'} RealtimeConnectionStatus
 */

/**
 * @typedef {Object} RealtimeToken
 * @property {'realtime'} audience
 * @property {string} token
 * @property {string} token_type
 * @property {number} expires_in
 * @property {string} expires_at
 */

/**
 * @typedef {Object} RealtimePresenceUpdate
 * @property {string} user_id
 * @property {string} [workshop_id]
 * @property {'online' | 'offline'} status
 */

/**
 * @typedef {'maintenance_order' | 'maintenance_order_item'} OperationalEventAggregateType
 */

/**
 * Event names follow maintenance_order.<action>.v<number> or
 * maintenance_order_item.<action>.v<number>.
 *
 * @typedef {string} OperationalEventType
 */

/**
 * @typedef {Object} OperationalEventTargets
 * @property {number | null} workshop_id
 * @property {number | null} workshop_manager_id
 * @property {number | null} technician_id
 * @property {number | null} advisor_id
 */

/**
 * @typedef {Object} MaintenanceOrderEventData
 * @property {number} maintenance_order_id
 * @property {number | null} vehicle_id
 * @property {number | null} advisor_id
 * @property {number | null} workshop_id
 * @property {number | null} technician_id
 * @property {string} status
 * @property {string | null} previous_status
 * @property {string | null} scheduled_at
 * @property {string | null} started_at
 * @property {string | null} finished_at
 * @property {string | null} delivered_at
 * @property {string | null} cancelled_at
 */

/**
 * @typedef {Object} MaintenanceOrderItemEventData
 * @property {number} maintenance_order_item_id
 * @property {number} maintenance_order_id
 * @property {number | null} maintenance_task_id
 * @property {string | null} [maintenance_task_name]
 * @property {number | null} maintenance_plan_id
 * @property {string} status
 * @property {string | null} previous_status
 * @property {string | null} scheduled_at
 * @property {number | null} planned_duration_minutes
 * @property {string | null} scheduled_ends_at
 * @property {string | null} started_at
 * @property {string | null} finished_at
 * @property {string | null} rejected_at
 * @property {string | null} cancelled_at
 */

/**
 * @typedef {Object} OperationalEvent
 * @property {string} event_id
 * @property {OperationalEventType} event_type
 * @property {number} version
 * @property {string} occurred_at
 * @property {{ type: OperationalEventAggregateType, id: string | number }} aggregate
 * @property {{ user_id: number | null }} actor
 * @property {OperationalEventTargets} targets
 * @property {MaintenanceOrderEventData | MaintenanceOrderItemEventData} data
 */

export const REALTIME_CONNECTION_STATUSES = Object.freeze({
  DISABLED: 'disabled',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
})

export const MAINTENANCE_ORDER_ITEM_STATUSES = Object.freeze([
  'pending_owner_approval',
  'scheduled',
  'in_progress',
  'completed',
  'rejected',
  'cancelled',
])

export const MAINTENANCE_ORDER_ITEM_ACTIONS = Object.freeze([
  'in_progress',
  'completed',
  'rejected',
  'cancelled',
])

/**
 * @typedef {
 *   'pending_owner_approval' |
 *   'scheduled' |
 *   'in_progress' |
 *   'completed' |
 *   'rejected' |
 *   'cancelled'
 * } MaintenanceOrderItemStatus
 */

/**
 * @typedef {'in_progress' | 'completed' | 'rejected' | 'cancelled'} MaintenanceOrderItemAction
 */

/**
 * @typedef {Object} MaintenanceOrderItemOrderSummary
 * @property {number} id
 * @property {number} vehicle_id
 * @property {number | null} owner_id
 * @property {number} advisor_id
 * @property {number | null} workshop_id
 * @property {number | null} technician_id
 * @property {import('@/types/maintenanceOrder.js').MaintenanceOrderStatus} status
 */

/**
 * @typedef {Object} MaintenanceOrderItemTaskSummary
 * @property {number} id
 * @property {number | null} vehicle_id
 * @property {number} vehicle_system_id
 * @property {import('@/types/vehicleSystem.js').VehicleSystem | null} vehicle_system
 * @property {string} name
 * @property {string} code
 * @property {string | null} description
 * @property {number | null} estimated_duration_minutes
 * @property {import('@/types/maintenanceTask.js').MaintenanceTaskStatus} status
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} MaintenanceOrderItem
 * @property {number} id
 * @property {number} maintenance_order_id
 * @property {MaintenanceOrderItemOrderSummary} [maintenance_order]
 * @property {number} maintenance_task_id
 * @property {MaintenanceOrderItemTaskSummary} [maintenance_task]
 * @property {number | null} maintenance_plan_id
 * @property {import('@/types/maintenancePlan.js').MaintenancePlan | null} [maintenance_plan]
 * @property {MaintenanceOrderItemStatus} status
 * @property {number | null} odometer_km
 * @property {number | null} planned_duration_minutes
 * @property {string | null} pending_owner_approval_at
 * @property {string | null} scheduled_at
 * @property {string | null} scheduled_ends_at
 * @property {string | null} started_at
 * @property {string | null} finished_at
 * @property {string | null} rejected_at
 * @property {string | null} cancelled_at
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_MAINTENANCE_ORDER_ITEM = Object.freeze({
  id: null,
  maintenance_order_id: null,
  maintenance_order: null,
  maintenance_task_id: null,
  maintenance_task: null,
  maintenance_plan_id: null,
  maintenance_plan: null,
  status: 'pending_owner_approval',
  odometer_km: null,
  planned_duration_minutes: null,
  pending_owner_approval_at: null,
  scheduled_at: null,
  scheduled_ends_at: null,
  started_at: null,
  finished_at: null,
  rejected_at: null,
  cancelled_at: null,
  created_at: null,
  updated_at: null,
})

export const MAINTENANCE_ORDER_STATUSES = Object.freeze([
  'created',
  'pending_owner_approval',
  'approved',
  'partially_approved',
  'rejected',
  'scheduled',
  'in_progress',
  'completed',
  'delivered',
  'cancelled',
])

export const MAINTENANCE_ORDER_ACTIONS = Object.freeze([
  'approved',
  'rejected',
  'cancelled',
  'delivered',
])

/**
 * @typedef {
 *   'created' |
 *   'pending_owner_approval' |
 *   'approved' |
 *   'partially_approved' |
 *   'rejected' |
 *   'scheduled' |
 *   'in_progress' |
 *   'completed' |
 *   'delivered' |
 *   'cancelled'
 * } MaintenanceOrderStatus
 */

/**
 * @typedef {'approved' | 'rejected' | 'cancelled' | 'delivered'} MaintenanceOrderAction
 */

/**
 * @typedef {Object} MaintenanceOrderUserSummary
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {import('@/types/auth.js').Role[]} roles
 * @property {string | null} phone
 * @property {string | null} document_number
 */

/**
 * @typedef {Object} MaintenanceOrderOwnerSummary
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {boolean} is_active
 * @property {string | null} phone
 * @property {string | null} document_number
 */

/**
 * @typedef {Object} MaintenanceOrderWorkshopSummary
 * @property {number} id
 * @property {string} name
 * @property {string} code
 * @property {string | null} city
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} MaintenanceOrder
 * @property {number} id
 * @property {number} vehicle_id
 * @property {import('@/types/vehicle.js').Vehicle} [vehicle]
 * @property {number | null} owner_id
 * @property {MaintenanceOrderOwnerSummary | null} [owner]
 * @property {number} advisor_id
 * @property {MaintenanceOrderUserSummary} [advisor]
 * @property {number | null} workshop_id
 * @property {MaintenanceOrderWorkshopSummary | null} [workshop]
 * @property {number | null} technician_id
 * @property {MaintenanceOrderUserSummary | null} [technician]
 * @property {MaintenanceOrderStatus} status
 * @property {string | null} scheduled_at
 * @property {string | null} started_at
 * @property {string | null} finished_at
 * @property {string | null} delivered_at
 * @property {string | null} cancelled_at
 * @property {number[]} [item_ids]
 * @property {import('@/types/maintenanceOrderItem.js').MaintenanceOrderItem[]} [items]
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_MAINTENANCE_ORDER = Object.freeze({
  id: null,
  vehicle_id: null,
  vehicle: null,
  owner_id: null,
  owner: null,
  advisor_id: null,
  advisor: null,
  workshop_id: null,
  workshop: null,
  technician_id: null,
  technician: null,
  status: 'created',
  scheduled_at: null,
  started_at: null,
  finished_at: null,
  delivered_at: null,
  cancelled_at: null,
  item_ids: [],
  items: [],
  created_at: null,
  updated_at: null,
})

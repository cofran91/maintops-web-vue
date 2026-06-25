/**
 * @typedef {Object} DashboardVehicle
 * @property {number} id
 * @property {string} license_plate
 * @property {string | null} brand
 * @property {string | null} model
 * @property {{ id: number, name: string, email: string } | null} [owner]
 */

/**
 * @typedef {Object} DashboardWorkshop
 * @property {number} id
 * @property {string} name
 * @property {string} code
 * @property {string | null} [city]
 */

/**
 * @typedef {Object} DashboardUser
 * @property {number} id
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} DashboardOrderCard
 * @property {number} maintenance_order_id
 * @property {import('@/types/maintenanceOrder.js').MaintenanceOrderStatus} status
 * @property {string | null} scheduled_at
 * @property {string | null} [finished_at]
 * @property {DashboardVehicle | null} vehicle
 * @property {DashboardUser | null} [advisor]
 * @property {DashboardWorkshop | null} workshop
 * @property {DashboardUser | null} technician
 */

/**
 * @typedef {Object} DashboardItemCard
 * @property {number} maintenance_order_item_id
 * @property {number} maintenance_order_id
 * @property {import('@/types/maintenanceOrderItem.js').MaintenanceOrderItemStatus} status
 * @property {string | null} scheduled_at
 * @property {string | null} scheduled_ends_at
 * @property {number | null} planned_duration_minutes
 * @property {{ id: number, name: string, code: string, vehicle_system: Object | null } | null} task
 * @property {DashboardVehicle | null} vehicle
 * @property {DashboardWorkshop | null} workshop
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {Record<string, number>} orders_by_status
 * @property {Record<string, number>} metrics
 * @property {{ pending: number, active: number }} activities
 * @property {DashboardOrderCard[]} today_schedules
 * @property {DashboardOrderCard[]} upcoming_schedules
 * @property {Record<string, unknown>} role_context
 */

export const EMPTY_DASHBOARD_SUMMARY = Object.freeze({
  orders_by_status: {},
  metrics: {},
  activities: {
    pending: 0,
    active: 0,
  },
  today_schedules: [],
  upcoming_schedules: [],
  role_context: {
    role: null,
    type: 'none',
  },
})

export const MAINTENANCE_TASK_STATUS = Object.freeze({
  CREATED: 'created',
  SCHEDULED: 'scheduled',
  STARTED: 'started',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
})

export const MAINTENANCE_TASK_STATUS_LABELS = Object.freeze({
  [MAINTENANCE_TASK_STATUS.CREATED]: 'Created',
  [MAINTENANCE_TASK_STATUS.SCHEDULED]: 'Scheduled',
  [MAINTENANCE_TASK_STATUS.STARTED]: 'Started',
  [MAINTENANCE_TASK_STATUS.CANCELLED]: 'Cancelled',
  [MAINTENANCE_TASK_STATUS.COMPLETED]: 'Completed',
  [MAINTENANCE_TASK_STATUS.REJECTED]: 'Rejected',
})

/**
 * @typedef {
 *   'created' |
 *   'scheduled' |
 *   'started' |
 *   'cancelled' |
 *   'completed' |
 *   'rejected'
 * } MaintenanceTaskStatus
 */

/**
 * @typedef {Object} MaintenanceTaskVehicleSummary
 * @property {number} id
 * @property {number} owner_id
 * @property {string} license_plate
 * @property {string | null} brand
 * @property {string | null} model
 * @property {number | null} year
 * @property {string | null} color
 * @property {number} odometer_km
 */

/**
 * @typedef {Object} MaintenanceTask
 * @property {number} id
 * @property {number | null} vehicle_id
 * @property {MaintenanceTaskVehicleSummary | null} [vehicle]
 * @property {number} vehicle_system_id
 * @property {import('@/types/vehicleSystem.js').VehicleSystem} [vehicle_system]
 * @property {string} name
 * @property {string} code
 * @property {string | null} description
 * @property {number} estimated_duration_minutes
 * @property {MaintenanceTaskStatus} status
 * @property {boolean} is_active
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_MAINTENANCE_TASK = Object.freeze({
  id: null,
  vehicle_id: null,
  vehicle: null,
  vehicle_system_id: null,
  vehicle_system: null,
  name: '',
  code: '',
  description: null,
  estimated_duration_minutes: null,
  status: MAINTENANCE_TASK_STATUS.CREATED,
  is_active: true,
  created_at: null,
  updated_at: null,
})

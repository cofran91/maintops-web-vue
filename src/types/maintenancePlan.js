/**
 * @typedef {Object} MaintenancePlan
 * @property {number} id
 * @property {string} code
 * @property {string} name
 * @property {string | null} description
 * @property {number | null} recommended_interval_days
 * @property {number | null} recommended_interval_km
 * @property {number[]} [task_ids]
 * @property {import('@/types/maintenanceTask.js').MaintenanceTask[]} [tasks]
 * @property {boolean} is_active
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_MAINTENANCE_PLAN = Object.freeze({
  id: null,
  code: '',
  name: '',
  description: null,
  recommended_interval_days: null,
  recommended_interval_km: null,
  task_ids: [],
  tasks: [],
  is_active: true,
  created_at: null,
  updated_at: null,
})

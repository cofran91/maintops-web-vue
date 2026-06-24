export const WORKSHOP_DAYS = Object.freeze([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])

/**
 * @typedef {typeof WORKSHOP_DAYS[number]} WorkshopDay
 */

/**
 * @typedef {Object} WorkshopScheduleHours
 * @property {string} opens_at
 * @property {string} closes_at
 */

/**
 * @typedef {Partial<Record<WorkshopDay, WorkshopScheduleHours>>} WorkshopWeeklySchedule
 */

/**
 * @typedef {Object} WorkshopUserSummary
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string[]} roles
 * @property {number | null} [workshop_id]
 */

/**
 * @typedef {Object} Workshop
 * @property {number} id
 * @property {number} manager_user_id
 * @property {WorkshopUserSummary} [manager]
 * @property {string} name
 * @property {string} code
 * @property {string | null} address
 * @property {string | null} city
 * @property {string | null} phone
 * @property {string | null} email
 * @property {WorkshopWeeklySchedule} weekly_schedule
 * @property {number[]} [vehicle_system_ids]
 * @property {import('@/types/vehicleSystem.js').VehicleSystem[]} [vehicle_systems]
 * @property {number[]} [technician_user_ids]
 * @property {WorkshopUserSummary[]} [technicians]
 * @property {boolean} is_active
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_WORKSHOP = Object.freeze({
  id: null,
  manager_user_id: null,
  manager: null,
  name: '',
  code: '',
  address: null,
  city: null,
  phone: null,
  email: null,
  weekly_schedule: {},
  vehicle_system_ids: [],
  vehicle_systems: [],
  technician_user_ids: [],
  technicians: [],
  is_active: true,
  created_at: null,
  updated_at: null,
})

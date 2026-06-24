export const VEHICLE_SYSTEM_CODES = Object.freeze([
  'ENGINE',
  'BRAKES',
  'ELECTRICAL',
  'COOLING',
  'TRANSMISSION',
  'FUEL',
  'HYDRAULIC',
  'SUSPENSION',
  'TIRES',
  'BODYWORK',
])

/**
 * @typedef {typeof VEHICLE_SYSTEM_CODES[number]} VehicleSystemCode
 */

/**
 * @typedef {Object} VehicleSystem
 * @property {number} id
 * @property {VehicleSystemCode} code
 * @property {string} name
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_VEHICLE_SYSTEM = Object.freeze({
  id: null,
  code: '',
  name: '',
  created_at: null,
  updated_at: null,
})

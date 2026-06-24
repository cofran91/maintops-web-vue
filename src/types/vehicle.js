/**
 * @typedef {Object} VehicleOwnerSummary
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {boolean} is_active
 * @property {string | null} phone
 * @property {string | null} document_number
 * @property {string | null} address
 */

/**
 * @typedef {Object} VehicleSummary
 * @property {number} id
 * @property {number} owner_id
 * @property {string} license_plate
 * @property {string | null} brand
 * @property {string | null} model
 * @property {number | null} year
 * @property {string | null} color
 * @property {number} [odometer_km]
 */

/**
 * @typedef {Object} Vehicle
 * @property {number} id
 * @property {number} owner_id
 * @property {VehicleOwnerSummary} [owner]
 * @property {string} license_plate
 * @property {string | null} brand
 * @property {string | null} model
 * @property {number | null} year
 * @property {string | null} color
 * @property {number} odometer_km
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_VEHICLE = Object.freeze({
  id: null,
  owner_id: null,
  owner: null,
  license_plate: '',
  brand: null,
  model: null,
  year: null,
  color: null,
  odometer_km: 0,
  created_at: null,
  updated_at: null,
})

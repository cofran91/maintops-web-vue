/**
 * @typedef {import('./auth.js').Role} Role
 */

/**
 * @typedef {Object} UserWorkshopSummary
 * @property {number} id
 * @property {string} name
 * @property {string} code
 * @property {string | null} city
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {Role[]} roles
 * @property {boolean} is_active
 * @property {string | null} [phone]
 * @property {string | null} [document_number]
 * @property {string | null} [address]
 * @property {number | null} [workshop_id]
 * @property {UserWorkshopSummary | null} [workshop]
 * @property {'en' | 'es' | string | null} [preferred_locale]
 * @property {string | null} [email_verified_at]
 * @property {string | null} [created_at]
 * @property {string | null} [updated_at]
 */

export const EMPTY_USER = Object.freeze({
  id: null,
  name: '',
  email: '',
  roles: [],
  is_active: false,
})

/**
 * @typedef {Object} Owner
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {boolean} is_active
 * @property {string | null} phone
 * @property {string | null} document_number
 * @property {string | null} address
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

/**
 * @typedef {Pick<Owner,
 *   'id' |
 *   'name' |
 *   'email' |
 *   'is_active' |
 *   'phone' |
 *   'document_number' |
 *   'address'
 * >} OwnerSummary
 */

export const EMPTY_OWNER = Object.freeze({
  id: null,
  name: '',
  email: '',
  is_active: true,
  phone: null,
  document_number: null,
  address: null,
  created_at: null,
  updated_at: null,
})

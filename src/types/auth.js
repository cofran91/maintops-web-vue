export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  WORKSHOP_MANAGER: 'workshop_manager',
  ADVISOR: 'advisor',
  TECHNICIAN: 'technician',
})

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'Super admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.WORKSHOP_MANAGER]: 'Workshop manager',
  [ROLES.ADVISOR]: 'Advisor',
  [ROLES.TECHNICIAN]: 'Technician',
})

export const INTERACTIVE_ROLES = Object.freeze(Object.values(ROLES))

export const isKnownRole = (role) => INTERACTIVE_ROLES.includes(role)

export const normalizeRole = (role) => {
  if (typeof role === 'string') {
    return isKnownRole(role) ? role : null
  }

  if (role && typeof role === 'object' && typeof role.name === 'string') {
    return isKnownRole(role.name) ? role.name : null
  }

  return null
}

export const hasInteractiveRole = (roles = []) => roles.some((role) => isKnownRole(role))

/**
 * @typedef {'super_admin' | 'admin' | 'workshop_manager' | 'advisor' | 'technician'} Role
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} LoginResponseData
 * @property {string} token
 * @property {string} [token_type]
 * @property {import('./user.js').User} user
 */

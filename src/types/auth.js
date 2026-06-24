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

/**
 * @typedef {'super_admin' | 'admin' | 'workshop_manager' | 'advisor' | 'technician'} Role
 */

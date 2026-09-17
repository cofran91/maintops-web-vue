export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  WORKSHOP_MANAGER: 'workshop_manager',
  ADVISOR: 'advisor',
  TECHNICIAN: 'technician',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
export type PermissionAction = 'view' | 'create' | 'update' | 'delete'

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super administrador',
  admin: 'Administrador',
  system_admin: 'Administrador',
  workshop_manager: 'Responsable de taller',
  advisor: 'Asesor',
  technician: 'Técnico',
}

const routePermissions: Record<string, Role[]> = {
  dashboard: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR, ROLES.TECHNICIAN],
  analytics: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  reports: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'access-audit': [ROLES.SUPER_ADMIN],
  orders: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR, ROLES.TECHNICIAN],
  'orders-new': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
  'orders-detail': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR, ROLES.TECHNICIAN],
  vehicles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  'vehicles-new': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  'vehicles-detail': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  'vehicles-edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  owners: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  'owners-new': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  'owners-detail': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  'owners-edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
  users: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER],
  'users-new': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'users-detail': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER],
  'users-edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  workshops: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'workshops-new': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'workshops-detail': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'workshops-edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'maintenance-plans': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
  'maintenance-plans-new': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'maintenance-plans-detail': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
  'maintenance-plans-edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'maintenance-tasks': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
  'maintenance-tasks-new': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
  'maintenance-tasks-detail': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
  'maintenance-tasks-edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
  'maintenance-schedule': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR, ROLES.TECHNICIAN],
}

const resourcePermissions: Record<string, Record<PermissionAction, Role[]>> = {
  users: {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER],
    create: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    update: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  owners: {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
    create: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
    update: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
    delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  vehicles: {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
    create: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
    update: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
    delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  workshops: {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    create: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    update: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  'maintenance-plans': {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
    create: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    update: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  'maintenance-tasks': {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
    create: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
    update: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
    delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  orders: {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR, ROLES.TECHNICIAN],
    create: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADVISOR],
    update: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WORKSHOP_MANAGER, ROLES.ADVISOR],
    delete: [],
  },
  analytics: {
    view: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    create: [],
    update: [],
    delete: [],
  },
  'audit-log': {
    view: [ROLES.SUPER_ADMIN],
    create: [],
    update: [],
    delete: [],
  },
}

const normalizedRoles = (roles?: readonly string[]) =>
  (roles ?? []).map((role) => role === 'system_admin' ? ROLES.ADMIN : role)

export const canAccessRoute = (routeName: string, roles?: readonly string[]) => {
  const allowedRoles = routePermissions[routeName]
  return Boolean(allowedRoles && normalizedRoles(roles).some((role) => allowedRoles.includes(role as Role)))
}

export const canUseResource = (
  resource: string,
  action: PermissionAction,
  roles?: readonly string[],
) => {
  const allowedRoles = resourcePermissions[resource]?.[action] ?? []
  return normalizedRoles(roles).some((role) => allowedRoles.includes(role as Role))
}

export const routePermissionsByRole = routePermissions

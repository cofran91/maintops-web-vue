import { ROLE_LABELS, ROLES, normalizeRole } from '@/types/auth.js'

export const ROUTE_KEYS = Object.freeze({
  DASHBOARD: 'dashboard',
  USERS: 'operations-users',
  OWNERS: 'operations-owners',
  WORKSHOPS: 'operations-workshops',
  VEHICLES: 'operations-vehicles',
  MAINTENANCE_TASKS: 'maintenance-tasks',
  MAINTENANCE_PLANS: 'maintenance-plans',
  ORDERS: 'orders',
  ORDER_CREATE: 'orders-new',
  ORDER_DETAIL: 'orders-detail',
  ORDER_ITEMS: 'orders-items',
  AUDIT_LOG: 'access-audit',
  ANALYTICS: 'analytics',
})

export const RESOURCES = Object.freeze({
  USERS: 'users',
  OWNERS: 'owners',
  WORKSHOPS: 'workshops',
  VEHICLES: 'vehicles',
  MAINTENANCE_TASKS: 'maintenance-tasks',
  MAINTENANCE_PLANS: 'maintenance-plans',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order-items',
  AUDIT_LOG: 'audit-log',
  ANALYTICS: 'analytics',
})

export const RESOURCE_ACTIONS = Object.freeze({
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
})

export const ORDER_STATUS = Object.freeze({
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
  REJECTED: 'rejected',
})

export const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS.APPROVED]: 'Approve',
  [ORDER_STATUS.CANCELLED]: 'Cancel',
  [ORDER_STATUS.DELIVERED]: 'Deliver',
  [ORDER_STATUS.REJECTED]: 'Reject',
})

export const ORDER_ITEM_STATUS = Object.freeze({
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
})

export const ORDER_ITEM_STATUS_LABELS = Object.freeze({
  [ORDER_ITEM_STATUS.IN_PROGRESS]: 'Start',
  [ORDER_ITEM_STATUS.COMPLETED]: 'Complete',
  [ORDER_ITEM_STATUS.REJECTED]: 'Reject',
  [ORDER_ITEM_STATUS.CANCELLED]: 'Cancel',
})

const ADMINISTRATIVE_RESOURCES = Object.freeze([
  RESOURCES.USERS,
  RESOURCES.OWNERS,
  RESOURCES.WORKSHOPS,
  RESOURCES.VEHICLES,
  RESOURCES.MAINTENANCE_TASKS,
  RESOURCES.MAINTENANCE_PLANS,
  RESOURCES.ORDERS,
  RESOURCES.ORDER_ITEMS,
])

const SYSTEM_ADMIN_ROUTES = Object.freeze([
  ROUTE_KEYS.DASHBOARD,
  ROUTE_KEYS.USERS,
  ROUTE_KEYS.OWNERS,
  ROUTE_KEYS.WORKSHOPS,
  ROUTE_KEYS.VEHICLES,
  ROUTE_KEYS.MAINTENANCE_TASKS,
  ROUTE_KEYS.MAINTENANCE_PLANS,
  ROUTE_KEYS.ORDERS,
  ROUTE_KEYS.ORDER_CREATE,
  ROUTE_KEYS.ORDER_DETAIL,
  ROUTE_KEYS.ORDER_ITEMS,
  ROUTE_KEYS.ANALYTICS,
])

const freezeListMatrix = (matrix) =>
  Object.freeze(
    Object.fromEntries(
      Object.entries(matrix).map(([key, values]) => [key, Object.freeze(values)]),
    ),
  )

const freezeActionMatrix = (matrix) =>
  Object.freeze(
    Object.fromEntries(
      Object.entries(matrix).map(([role, permissions]) => [
        role,
        Object.freeze(
          Object.fromEntries(
            Object.entries(permissions).map(([action, resources]) => [
              action,
              Object.freeze(resources),
            ]),
          ),
        ),
      ]),
    ),
  )

export const ROUTE_PERMISSIONS_BY_ROLE = freezeListMatrix({
  [ROLES.SUPER_ADMIN]: Object.freeze([...SYSTEM_ADMIN_ROUTES, ROUTE_KEYS.AUDIT_LOG]),
  [ROLES.ADMIN]: SYSTEM_ADMIN_ROUTES,
  [ROLES.WORKSHOP_MANAGER]: [
    ROUTE_KEYS.DASHBOARD,
    ROUTE_KEYS.USERS,
    ROUTE_KEYS.OWNERS,
    ROUTE_KEYS.VEHICLES,
    ROUTE_KEYS.ORDERS,
    ROUTE_KEYS.ORDER_DETAIL,
    ROUTE_KEYS.ORDER_ITEMS,
  ],
  [ROLES.ADVISOR]: [
    ROUTE_KEYS.DASHBOARD,
    ROUTE_KEYS.OWNERS,
    ROUTE_KEYS.VEHICLES,
    ROUTE_KEYS.MAINTENANCE_TASKS,
    ROUTE_KEYS.ORDERS,
    ROUTE_KEYS.ORDER_CREATE,
    ROUTE_KEYS.ORDER_DETAIL,
    ROUTE_KEYS.ORDER_ITEMS,
  ],
  [ROLES.TECHNICIAN]: [
    ROUTE_KEYS.DASHBOARD,
    ROUTE_KEYS.ORDERS,
    ROUTE_KEYS.ORDER_DETAIL,
    ROUTE_KEYS.ORDER_ITEMS,
  ],
})

export const RESOURCE_PERMISSIONS_BY_ROLE = freezeActionMatrix({
  [ROLES.SUPER_ADMIN]: {
    [RESOURCE_ACTIONS.VIEW]: [
      ...ADMINISTRATIVE_RESOURCES,
      RESOURCES.AUDIT_LOG,
      RESOURCES.ANALYTICS,
    ],
    [RESOURCE_ACTIONS.CREATE]: [
      RESOURCES.USERS,
      RESOURCES.OWNERS,
      RESOURCES.WORKSHOPS,
      RESOURCES.VEHICLES,
      RESOURCES.MAINTENANCE_TASKS,
      RESOURCES.MAINTENANCE_PLANS,
      RESOURCES.ORDERS,
    ],
    [RESOURCE_ACTIONS.UPDATE]: ADMINISTRATIVE_RESOURCES,
    [RESOURCE_ACTIONS.DELETE]: [
      RESOURCES.USERS,
      RESOURCES.OWNERS,
      RESOURCES.WORKSHOPS,
      RESOURCES.VEHICLES,
      RESOURCES.MAINTENANCE_TASKS,
      RESOURCES.MAINTENANCE_PLANS,
    ],
  },
  [ROLES.ADMIN]: {
    [RESOURCE_ACTIONS.VIEW]: [...ADMINISTRATIVE_RESOURCES, RESOURCES.ANALYTICS],
    [RESOURCE_ACTIONS.CREATE]: [
      RESOURCES.USERS,
      RESOURCES.OWNERS,
      RESOURCES.WORKSHOPS,
      RESOURCES.VEHICLES,
      RESOURCES.MAINTENANCE_TASKS,
      RESOURCES.MAINTENANCE_PLANS,
      RESOURCES.ORDERS,
    ],
    [RESOURCE_ACTIONS.UPDATE]: ADMINISTRATIVE_RESOURCES,
    [RESOURCE_ACTIONS.DELETE]: [
      RESOURCES.USERS,
      RESOURCES.OWNERS,
      RESOURCES.WORKSHOPS,
      RESOURCES.VEHICLES,
      RESOURCES.MAINTENANCE_TASKS,
      RESOURCES.MAINTENANCE_PLANS,
    ],
  },
  [ROLES.WORKSHOP_MANAGER]: {
    [RESOURCE_ACTIONS.VIEW]: [
      RESOURCES.USERS,
      RESOURCES.OWNERS,
      RESOURCES.VEHICLES,
      RESOURCES.ORDERS,
      RESOURCES.ORDER_ITEMS,
    ],
    [RESOURCE_ACTIONS.CREATE]: [RESOURCES.OWNERS, RESOURCES.VEHICLES],
    [RESOURCE_ACTIONS.UPDATE]: [
      RESOURCES.OWNERS,
      RESOURCES.VEHICLES,
      RESOURCES.ORDERS,
      RESOURCES.ORDER_ITEMS,
    ],
    [RESOURCE_ACTIONS.DELETE]: [],
  },
  [ROLES.ADVISOR]: {
    [RESOURCE_ACTIONS.VIEW]: [
      RESOURCES.OWNERS,
      RESOURCES.VEHICLES,
      RESOURCES.MAINTENANCE_TASKS,
      RESOURCES.ORDERS,
      RESOURCES.ORDER_ITEMS,
    ],
    [RESOURCE_ACTIONS.CREATE]: [
      RESOURCES.OWNERS,
      RESOURCES.VEHICLES,
      RESOURCES.MAINTENANCE_TASKS,
      RESOURCES.ORDERS,
    ],
    [RESOURCE_ACTIONS.UPDATE]: [
      RESOURCES.OWNERS,
      RESOURCES.ORDERS,
      RESOURCES.ORDER_ITEMS,
    ],
    [RESOURCE_ACTIONS.DELETE]: [],
  },
  [ROLES.TECHNICIAN]: {
    [RESOURCE_ACTIONS.VIEW]: [RESOURCES.ORDERS, RESOURCES.ORDER_ITEMS],
    [RESOURCE_ACTIONS.CREATE]: [],
    [RESOURCE_ACTIONS.UPDATE]: [RESOURCES.ORDER_ITEMS],
    [RESOURCE_ACTIONS.DELETE]: [],
  },
})

export const ASSIGNABLE_ROLES_BY_ROLE = freezeListMatrix({
  [ROLES.SUPER_ADMIN]: [
    ROLES.ADMIN,
    ROLES.WORKSHOP_MANAGER,
    ROLES.ADVISOR,
    ROLES.TECHNICIAN,
  ],
  [ROLES.ADMIN]: [
    ROLES.ADMIN,
    ROLES.WORKSHOP_MANAGER,
    ROLES.ADVISOR,
    ROLES.TECHNICIAN,
  ],
  [ROLES.WORKSHOP_MANAGER]: [],
  [ROLES.ADVISOR]: [],
  [ROLES.TECHNICIAN]: [],
})

export const ORDER_STATUS_ACTIONS_BY_ROLE = freezeListMatrix({
  [ROLES.SUPER_ADMIN]: [
    ORDER_STATUS.APPROVED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.REJECTED,
  ],
  [ROLES.ADMIN]: [
    ORDER_STATUS.APPROVED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.REJECTED,
  ],
  [ROLES.WORKSHOP_MANAGER]: [ORDER_STATUS.CANCELLED],
  [ROLES.ADVISOR]: [ORDER_STATUS.APPROVED, ORDER_STATUS.REJECTED],
  [ROLES.TECHNICIAN]: [],
})

export const ORDER_ITEM_STATUS_ACTIONS_BY_ROLE = freezeListMatrix({
  [ROLES.SUPER_ADMIN]: [
    ORDER_ITEM_STATUS.IN_PROGRESS,
    ORDER_ITEM_STATUS.COMPLETED,
    ORDER_ITEM_STATUS.REJECTED,
    ORDER_ITEM_STATUS.CANCELLED,
  ],
  [ROLES.ADMIN]: [
    ORDER_ITEM_STATUS.IN_PROGRESS,
    ORDER_ITEM_STATUS.COMPLETED,
    ORDER_ITEM_STATUS.REJECTED,
    ORDER_ITEM_STATUS.CANCELLED,
  ],
  [ROLES.WORKSHOP_MANAGER]: [ORDER_ITEM_STATUS.CANCELLED],
  [ROLES.ADVISOR]: [ORDER_ITEM_STATUS.REJECTED],
  [ROLES.TECHNICIAN]: [ORDER_ITEM_STATUS.IN_PROGRESS, ORDER_ITEM_STATUS.COMPLETED],
})

export const normalizePermissionRoles = (roles = []) => {
  const source = Array.isArray(roles) ? roles : [roles]
  const normalizedRoles = source.map((role) => normalizeRole(role)).filter(Boolean)

  return [...new Set(normalizedRoles)]
}

const hasAnyRolePermission = (roles, resolver) =>
  normalizePermissionRoles(roles).some((role) => resolver(role))

const orderedUnion = (roles, matrix, displayOrder) => {
  const allowedValues = normalizePermissionRoles(roles).flatMap((role) => matrix[role] ?? [])

  return displayOrder.filter((value) => allowedValues.includes(value))
}

export const isRouteKey = (routeKey) => Object.values(ROUTE_KEYS).includes(routeKey)

export const canAccessRoute = (role, routeKey) => {
  const normalizedRole = normalizeRole(role)

  if (!normalizedRole || !isRouteKey(routeKey)) {
    return false
  }

  return ROUTE_PERMISSIONS_BY_ROLE[normalizedRole]?.includes(routeKey) ?? false
}

export const canAccessAnyRoute = (roles, routeKey) =>
  hasAnyRolePermission(roles, (role) => canAccessRoute(role, routeKey))

export const canUseResource = (role, action, resource) => {
  const normalizedRole = normalizeRole(role)

  if (!normalizedRole || !Object.values(RESOURCE_ACTIONS).includes(action)) {
    return false
  }

  return RESOURCE_PERMISSIONS_BY_ROLE[normalizedRole]?.[action]?.includes(resource) ?? false
}

export const canUseResourceWithAnyRole = (roles, action, resource) =>
  hasAnyRolePermission(roles, (role) => canUseResource(role, action, resource))

export const canView = (role, resource) => canUseResource(role, RESOURCE_ACTIONS.VIEW, resource)

export const canCreate = (role, resource) => canUseResource(role, RESOURCE_ACTIONS.CREATE, resource)

export const canUpdate = (role, resource) => canUseResource(role, RESOURCE_ACTIONS.UPDATE, resource)

export const canDelete = (role, resource) => canUseResource(role, RESOURCE_ACTIONS.DELETE, resource)

export const canViewForAnyRole = (roles, resource) =>
  canUseResourceWithAnyRole(roles, RESOURCE_ACTIONS.VIEW, resource)

export const canCreateForAnyRole = (roles, resource) =>
  canUseResourceWithAnyRole(roles, RESOURCE_ACTIONS.CREATE, resource)

export const canUpdateForAnyRole = (roles, resource) =>
  canUseResourceWithAnyRole(roles, RESOURCE_ACTIONS.UPDATE, resource)

export const canDeleteForAnyRole = (roles, resource) =>
  canUseResourceWithAnyRole(roles, RESOURCE_ACTIONS.DELETE, resource)

export const getAssignableRoles = (roles) =>
  orderedUnion(roles, ASSIGNABLE_ROLES_BY_ROLE, Object.values(ROLES))

export const canAssignRole = (roles, targetRole) => {
  const normalizedTargetRole = normalizeRole(targetRole)

  if (!normalizedTargetRole) {
    return false
  }

  return getAssignableRoles(roles).includes(normalizedTargetRole)
}

export const getAssignableRoleOptions = (roles) =>
  getAssignableRoles(roles).map((role) => ({
    value: role,
    label: ROLE_LABELS[role] ?? role,
  }))

export const canViewAudits = (roles) => canViewForAnyRole(roles, RESOURCES.AUDIT_LOG)

export const canViewAnalytics = (roles) => canViewForAnyRole(roles, RESOURCES.ANALYTICS)

export const getAllowedOrderStatusActions = (roles) =>
  orderedUnion(roles, ORDER_STATUS_ACTIONS_BY_ROLE, Object.values(ORDER_STATUS))

export const getAllowedOrderItemStatusActions = (roles) =>
  orderedUnion(roles, ORDER_ITEM_STATUS_ACTIONS_BY_ROLE, Object.values(ORDER_ITEM_STATUS))

export const canChangeOrderStatus = (roles, status = null) => {
  const allowedStatuses = getAllowedOrderStatusActions(roles)

  return status === null ? allowedStatuses.length > 0 : allowedStatuses.includes(status)
}

export const canChangeOrderItemStatus = (roles, status = null) => {
  const allowedStatuses = getAllowedOrderItemStatusActions(roles)

  return status === null ? allowedStatuses.length > 0 : allowedStatuses.includes(status)
}

export const filterNavigationByPermissions = (items = [], roles = []) =>
  items.reduce((visibleItems, item) => {
    const filteredChildren = Array.isArray(item.menu)
      ? filterNavigationByPermissions(item.menu, roles)
      : null
    const hasVisibleChildren = Array.isArray(filteredChildren) && filteredChildren.length > 0
    const canAccessItem = !item.permissionKey || canAccessAnyRoute(roles, item.permissionKey)

    if (!canAccessItem && !hasVisibleChildren) {
      return visibleItems
    }

    if (Array.isArray(item.menu) && !hasVisibleChildren) {
      return visibleItems
    }

    visibleItems.push({
      ...item,
      ...(Array.isArray(item.menu) ? { menu: filteredChildren } : {}),
    })

    return visibleItems
  }, [])

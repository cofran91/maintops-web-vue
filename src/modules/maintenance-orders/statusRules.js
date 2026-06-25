import { ROLES } from '@/types/auth.js'
import {
  MAINTENANCE_ORDER_ACTIONS,
  MAINTENANCE_ORDER_STATUSES,
} from '@/types/maintenanceOrder.js'
import {
  MAINTENANCE_ORDER_ITEM_ACTIONS,
  MAINTENANCE_ORDER_ITEM_STATUSES,
} from '@/types/maintenanceOrderItem.js'

export const ORDER_STATUS_LABELS = Object.freeze({
  created: 'Created',
  pending_owner_approval: 'Pending owner approval',
  approved: 'Approved',
  partially_approved: 'Partially approved',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
})

export const ORDER_ACTION_LABELS = Object.freeze({
  approved: 'Approve',
  rejected: 'Reject',
  cancelled: 'Cancel',
  delivered: 'Deliver',
})

export const ORDER_ITEM_STATUS_LABELS = Object.freeze({
  pending_owner_approval: 'Pending owner approval',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
})

export const ORDER_ITEM_ACTION_LABELS = Object.freeze({
  in_progress: 'Start',
  completed: 'Complete',
  rejected: 'Reject',
  cancelled: 'Cancel',
})

const ADMIN_ROLES = Object.freeze([ROLES.SUPER_ADMIN, ROLES.ADMIN])

const ORDER_ACTIONS_BY_ROLE = Object.freeze({
  [ROLES.SUPER_ADMIN]: ['approved', 'rejected', 'cancelled', 'delivered'],
  [ROLES.ADMIN]: ['approved', 'rejected', 'cancelled', 'delivered'],
  [ROLES.ADVISOR]: ['approved', 'rejected'],
  [ROLES.WORKSHOP_MANAGER]: ['cancelled'],
  [ROLES.TECHNICIAN]: [],
})

const ORDER_ITEM_ACTIONS_BY_ROLE = Object.freeze({
  [ROLES.SUPER_ADMIN]: ['in_progress', 'completed', 'rejected', 'cancelled'],
  [ROLES.ADMIN]: ['in_progress', 'completed', 'rejected', 'cancelled'],
  [ROLES.ADVISOR]: ['rejected'],
  [ROLES.WORKSHOP_MANAGER]: ['cancelled'],
  [ROLES.TECHNICIAN]: ['in_progress', 'completed'],
})

const ORDER_TRANSITIONS = Object.freeze({
  created: ['rejected'],
  pending_owner_approval: ['approved', 'rejected'],
  approved: ['rejected', 'scheduled'],
  partially_approved: ['rejected', 'scheduled'],
  scheduled: ['rejected', 'cancelled', 'in_progress'],
  in_progress: ['cancelled', 'completed'],
  completed: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
})

const ORDER_ITEM_TRANSITIONS = Object.freeze({
  pending_owner_approval: ['rejected'],
  scheduled: ['rejected', 'cancelled', 'in_progress'],
  in_progress: ['cancelled', 'completed'],
  completed: [],
  rejected: [],
  cancelled: [],
})

const normalizeRoles = (roles = []) => {
  const source = Array.isArray(roles) ? roles : [roles]

  return source.filter((role) => Object.values(ROLES).includes(role))
}

const hasAnyRole = (roles, allowedRoles) =>
  normalizeRoles(roles).some((role) => allowedRoles.includes(role))

const allowedByRole = (roles, matrix, displayOrder) => {
  const allowedActions = normalizeRoles(roles).flatMap((role) => matrix[role] ?? [])

  return displayOrder.filter((action) => allowedActions.includes(action))
}

export const isOrderStatus = (status) => MAINTENANCE_ORDER_STATUSES.includes(status)

export const isOrderAction = (status) => MAINTENANCE_ORDER_ACTIONS.includes(status)

export const isOrderItemStatus = (status) => MAINTENANCE_ORDER_ITEM_STATUSES.includes(status)

export const isOrderItemAction = (status) => MAINTENANCE_ORDER_ITEM_ACTIONS.includes(status)

export const canTransitionOrder = (currentStatus, nextStatus) =>
  (ORDER_TRANSITIONS[currentStatus] ?? []).includes(nextStatus)

export const canTransitionOrderItem = (currentStatus, nextStatus) =>
  (ORDER_ITEM_TRANSITIONS[currentStatus] ?? []).includes(nextStatus)

export const orderStatusColor = (status) => {
  const colors = {
    created: 'neutral',
    pending_owner_approval: 'warning',
    approved: 'info',
    partially_approved: 'info',
    rejected: 'danger',
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
    delivered: 'success',
    cancelled: 'danger',
  }

  return colors[status] ?? 'neutral'
}

export const orderItemStatusColor = (status) => {
  const colors = {
    pending_owner_approval: 'warning',
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
    rejected: 'danger',
    cancelled: 'danger',
  }

  return colors[status] ?? 'neutral'
}

export const canUseWorkshopScopedAction = (orderLike, user) => {
  if (!user?.workshop_id) {
    return false
  }

  return Number(orderLike?.workshop_id) === Number(user.workshop_id)
}

export const orderStatusActions = (order, roles, user = null) => {
  const normalizedRoles = normalizeRoles(roles)
  const roleActions = allowedByRole(
    normalizedRoles,
    ORDER_ACTIONS_BY_ROLE,
    MAINTENANCE_ORDER_ACTIONS,
  )

  return roleActions.filter((action) => {
    if (!canTransitionOrder(order.status, action)) {
      return false
    }

    if (
      action === 'cancelled' &&
      !hasAnyRole(normalizedRoles, ADMIN_ROLES) &&
      normalizedRoles.includes(ROLES.WORKSHOP_MANAGER)
    ) {
      return canUseWorkshopScopedAction(order, user)
    }

    return true
  })
}

export const canUseOrderStatusAction = (order, roles, status, user = null) =>
  orderStatusActions(order, roles, user).includes(status)

export const orderItemStatusActions = (item, roles, user = null) => {
  const normalizedRoles = normalizeRoles(roles)
  const roleActions = allowedByRole(
    normalizedRoles,
    ORDER_ITEM_ACTIONS_BY_ROLE,
    MAINTENANCE_ORDER_ITEM_ACTIONS,
  )

  return roleActions.filter((action) => {
    if (!canTransitionOrderItem(item.status, action)) {
      return false
    }

    if (
      action === 'cancelled' &&
      !hasAnyRole(normalizedRoles, ADMIN_ROLES) &&
      normalizedRoles.includes(ROLES.WORKSHOP_MANAGER)
    ) {
      return canUseWorkshopScopedAction(item.maintenance_order, user)
    }

    return true
  })
}

export const canUseOrderItemStatusAction = (item, roles, status, user = null) =>
  orderItemStatusActions(item, roles, user).includes(status)

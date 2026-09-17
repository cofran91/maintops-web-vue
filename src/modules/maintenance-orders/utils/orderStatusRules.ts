import type { MaintenanceOrder } from '@/types/maintenanceOrder'

export type MaintenanceOrderAction = 'approved' | 'rejected' | 'cancelled' | 'delivered'

const ADMIN_ROLES = ['super_admin', 'admin']
const ORDER_ACTIONS_BY_ROLE: Record<string, MaintenanceOrderAction[]> = {
  super_admin: ['approved', 'rejected', 'cancelled', 'delivered'],
  admin: ['approved', 'rejected', 'cancelled', 'delivered'],
  advisor: ['approved', 'rejected'],
  workshop_manager: ['cancelled'],
}

const ORDER_TRANSITIONS: Record<string, MaintenanceOrderAction[]> = {
  created: ['rejected'],
  pending_owner_approval: ['approved', 'rejected'],
  approved: ['rejected'],
  partially_approved: ['rejected'],
  scheduled: ['rejected', 'cancelled'],
  in_progress: ['cancelled'],
  completed: ['delivered'],
}

export const orderStatusActions = (
  order: MaintenanceOrder,
  roles: string[] = [],
  user?: { workshop_id?: unknown; [key: string]: unknown } | null,
): MaintenanceOrderAction[] => {
  const allowedActions = roles.flatMap((role) => ORDER_ACTIONS_BY_ROLE[role] ?? [])
  const transitionActions = ORDER_TRANSITIONS[order.status] ?? []

  return [...new Set(allowedActions)].filter((action) => {
    if (!transitionActions.includes(action)) {
      return false
    }

    if (action === 'cancelled' && roles.includes('workshop_manager')) {
      return (
        ADMIN_ROLES.some((role) => roles.includes(role)) ||
        Number(order.workshop?.id) === Number(user?.workshop_id)
      )
    }

    return true
  })
}

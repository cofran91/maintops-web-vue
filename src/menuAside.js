import {
  mdiAccountMultiple,
  mdiChartLine,
  mdiCogOutline,
  mdiLogout,
  mdiMonitor,
  mdiSquareEditOutline,
  mdiTable,
  mdiViewList,
} from '@mdi/js'
import { ROUTE_KEYS } from '@/auth/permissions.js'

export const menuAsideMain = [
  {
    to: '/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
    permissionKey: ROUTE_KEYS.DASHBOARD,
  },
  {
    label: 'Operations',
    icon: mdiTable,
    menu: [
      {
        to: '/operations/users',
        label: 'Users',
        permissionKey: ROUTE_KEYS.USERS,
      },
      {
        to: '/operations/owners',
        label: 'Owners',
        permissionKey: ROUTE_KEYS.OWNERS,
      },
      {
        to: '/operations/workshops',
        label: 'Workshops',
        permissionKey: ROUTE_KEYS.WORKSHOPS,
      },
      {
        to: '/operations/vehicles',
        label: 'Vehicles',
        permissionKey: ROUTE_KEYS.VEHICLES,
      },
    ],
  },
  {
    label: 'Maintenance',
    icon: mdiCogOutline,
    menu: [
      {
        to: '/maintenance/tasks',
        label: 'Tasks',
        permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS,
      },
      {
        to: '/maintenance/plans',
        label: 'Plans',
        permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS,
      },
    ],
  },
  {
    label: 'Orders',
    icon: mdiViewList,
    menu: [
      {
        to: '/orders',
        label: 'Orders',
        permissionKey: ROUTE_KEYS.ORDERS,
      },
      {
        to: '/orders/new',
        label: 'New order',
        icon: mdiSquareEditOutline,
        permissionKey: ROUTE_KEYS.ORDER_CREATE,
      },
    ],
  },
  {
    to: '/analytics',
    icon: mdiChartLine,
    label: 'Analytics',
    permissionKey: ROUTE_KEYS.ANALYTICS,
  },
  {
    label: 'Access',
    icon: mdiAccountMultiple,
    menu: [
      {
        to: '/access/audit',
        label: 'Audit log',
        permissionKey: ROUTE_KEYS.AUDIT_LOG,
      },
    ],
  },
]

export const menuAsideBottom = [
  {
    label: 'Sign out',
    icon: mdiLogout,
    color: 'info',
    isLogout: true,
  },
]

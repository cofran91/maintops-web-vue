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
    labelKey: 'nav.dashboard',
    permissionKey: ROUTE_KEYS.DASHBOARD,
  },
  {
    label: 'Operations',
    labelKey: 'nav.operations',
    icon: mdiTable,
    menu: [
      {
        to: '/operations/users',
        label: 'Users',
        labelKey: 'nav.users',
        permissionKey: ROUTE_KEYS.USERS,
      },
      {
        to: '/operations/owners',
        label: 'Owners',
        labelKey: 'nav.owners',
        permissionKey: ROUTE_KEYS.OWNERS,
      },
      {
        to: '/operations/workshops',
        label: 'Workshops',
        labelKey: 'nav.workshops',
        permissionKey: ROUTE_KEYS.WORKSHOPS,
      },
      {
        to: '/operations/vehicles',
        label: 'Vehicles',
        labelKey: 'nav.vehicles',
        permissionKey: ROUTE_KEYS.VEHICLES,
      },
    ],
  },
  {
    label: 'Maintenance',
    labelKey: 'nav.maintenance',
    icon: mdiCogOutline,
    menu: [
      {
        to: '/maintenance/tasks',
        label: 'Tasks',
        labelKey: 'nav.tasks',
        permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS,
      },
      {
        to: '/maintenance/plans',
        label: 'Plans',
        labelKey: 'nav.plans',
        permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS,
      },
    ],
  },
  {
    label: 'Orders',
    labelKey: 'nav.orders',
    icon: mdiViewList,
    menu: [
      {
        to: '/orders',
        label: 'Orders',
        labelKey: 'nav.orders',
        permissionKey: ROUTE_KEYS.ORDERS,
      },
      {
        to: '/orders/new',
        label: 'New order',
        labelKey: 'nav.newOrder',
        icon: mdiSquareEditOutline,
        permissionKey: ROUTE_KEYS.ORDER_CREATE,
      },
    ],
  },
  {
    to: '/analytics',
    icon: mdiChartLine,
    label: 'Analytics',
    labelKey: 'nav.analytics',
    permissionKey: ROUTE_KEYS.ANALYTICS,
  },
  {
    label: 'Access',
    labelKey: 'nav.access',
    icon: mdiAccountMultiple,
    menu: [
      {
        to: '/access/audit',
        label: 'Audit log',
        labelKey: 'nav.auditLog',
        permissionKey: ROUTE_KEYS.AUDIT_LOG,
      },
    ],
  },
]

export const menuAsideBottom = [
  {
    label: 'Sign out',
    labelKey: 'nav.signOut',
    icon: mdiLogout,
    color: 'info',
    isLogout: true,
  },
]

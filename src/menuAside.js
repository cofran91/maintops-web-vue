import {
  mdiAccountMultiple,
  mdiCogOutline,
  mdiLogout,
  mdiMonitor,
  mdiSquareEditOutline,
  mdiTable,
  mdiViewList,
} from '@mdi/js'

export const menuAsideMain = [
  {
    to: '/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
  },
  {
    label: 'Operations',
    icon: mdiTable,
    menu: [
      {
        to: '/operations/users',
        label: 'Users',
      },
      {
        to: '/operations/owners',
        label: 'Owners',
      },
      {
        to: '/operations/workshops',
        label: 'Workshops',
      },
      {
        to: '/operations/vehicles',
        label: 'Vehicles',
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
      },
      {
        to: '/maintenance/plans',
        label: 'Plans',
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
      },
      {
        to: '/orders/new',
        label: 'New order',
        icon: mdiSquareEditOutline,
      },
      {
        to: '/orders/detail',
        label: 'Order detail',
      },
      {
        to: '/orders/items',
        label: 'Order items',
      },
    ],
  },
  {
    label: 'Access',
    icon: mdiAccountMultiple,
    menu: [
      {
        to: '/access/audit',
        label: 'Audit log',
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

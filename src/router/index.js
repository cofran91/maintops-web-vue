import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import ModuleDetailView from '@/views/ModuleDetailView.vue'
import ModuleFormView from '@/views/ModuleFormView.vue'
import ModuleListView from '@/views/ModuleListView.vue'

const listRoute = (path, title, section, subtitle, options = {}) => ({
  meta: {
    title,
    section,
    subtitle,
    ...options,
  },
  path,
  name: path.replace(/^\//, '').replaceAll('/', '-'),
  component: ModuleListView,
})

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    meta: {
      title: 'Dashboard',
    },
    path: '/dashboard',
    name: 'dashboard',
    component: Home,
  },
  listRoute(
    '/operations/users',
    'Users',
    'Operations',
    'Manage the people who operate and administer MaintOps.',
  ),
  listRoute(
    '/operations/owners',
    'Owners',
    'Operations',
    'Review owner records used by vehicles and service orders.',
  ),
  listRoute(
    '/operations/workshops',
    'Workshops',
    'Operations',
    'Organize service locations and workshop administration.',
  ),
  listRoute(
    '/operations/vehicles',
    'Vehicles',
    'Operations',
    'Track fleet and owner vehicles prepared for maintenance workflows.',
  ),
  listRoute(
    '/maintenance/tasks',
    'Maintenance tasks',
    'Maintenance',
    'Standardize service tasks used by plans and order items.',
  ),
  listRoute(
    '/maintenance/plans',
    'Maintenance plans',
    'Maintenance',
    'Group maintenance tasks into reusable operational plans.',
  ),
  listRoute('/orders', 'Orders', 'Orders', 'Coordinate workshop service orders.', {
    createTo: '/orders/new',
    detailTo: '/orders/detail',
  }),
  {
    meta: {
      title: 'New order',
      subtitle: 'Capture vehicle, workshop, advisor, and priority context.',
    },
    path: '/orders/new',
    name: 'orders-new',
    component: ModuleFormView,
  },
  {
    meta: {
      title: 'Order detail',
      subtitle: 'Review service status, assignments, and related order items.',
    },
    path: '/orders/detail',
    name: 'orders-detail',
    component: ModuleDetailView,
  },
  listRoute('/orders/items', 'Order items', 'Orders', 'Track task-level execution inside orders.', {
    detailTo: '/orders/detail',
  }),
  listRoute('/access/audit', 'Audit log', 'Access', 'Review traceable operational events.', {
    isEmpty: true,
  }),
  {
    meta: {
      title: 'Not Found',
    },
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/ErrorView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router

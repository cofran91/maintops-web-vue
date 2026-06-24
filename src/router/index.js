import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import ModuleDetailView from '@/views/ModuleDetailView.vue'
import ModuleFormView from '@/views/ModuleFormView.vue'
import ModuleListView from '@/views/ModuleListView.vue'
import OwnerDetailView from '@/modules/owners/views/OwnerDetailView.vue'
import OwnerFormView from '@/modules/owners/views/OwnerFormView.vue'
import OwnersListView from '@/modules/owners/views/OwnersListView.vue'
import {
  RESOURCE_ACTIONS,
  ROUTE_KEYS,
  RESOURCES,
  canAccessAnyRoute,
  canUseResourceWithAnyRole,
} from '@/auth/permissions.js'
import LoginView from '@/modules/auth/views/LoginView.vue'
import UserDetailView from '@/modules/users/views/UserDetailView.vue'
import UserFormView from '@/modules/users/views/UserFormView.vue'
import UsersListView from '@/modules/users/views/UsersListView.vue'
import { useAuthStore } from '@/stores/auth.js'

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
      title: 'Login',
      public: true,
      guestOnly: true,
    },
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    meta: {
      title: 'Dashboard',
      permissionKey: ROUTE_KEYS.DASHBOARD,
    },
    path: '/dashboard',
    name: 'dashboard',
    component: Home,
  },
  {
    meta: {
      title: 'Users',
      section: 'Operations',
      subtitle: 'Manage the people who operate and administer MaintOps.',
      permissionKey: ROUTE_KEYS.USERS,
      resource: RESOURCES.USERS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/users',
    name: 'operations-users',
    component: UsersListView,
  },
  {
    meta: {
      title: 'Create user',
      section: 'Operations',
      subtitle: 'Create an operational console user and assign a role.',
      permissionKey: ROUTE_KEYS.USERS,
      resource: RESOURCES.USERS,
      resourceAction: RESOURCE_ACTIONS.CREATE,
    },
    path: '/operations/users/new',
    name: 'operations-users-new',
    component: UserFormView,
  },
  {
    meta: {
      title: 'User detail',
      section: 'Operations',
      subtitle: 'Review role, contact, and workshop assignment details.',
      permissionKey: ROUTE_KEYS.USERS,
      resource: RESOURCES.USERS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/users/:id',
    name: 'operations-users-detail',
    component: UserDetailView,
  },
  {
    meta: {
      title: 'Edit user',
      section: 'Operations',
      subtitle: 'Update operational profile, role, status, and assignment fields.',
      permissionKey: ROUTE_KEYS.USERS,
      resource: RESOURCES.USERS,
      resourceAction: RESOURCE_ACTIONS.UPDATE,
    },
    path: '/operations/users/:id/edit',
    name: 'operations-users-edit',
    component: UserFormView,
  },
  {
    meta: {
      title: 'Owners',
      section: 'Operations',
      subtitle: 'Review owner records used by vehicles and service orders.',
      permissionKey: ROUTE_KEYS.OWNERS,
      resource: RESOURCES.OWNERS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/owners',
    name: 'operations-owners',
    component: OwnersListView,
  },
  {
    meta: {
      title: 'Create owner',
      section: 'Operations',
      subtitle: 'Create a vehicle owner contact record.',
      permissionKey: ROUTE_KEYS.OWNERS,
      resource: RESOURCES.OWNERS,
      resourceAction: RESOURCE_ACTIONS.CREATE,
    },
    path: '/operations/owners/new',
    name: 'operations-owners-new',
    component: OwnerFormView,
  },
  {
    meta: {
      title: 'Owner detail',
      section: 'Operations',
      subtitle: 'Review owner contact details and active availability.',
      permissionKey: ROUTE_KEYS.OWNERS,
      resource: RESOURCES.OWNERS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/owners/:id',
    name: 'operations-owners-detail',
    component: OwnerDetailView,
  },
  {
    meta: {
      title: 'Edit owner',
      section: 'Operations',
      subtitle: 'Update owner contact details and active availability.',
      permissionKey: ROUTE_KEYS.OWNERS,
      resource: RESOURCES.OWNERS,
      resourceAction: RESOURCE_ACTIONS.UPDATE,
    },
    path: '/operations/owners/:id/edit',
    name: 'operations-owners-edit',
    component: OwnerFormView,
  },
  listRoute(
    '/operations/workshops',
    'Workshops',
    'Operations',
    'Organize service locations and workshop administration.',
    {
      permissionKey: ROUTE_KEYS.WORKSHOPS,
      resource: RESOURCES.WORKSHOPS,
    },
  ),
  listRoute(
    '/operations/vehicles',
    'Vehicles',
    'Operations',
    'Track fleet and owner vehicles prepared for maintenance workflows.',
    {
      permissionKey: ROUTE_KEYS.VEHICLES,
      resource: RESOURCES.VEHICLES,
    },
  ),
  listRoute(
    '/maintenance/tasks',
    'Maintenance tasks',
    'Maintenance',
    'Standardize service tasks used by plans and order items.',
    {
      permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS,
      resource: RESOURCES.MAINTENANCE_TASKS,
    },
  ),
  listRoute(
    '/maintenance/plans',
    'Maintenance plans',
    'Maintenance',
    'Group maintenance tasks into reusable operational plans.',
    {
      permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS,
      resource: RESOURCES.MAINTENANCE_PLANS,
    },
  ),
  listRoute('/orders', 'Orders', 'Orders', 'Coordinate workshop service orders.', {
    permissionKey: ROUTE_KEYS.ORDERS,
    resource: RESOURCES.ORDERS,
    createTo: '/orders/new',
    detailTo: '/orders/detail',
  }),
  {
    meta: {
      title: 'New order',
      section: 'Orders',
      subtitle: 'Capture vehicle, workshop, advisor, and priority context.',
      permissionKey: ROUTE_KEYS.ORDER_CREATE,
      resource: RESOURCES.ORDERS,
    },
    path: '/orders/new',
    name: 'orders-new',
    component: ModuleFormView,
  },
  {
    meta: {
      title: 'Order detail',
      section: 'Orders',
      subtitle: 'Review service status, assignments, and related order items.',
      permissionKey: ROUTE_KEYS.ORDER_DETAIL,
      resource: RESOURCES.ORDERS,
    },
    path: '/orders/detail',
    name: 'orders-detail',
    component: ModuleDetailView,
  },
  listRoute('/orders/items', 'Order items', 'Orders', 'Track task-level execution inside orders.', {
    permissionKey: ROUTE_KEYS.ORDER_ITEMS,
    resource: RESOURCES.ORDER_ITEMS,
    detailTo: '/orders/detail',
  }),
  listRoute('/access/audit', 'Audit log', 'Access', 'Review traceable operational events.', {
    permissionKey: ROUTE_KEYS.AUDIT_LOG,
    resource: RESOURCES.AUDIT_LOG,
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

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  authStore.initializeSession()

  const isPublicRoute = to.matched.some((route) => route.meta.public)
  const isGuestOnlyRoute = to.matched.some((route) => route.meta.guestOnly)

  if (isPublicRoute && isGuestOnlyRoute && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (isPublicRoute) {
    return true
  }

  if (!authStore.isAuthenticated && authStore.token) {
    try {
      await authStore.fetchMe()
    } catch {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }
  }

  if (!authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  const permissionKey = to.matched
    .map((matchedRoute) => matchedRoute.meta.permissionKey)
    .filter(Boolean)
    .at(-1)

  if (permissionKey && !canAccessAnyRoute(authStore.roles, permissionKey)) {
    return { name: 'dashboard' }
  }

  const restrictedResourceRoute = to.matched
    .map((matchedRoute) => ({
      action: matchedRoute.meta.resourceAction,
      resource: matchedRoute.meta.resource,
    }))
    .filter((meta) => meta.action && meta.resource)
    .at(-1)

  if (
    restrictedResourceRoute &&
    !canUseResourceWithAnyRole(
      authStore.roles,
      restrictedResourceRoute.action,
      restrictedResourceRoute.resource,
    )
  ) {
    return { name: 'dashboard' }
  }

  return true
})

export default router

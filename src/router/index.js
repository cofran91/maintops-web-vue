import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import AnalyticsView from '@/modules/analytics/views/AnalyticsView.vue'
import AuditsListView from '@/modules/audits/views/AuditsListView.vue'
import MaintenanceOrderDetailView from '@/modules/maintenance-orders/views/MaintenanceOrderDetailView.vue'
import MaintenanceOrderFormView from '@/modules/maintenance-orders/views/MaintenanceOrderFormView.vue'
import MaintenanceOrdersListView from '@/modules/maintenance-orders/views/MaintenanceOrdersListView.vue'
import MaintenancePlanDetailView from '@/modules/maintenance-plans/views/MaintenancePlanDetailView.vue'
import MaintenancePlanFormView from '@/modules/maintenance-plans/views/MaintenancePlanFormView.vue'
import MaintenancePlansListView from '@/modules/maintenance-plans/views/MaintenancePlansListView.vue'
import MaintenanceTaskDetailView from '@/modules/maintenance-tasks/views/MaintenanceTaskDetailView.vue'
import MaintenanceTaskFormView from '@/modules/maintenance-tasks/views/MaintenanceTaskFormView.vue'
import MaintenanceTasksListView from '@/modules/maintenance-tasks/views/MaintenanceTasksListView.vue'
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
import VehicleDetailView from '@/modules/vehicles/views/VehicleDetailView.vue'
import VehicleFormView from '@/modules/vehicles/views/VehicleFormView.vue'
import VehiclesListView from '@/modules/vehicles/views/VehiclesListView.vue'
import WorkshopDetailView from '@/modules/workshops/views/WorkshopDetailView.vue'
import WorkshopFormView from '@/modules/workshops/views/WorkshopFormView.vue'
import WorkshopsListView from '@/modules/workshops/views/WorkshopsListView.vue'
import { useAuthStore } from '@/stores/auth.js'

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
  {
    meta: {
      title: 'Workshops',
      section: 'Operations',
      subtitle: 'Organize service locations and workshop administration.',
      permissionKey: ROUTE_KEYS.WORKSHOPS,
      resource: RESOURCES.WORKSHOPS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/workshops',
    name: 'operations-workshops',
    component: WorkshopsListView,
  },
  {
    meta: {
      title: 'Create workshop',
      section: 'Operations',
      subtitle: 'Create a service location with manager, systems, technicians, and schedule.',
      permissionKey: ROUTE_KEYS.WORKSHOPS,
      resource: RESOURCES.WORKSHOPS,
      resourceAction: RESOURCE_ACTIONS.CREATE,
    },
    path: '/operations/workshops/new',
    name: 'operations-workshops-new',
    component: WorkshopFormView,
  },
  {
    meta: {
      title: 'Workshop detail',
      section: 'Operations',
      subtitle: 'Review manager, systems, technicians, contact data, and schedule.',
      permissionKey: ROUTE_KEYS.WORKSHOPS,
      resource: RESOURCES.WORKSHOPS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/workshops/:id',
    name: 'operations-workshops-detail',
    component: WorkshopDetailView,
  },
  {
    meta: {
      title: 'Edit workshop',
      section: 'Operations',
      subtitle: 'Update manager, systems, technicians, contact data, and schedule.',
      permissionKey: ROUTE_KEYS.WORKSHOPS,
      resource: RESOURCES.WORKSHOPS,
      resourceAction: RESOURCE_ACTIONS.UPDATE,
    },
    path: '/operations/workshops/:id/edit',
    name: 'operations-workshops-edit',
    component: WorkshopFormView,
  },
  {
    meta: {
      title: 'Vehicles',
      section: 'Operations',
      subtitle: 'Track fleet and owner vehicles prepared for maintenance workflows.',
      permissionKey: ROUTE_KEYS.VEHICLES,
      resource: RESOURCES.VEHICLES,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/vehicles',
    name: 'operations-vehicles',
    component: VehiclesListView,
  },
  {
    meta: {
      title: 'Create vehicle',
      section: 'Operations',
      subtitle: 'Create a vehicle record attached to an active owner.',
      permissionKey: ROUTE_KEYS.VEHICLES,
      resource: RESOURCES.VEHICLES,
      resourceAction: RESOURCE_ACTIONS.CREATE,
    },
    path: '/operations/vehicles/new',
    name: 'operations-vehicles-new',
    component: VehicleFormView,
  },
  {
    meta: {
      title: 'Vehicle detail',
      section: 'Operations',
      subtitle: 'Review vehicle identity, owner contact data, and current mileage.',
      permissionKey: ROUTE_KEYS.VEHICLES,
      resource: RESOURCES.VEHICLES,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/operations/vehicles/:id',
    name: 'operations-vehicles-detail',
    component: VehicleDetailView,
  },
  {
    meta: {
      title: 'Edit vehicle',
      section: 'Operations',
      subtitle: 'Update owner assignment, vehicle identity data, and odometer.',
      permissionKey: ROUTE_KEYS.VEHICLES,
      resource: RESOURCES.VEHICLES,
      resourceAction: RESOURCE_ACTIONS.UPDATE,
    },
    path: '/operations/vehicles/:id/edit',
    name: 'operations-vehicles-edit',
    component: VehicleFormView,
  },
  {
    meta: {
      title: 'Maintenance tasks',
      section: 'Maintenance',
      subtitle: 'Standardize reusable and vehicle-specific service tasks.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS,
      resource: RESOURCES.MAINTENANCE_TASKS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/maintenance/tasks',
    name: 'maintenance-tasks',
    component: MaintenanceTasksListView,
  },
  {
    meta: {
      title: 'Create maintenance task',
      section: 'Maintenance',
      subtitle: 'Create a task definition for reusable or vehicle-specific work.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS,
      resource: RESOURCES.MAINTENANCE_TASKS,
      resourceAction: RESOURCE_ACTIONS.CREATE,
    },
    path: '/maintenance/tasks/new',
    name: 'maintenance-tasks-new',
    component: MaintenanceTaskFormView,
  },
  {
    meta: {
      title: 'Maintenance task detail',
      section: 'Maintenance',
      subtitle: 'Review task definition, status, scope, and vehicle context.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS,
      resource: RESOURCES.MAINTENANCE_TASKS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/maintenance/tasks/:id',
    name: 'maintenance-tasks-detail',
    component: MaintenanceTaskDetailView,
  },
  {
    meta: {
      title: 'Edit maintenance task',
      section: 'Maintenance',
      subtitle: 'Update task definition, reusable scope, vehicle assignment, and estimates.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS,
      resource: RESOURCES.MAINTENANCE_TASKS,
      resourceAction: RESOURCE_ACTIONS.UPDATE,
    },
    path: '/maintenance/tasks/:id/edit',
    name: 'maintenance-tasks-edit',
    component: MaintenanceTaskFormView,
  },
  {
    meta: {
      title: 'Maintenance plans',
      section: 'Maintenance',
      subtitle: 'Group maintenance tasks into reusable operational plans.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS,
      resource: RESOURCES.MAINTENANCE_PLANS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/maintenance/plans',
    name: 'maintenance-plans',
    component: MaintenancePlansListView,
  },
  {
    meta: {
      title: 'Create maintenance plan',
      section: 'Maintenance',
      subtitle: 'Create a reusable plan from existing maintenance tasks.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS,
      resource: RESOURCES.MAINTENANCE_PLANS,
      resourceAction: RESOURCE_ACTIONS.CREATE,
    },
    path: '/maintenance/plans/new',
    name: 'maintenance-plans-new',
    component: MaintenancePlanFormView,
  },
  {
    meta: {
      title: 'Maintenance plan detail',
      section: 'Maintenance',
      subtitle: 'Review grouped tasks, recommended intervals, and availability.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS,
      resource: RESOURCES.MAINTENANCE_PLANS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/maintenance/plans/:id',
    name: 'maintenance-plans-detail',
    component: MaintenancePlanDetailView,
  },
  {
    meta: {
      title: 'Edit maintenance plan',
      section: 'Maintenance',
      subtitle: 'Update grouped tasks, recommended intervals, and availability.',
      permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS,
      resource: RESOURCES.MAINTENANCE_PLANS,
      resourceAction: RESOURCE_ACTIONS.UPDATE,
    },
    path: '/maintenance/plans/:id/edit',
    name: 'maintenance-plans-edit',
    component: MaintenancePlanFormView,
  },
  {
    meta: {
      title: 'Orders',
      section: 'Orders',
      subtitle: 'Coordinate visible maintenance orders and role-safe status actions.',
      permissionKey: ROUTE_KEYS.ORDERS,
      resource: RESOURCES.ORDERS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/orders',
    name: 'orders',
    component: MaintenanceOrdersListView,
  },
  {
    meta: {
      title: 'Create order',
      section: 'Orders',
      subtitle: 'Capture vehicle and advisor context accepted by the public order endpoint.',
      permissionKey: ROUTE_KEYS.ORDER_CREATE,
      resource: RESOURCES.ORDERS,
      resourceAction: RESOURCE_ACTIONS.CREATE,
    },
    path: '/orders/new',
    name: 'orders-new',
    component: MaintenanceOrderFormView,
  },
  {
    meta: {
      title: 'Order detail',
      section: 'Orders',
      subtitle: 'Review assignments, status history, and task-level execution.',
      permissionKey: ROUTE_KEYS.ORDER_DETAIL,
      resource: RESOURCES.ORDERS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/orders/:id(\\d+)',
    name: 'orders-detail',
    component: MaintenanceOrderDetailView,
  },
  {
    meta: {
      title: 'Audit log',
      section: 'Access',
      subtitle: 'Review traceable operational events.',
      permissionKey: ROUTE_KEYS.AUDIT_LOG,
      resource: RESOURCES.AUDIT_LOG,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/access/audit',
    name: 'access-audit',
    component: AuditsListView,
  },
  {
    meta: {
      title: 'Analytics',
      section: 'Analytics',
      subtitle: 'Review observed metrics, workload forecasts, risks, and recommendations.',
      permissionKey: ROUTE_KEYS.ANALYTICS,
      resource: RESOURCES.ANALYTICS,
      resourceAction: RESOURCE_ACTIONS.VIEW,
    },
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView,
  },
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

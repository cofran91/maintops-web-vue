import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        guestOnly: true,
        title: 'Iniciar sesión',
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Dashboard',
      },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/MaintenanceOrdersView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Órdenes de mantenimiento',
      },
    },
    {
      path: '/maintenance-plans',
      name: 'maintenance-plans',
      component: () => import('@/views/MaintenancePlansView.vue'),
      meta: { requiresAuth: true, title: 'Planes de mantenimiento' },
    },
    {
      path: '/maintenance-plans/new',
      name: 'maintenance-plans-new',
      component: () => import('@/views/MaintenancePlanFormView.vue'),
      meta: { requiresAuth: true, title: 'Nuevo plan' },
    },
    {
      path: '/maintenance-plans/:id(\\d+)',
      name: 'maintenance-plans-detail',
      component: () => import('@/views/MaintenancePlanDetailView.vue'),
      meta: { requiresAuth: true, title: 'Detalle de plan' },
    },
    {
      path: '/maintenance-plans/:id(\\d+)/edit',
      name: 'maintenance-plans-edit',
      component: () => import('@/views/MaintenancePlanFormView.vue'),
      meta: { requiresAuth: true, title: 'Editar plan' },
    },
    {
      path: '/vehicles',
      name: 'vehicles',
      component: () => import('@/views/VehiclesView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Vehículos',
      },
    },
    {
      path: '/owners',
      name: 'owners',
      component: () => import('@/views/OwnersView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Propietarios',
      },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Usuarios',
      },
    },
    {
      path: '/users/new',
      name: 'users-new',
      component: () => import('@/views/UserFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Nuevo usuario',
      },
    },
    {
      path: '/users/:id(\\d+)',
      name: 'users-detail',
      component: () => import('@/views/UserDetailView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Detalle de usuario',
      },
    },
    {
      path: '/users/:id(\\d+)/edit',
      name: 'users-edit',
      component: () => import('@/views/UserFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Editar usuario',
      },
    },
    {
      path: '/workshops',
      name: 'workshops',
      component: () => import('@/views/WorkshopsView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Talleres',
      },
    },
    {
      path: '/workshops/new',
      name: 'workshops-new',
      component: () => import('@/views/WorkshopFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Nuevo taller',
      },
    },
    {
      path: '/workshops/:id(\\d+)',
      name: 'workshops-detail',
      component: () => import('@/views/WorkshopDetailView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Detalle de taller',
      },
    },
    {
      path: '/workshops/:id(\\d+)/edit',
      name: 'workshops-edit',
      component: () => import('@/views/WorkshopFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Editar taller',
      },
    },
    {
      path: '/owners/new',
      name: 'owners-new',
      component: () => import('@/views/OwnerFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Nuevo propietario',
      },
    },
    {
      path: '/owners/:id(\\d+)',
      name: 'owners-detail',
      component: () => import('@/views/OwnerDetailView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Detalle de propietario',
      },
    },
    {
      path: '/owners/:id(\\d+)/edit',
      name: 'owners-edit',
      component: () => import('@/views/OwnerFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Editar propietario',
      },
    },
    {
      path: '/vehicles/new',
      name: 'vehicles-new',
      component: () => import('@/views/VehicleFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Nuevo vehículo',
      },
    },
    {
      path: '/vehicles/:id(\\d+)',
      name: 'vehicles-detail',
      component: () => import('@/views/VehicleDetailView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Detalle de vehículo',
      },
    },
    {
      path: '/vehicles/:id(\\d+)/edit',
      name: 'vehicles-edit',
      component: () => import('@/views/VehicleFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Editar vehículo',
      },
    },
    {
      path: '/orders/new',
      name: 'orders-new',
      component: () => import('@/views/MaintenanceOrderFormView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Nueva orden de mantenimiento',
      },
    },
    {
      path: '/orders/:id',
      name: 'orders-detail',
      component: () => import('@/views/MaintenanceOrderDetailView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Detalle de orden',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.initializeSession()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? 'MaintOps')} · MaintOps`
})

export default router

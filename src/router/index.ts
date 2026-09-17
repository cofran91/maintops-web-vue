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
      path: '/vehicles',
      name: 'vehicles',
      component: () => import('@/views/VehiclesView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Vehículos',
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

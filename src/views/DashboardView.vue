<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ActivityChart from '@/components/dashboard/ActivityChart.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import OrderStatusChart from '@/components/dashboard/OrderStatusChart.vue'
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable.vue'
import UpcomingServices from '@/components/dashboard/UpcomingServices.vue'
import { useDashboardOverview } from '@/modules/dashboard/composables/useDashboardOverview'
import type {
  DashboardUser,
  DashboardVehicle,
  DashboardWorkshop,
  DashboardStat,
  RecentOrder,
  StatusBreakdown,
  UpcomingTask,
  WeekActivity,
} from '@/types/dashboard'
import {
  mdiAlertOutline,
  mdiCalendarCheckOutline,
  mdiClipboardTextOutline,
  mdiFilterVariant,
  mdiPlus,
  mdiWrenchOutline,
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const { errorMessage, fetchSummary, loading, summary } = useDashboardOverview()

const chartPoints = [
  '1,27 17,25 32,18 48,21 63,12 79,15 99,5',
  '1,25 17,18 32,21 48,13 63,16 79,8 99,10',
  '1,17 17,20 32,14 48,18 63,10 79,13 99,7',
  '1,9 17,13 32,8 48,17 63,15 79,23 99,20',
]

const weekActivity: WeekActivity[] = [
  { day: 'Lun', planned: 78, completed: 61 },
  { day: 'Mar', planned: 62, completed: 48 },
  { day: 'Mié', planned: 86, completed: 69 },
  { day: 'Jue', planned: 72, completed: 58 },
  { day: 'Vie', planned: 94, completed: 75 },
  { day: 'Sáb', planned: 55, completed: 41 },
  { day: 'Dom', planned: 32, completed: 24 },
]

const todayLabel = computed(() => {
  const label = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const metricValue = (key: string) => Number(summary.value?.metrics[key] ?? 0)

const totalOrders = computed(() => {
  const reportedTotal = metricValue('total_orders')

  if (reportedTotal > 0) {
    return reportedTotal
  }

  return Object.values(summary.value?.orders_by_status ?? {}).reduce(
    (total, count) => total + Number(count),
    0,
  )
})

const stats = computed<DashboardStat[]>(() => [
  {
    label: 'Órdenes activas',
    value: String(metricValue('active_orders')),
    detail: `${summary.value?.activities.active ?? 0} actividades en curso`,
    change: 'Actual',
    icon: mdiWrenchOutline,
    tone: 'blue',
    points: chartPoints[0] ?? '',
  },
  {
    label: 'Programadas hoy',
    value: String(summary.value?.today_schedules.length ?? 0),
    detail: `${summary.value?.upcoming_schedules.length ?? 0} próximas a iniciar`,
    change: 'Hoy',
    icon: mdiCalendarCheckOutline,
    tone: 'teal',
    points: chartPoints[1] ?? '',
  },
  {
    label: 'Por aprobación',
    value: String(metricValue('awaiting_owner_approval')),
    detail: 'Requieren revisión',
    change: 'Atención',
    icon: mdiClipboardTextOutline,
    tone: 'amber',
    points: chartPoints[2] ?? '',
  },
  {
    label: 'Fuera de plazo',
    value: String(metricValue('overdue_activities')),
    detail: 'Seguimiento requerido',
    change: 'Revisar',
    icon: mdiAlertOutline,
    tone: 'red',
    points: chartPoints[3] ?? '',
  },
])

const rawStatusCount = (status: string) => Number(summary.value?.orders_by_status[status] ?? 0)

const statusBreakdown = computed<StatusBreakdown[]>(() => {
  const knownStatuses = [
    { label: 'En proceso', count: rawStatusCount('in_progress'), color: '#3158e7' },
    { label: 'Programadas', count: rawStatusCount('scheduled'), color: '#14a694' },
    { label: 'Finalizadas', count: rawStatusCount('completed'), color: '#8090ad' },
  ]
  const knownCount = knownStatuses.reduce((total, status) => total + status.count, 0)
  const pendingCount = Math.max(0, totalOrders.value - knownCount)
  const statuses = [...knownStatuses, { label: 'Por gestionar', count: pendingCount, color: '#f1a13c' }]

  let assignedPercentage = 0

  return statuses.map((status, index) => {
    const value =
      index === statuses.length - 1
        ? Math.max(0, 100 - assignedPercentage)
        : totalOrders.value > 0
          ? Math.round((status.count / totalOrders.value) * 100)
          : 0

    assignedPercentage += value

    return {
      ...status,
      value,
    }
  })
})

const scheduleOrders = computed(() => {
  const orders = [...(summary.value?.today_schedules ?? []), ...(summary.value?.upcoming_schedules ?? [])]
  const uniqueOrders = new Map<number, (typeof orders)[number]>()

  orders.forEach((order) => uniqueOrders.set(order.maintenance_order_id, order))

  return [...uniqueOrders.values()]
})

const vehicleLabel = (vehicle?: DashboardVehicle | null) =>
  vehicle ? [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Vehículo' : 'Vehículo'

const plateLabel = (vehicle?: DashboardVehicle | null) =>
  vehicle?.license_plate || 'Sin placa'

const workshopLabel = (workshop?: DashboardWorkshop | null) =>
  workshop?.name || workshop?.code || 'Taller pendiente'

const technicianLabel = (technician?: DashboardUser | null) =>
  technician?.name || 'Sin asignar'

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    created: 'Creada',
    pending_owner_approval: 'Por aprobar',
    approved: 'Aprobada',
    partially_approved: 'Parcialmente aprobada',
    scheduled: 'Programada',
    in_progress: 'En proceso',
    completed: 'Finalizada',
    rejected: 'Rechazada',
    canceled: 'Cancelada',
  }

  return labels[status] ?? 'Actualizada'
}

const statusKey = (status: string): RecentOrder['statusKey'] => {
  if (status === 'completed') {
    return 'done'
  }

  if (status === 'in_progress') {
    return 'progress'
  }

  if (status === 'scheduled') {
    return 'scheduled'
  }

  return 'pending'
}

const dateLabel = (value?: string | null) => {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

const timeLabel = (value?: string | null) => {
  if (!value) {
    return '--:--'
  }

  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const recentOrders = computed<RecentOrder[]>(() =>
  scheduleOrders.value.slice(0, 4).map((order) => ({
    orderId: order.maintenance_order_id,
    id: `OT-${String(order.maintenance_order_id).padStart(4, '0')}`,
    vehicle: vehicleLabel(order.vehicle),
    plate: plateLabel(order.vehicle),
    workshop: workshopLabel(order.workshop),
    technician: technicianLabel(order.technician),
    initials: technicianLabel(order.technician)
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    date: dateLabel(order.scheduled_at),
    status: statusLabel(order.status),
    statusKey: statusKey(order.status),
  })),
)

const upcomingTasks = computed<UpcomingTask[]>(() =>
  scheduleOrders.value.slice(0, 3).map((order, index) => ({
    time: timeLabel(order.scheduled_at),
    title: order.status === 'in_progress' ? 'Mantenimiento en curso' : 'Mantenimiento programado',
    vehicle: `${vehicleLabel(order.vehicle)} · ${plateLabel(order.vehicle)}`,
    location: workshopLabel(order.workshop),
    tone: (['blue', 'teal', 'amber'][index] ?? 'blue') as UpcomingTask['tone'],
  })),
)

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

onMounted(() => {
  void fetchSummary()
})

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}

const openOrders = () => {
  void router.push({ name: 'orders' })
}

const openOrder = (orderId: number) => {
  void router.push({ name: 'orders-detail', params: { id: orderId } })
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="dashboard-main">
      <div class="dashboard-content">
        <header class="page-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Buen día, {{ userName.split(' ')[0] }} <span>👋</span></h1>
            <p>Este es el estado general de tu operación de mantenimiento.</p>
          </div>
          <div class="page-actions">
            <v-btn class="filter-button" height="44" variant="outlined">
              <v-icon :icon="mdiFilterVariant" class="mr-2" size="19" />
              Filtrar
            </v-btn>
            <v-btn :to="{ name: 'orders-new' }" color="primary" height="44">
              <v-icon :icon="mdiPlus" class="mr-2" size="20" />
              Nueva orden
            </v-btn>
          </div>
        </header>

        <v-alert
          v-if="errorMessage"
          class="dashboard-alert"
          density="comfortable"
          type="error"
          variant="tonal"
        >
          <span>{{ errorMessage }}</span>
          <template #append>
            <v-btn :loading="loading" size="small" variant="text" @click="fetchSummary">
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <div v-if="loading && !summary" class="dashboard-state dashboard-state--loading">
          <v-progress-circular color="primary" indeterminate size="34" width="3" />
          <strong>Cargando el estado de la operación</strong>
          <span>Estamos preparando tus indicadores.</span>
        </div>

        <div v-else-if="!summary" class="dashboard-state">
          <v-icon :icon="mdiAlertOutline" color="error" size="32" />
          <strong>No fue posible cargar el dashboard</strong>
          <span>Verifica la conexión con MaintOps e inténtalo nuevamente.</span>
          <v-btn color="primary" :loading="loading" @click="fetchSummary">Reintentar</v-btn>
        </div>

        <template v-else>
          <section class="stats-grid" aria-label="Indicadores principales">
            <MetricCard v-for="stat in stats" :key="stat.label" :stat="stat" />
          </section>

          <section class="insight-grid">
            <ActivityChart :data="weekActivity" />
            <OrderStatusChart :statuses="statusBreakdown" :total="totalOrders" />
          </section>

          <section class="content-grid">
            <RecentOrdersTable
              :orders="recentOrders"
              @view-all="openOrders"
              @view-order="openOrder"
            />
            <UpcomingServices :tasks="upcomingTasks" />
          </section>
        </template>
      </div>
    </v-main>
  </div>
</template>

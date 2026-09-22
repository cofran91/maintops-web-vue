<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ActivityChart from '@/components/dashboard/ActivityChart.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import OrderStatusChart from '@/components/dashboard/OrderStatusChart.vue'
import { useDashboardOverview } from '@/modules/dashboard/composables/useDashboardOverview'
import type {
  DashboardUser,
  DashboardVehicle,
  DashboardWorkshop,
  DashboardStat,
  StatusBreakdown,
  WeekActivity,
} from '@/types/dashboard'
import {
  mdiAlertOutline,
  mdiAccountMultipleOutline,
  mdiCalendarCheckOutline,
  mdiCheckCircleOutline,
  mdiCalendarClockOutline,
  mdiPlus,
  mdiWrenchOutline,
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()
const mobileDrawer = ref(false)
const { errorMessage, fetchSummary, loading, summary } = useDashboardOverview()

const chartPoints = [
  '1,27 17,25 32,18 48,21 63,12 79,15 99,5',
  '1,25 17,18 32,21 48,13 63,16 79,8 99,10',
  '1,17 17,20 32,14 48,18 63,10 79,13 99,7',
  '1,9 17,13 32,8 48,17 63,15 79,23 99,20',
]

const weekActivity = computed<WeekActivity[]>(() => [
  { day: t('dashboard.weekdays.mon'), planned: 78, completed: 61 },
  { day: t('dashboard.weekdays.tue'), planned: 62, completed: 48 },
  { day: t('dashboard.weekdays.wed'), planned: 86, completed: 69 },
  { day: t('dashboard.weekdays.thu'), planned: 72, completed: 58 },
  { day: t('dashboard.weekdays.fri'), planned: 94, completed: 75 },
  { day: t('dashboard.weekdays.sat'), planned: 55, completed: 41 },
  { day: t('dashboard.weekdays.sun'), planned: 32, completed: 24 },
])

const todayLabel = computed(() => {
  const label = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-CO', {
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
    label: t('dashboard.metrics.open_orders'),
    value: String(metricValue('open_orders')),
    detail: t('dashboard.current'),
    change: t('dashboard.current'),
    icon: mdiWrenchOutline,
    tone: 'blue',
    points: chartPoints[0] ?? '',
  },
  {
    label: t('dashboard.metrics.awaiting_owner_approval'),
    value: String(metricValue('awaiting_owner_approval')),
    detail: t('dashboard.requireReview'),
    change: t('dashboard.attention'),
    icon: mdiAccountMultipleOutline,
    tone: 'amber',
    points: chartPoints[1] ?? '',
  },
  {
    label: t('dashboard.metrics.awaiting_scheduling'),
    value: String(metricValue('awaiting_scheduling')),
    detail: t('dashboard.startingSoon', { count: summary.value?.upcoming_schedules.length ?? 0 }),
    change: t('common.today'),
    icon: mdiCalendarClockOutline,
    tone: 'teal',
    points: chartPoints[2] ?? '',
  },
  {
    label: t('dashboard.metrics.active_orders'),
    value: String(metricValue('active_orders')),
    detail: t('dashboard.activitiesInProgress', { count: summary.value?.activities.active ?? 0 }),
    change: t('dashboard.current'),
    icon: mdiCalendarCheckOutline,
    tone: 'blue',
    points: chartPoints[3] ?? '',
  },
  {
    label: t('dashboard.metrics.completed_today'),
    value: String(metricValue('completed_today')),
    detail: t('dashboard.completed'),
    change: t('common.today'),
    icon: mdiCheckCircleOutline,
    tone: 'teal',
    points: chartPoints[0] ?? '',
  },
  {
    label: t('dashboard.metrics.overdue_activities'),
    value: String(metricValue('overdue_activities')),
    detail: t('dashboard.followUpRequired'),
    change: t('dashboard.review'),
    icon: mdiAlertOutline,
    tone: 'red',
    points: chartPoints[3] ?? '',
  },
])

const rawStatusCount = (status: string) => Number(summary.value?.orders_by_status[status] ?? 0)

const statusBreakdown = computed<StatusBreakdown[]>(() => {
  const knownStatuses = [
    { label: t('dashboard.statuses.in_progress'), count: rawStatusCount('in_progress'), color: '#3158e7' },
    { label: t('dashboard.statuses.scheduled'), count: rawStatusCount('scheduled'), color: '#14a694' },
    { label: t('dashboard.statuses.completed'), count: rawStatusCount('completed'), color: '#8090ad' },
  ]
  const knownCount = knownStatuses.reduce((total, status) => total + status.count, 0)
  const pendingCount = Math.max(0, totalOrders.value - knownCount)
  const statuses = [...knownStatuses, { label: t('dashboard.managed'), count: pendingCount, color: '#f1a13c' }]

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

const technicianLabel = (technician?: DashboardUser | null) =>
  technician?.name || t('dashboard.unassigned')

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    created: 'dashboard.statuses.created',
    pending_owner_approval: 'dashboard.statuses.pending_owner_approval',
    approved: 'dashboard.statuses.approved',
    partially_approved: 'dashboard.statuses.partially_approved',
    scheduled: 'dashboard.statuses.scheduled',
    in_progress: 'dashboard.statuses.in_progress',
    completed: 'dashboard.statuses.completed',
    rejected: 'dashboard.statuses.rejected',
    canceled: 'dashboard.statuses.canceled',
  }

  return labels[status] ? t(labels[status]) : t('dashboard.statuses.updated')
}

const dateLabel = (value?: string | null) => {
  if (!value) {
    return t('dashboard.withoutDate')
  }

  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-CO', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

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

const openOrder = (orderId: number) => {
  void router.push({ name: 'orders-detail', params: { id: orderId } })
}

const orderNumber = (id: unknown) => `#${String(id).padStart(5, '0')}`
const fullVehicleLabel = (vehicle?: DashboardVehicle | null) =>
  vehicle ? [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ') : '—'
const fullWorkshopLabel = (workshop?: DashboardWorkshop | null) =>
  workshop ? [workshop.code, workshop.name, workshop.city].filter(Boolean).join(' · ') : '—'

const roleContext = computed(() => summary.value?.role_context ?? {})
const roleContextType = computed(() => String(roleContext.value.type ?? ''))
const contextRows = (key: string): Record<string, any>[] => {
  const rows = roleContext.value[key]
  return Array.isArray(rows) ? rows as Record<string, any>[] : []
}
const numberLabel = (value: unknown) => new Intl.NumberFormat(locale.value).format(Number(value ?? 0))
const durationLabel = (minutes: unknown) => {
  const value = Number(minutes ?? 0)
  const hours = Math.floor(value / 60)
  const remainder = value % 60

  return hours > 0 ? `${hours} h ${remainder} min` : `${remainder} min`
}

</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      :show-search="false"
      @open-menu="mobileDrawer = true"
      @sign-out="signOut"
    />

    <v-main class="dashboard-main">
      <div class="dashboard-content">
        <header class="page-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>{{ t('dashboard.greeting', { name: userName.split(' ')[0] }) }} <span>👋</span></h1>
            <p>{{ t('dashboard.description') }}</p>
          </div>
          <div class="page-actions">
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
              {{ t('common.retry') }}
            </v-btn>
          </template>
        </v-alert>

        <div v-if="loading && !summary" class="dashboard-state dashboard-state--loading">
          <v-progress-circular color="primary" indeterminate size="34" width="3" />
          <strong>{{ t('dashboard.loadingTitle') }}</strong>
          <span>{{ t('dashboard.loadingDescription') }}</span>
        </div>

        <div v-else-if="!summary" class="dashboard-state">
          <v-icon :icon="mdiAlertOutline" color="error" size="32" />
          <strong>{{ t('dashboard.loadErrorTitle') }}</strong>
          <span>{{ t('dashboard.loadErrorDescription') }}</span>
          <v-btn color="primary" :loading="loading" @click="fetchSummary">{{ t('common.retry') }}</v-btn>
        </div>

        <template v-else>
          <section class="stats-grid" :aria-label="t('dashboard.mainIndicators')">
            <MetricCard v-for="stat in stats" :key="stat.label" :stat="stat" />
          </section>

          <section class="dashboard-table-section">
            <div class="dashboard-section-heading">
              <div>
                <h2>{{ t('dashboard.sections.todayOrdersTitle') }}</h2>
                <p>{{ t('dashboard.sections.todayOrdersDescription') }}</p>
              </div>
              <v-btn :to="{ name: 'orders' }" variant="text">{{ t('dashboard.actions.openOrders') }}</v-btn>
            </div>
            <v-card class="dashboard-operational-card dashboard-table-card" rounded="xl">
              <div class="dashboard-data-table-wrap">
                <table class="dashboard-data-table">
                  <thead><tr><th>{{ t('dashboard.columns.order') }}</th><th>{{ t('dashboard.columns.vehicle') }}</th><th>{{ t('dashboard.columns.workshop') }}</th><th>{{ t('dashboard.columns.technician') }}</th><th>{{ t('dashboard.columns.scheduled') }}</th><th>{{ t('dashboard.columns.status') }}</th><th /></tr></thead>
                  <tbody>
                    <tr v-for="row in summary.today_schedules" :key="`today-${row.maintenance_order_id}-${row.scheduled_at}`">
                      <td><button class="dashboard-order-link" type="button" @click="openOrder(row.maintenance_order_id)">{{ orderNumber(row.maintenance_order_id) }}</button></td>
                      <td>{{ fullVehicleLabel(row.vehicle) }}</td><td>{{ fullWorkshopLabel(row.workshop) }}</td><td>{{ technicianLabel(row.technician) }}</td>
                      <td>{{ dateLabel(row.scheduled_at) }}</td><td><span class="dashboard-status-pill">{{ statusLabel(row.status) }}</span></td>
                      <td><v-btn :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }" icon="mdi-eye-outline" size="small" variant="text" /></td>
                    </tr>
                    <tr v-if="summary.today_schedules.length === 0"><td class="dashboard-table-empty" colspan="7">{{ t('dashboard.empty.noOrdersScheduledTodayTitle') }}</td></tr>
                  </tbody>
                </table>
              </div>
            </v-card>
          </section>

          <section class="dashboard-table-section">
            <div class="dashboard-section-heading">
              <div>
                <h2>{{ t('dashboard.sections.upcomingOrdersTitle') }}</h2>
                <p>{{ t('dashboard.sections.upcomingOrdersDescription') }}</p>
              </div>
              <v-btn :to="{ name: 'orders' }" variant="text">{{ t('dashboard.actions.openOrders') }}</v-btn>
            </div>
            <v-card class="dashboard-operational-card dashboard-table-card" rounded="xl">
              <div class="dashboard-data-table-wrap">
                <table class="dashboard-data-table">
                  <thead><tr><th>{{ t('dashboard.columns.order') }}</th><th>{{ t('dashboard.columns.vehicle') }}</th><th>{{ t('dashboard.columns.workshop') }}</th><th>{{ t('dashboard.columns.technician') }}</th><th>{{ t('dashboard.columns.scheduled') }}</th><th>{{ t('dashboard.columns.status') }}</th><th /></tr></thead>
                  <tbody>
                    <tr v-for="row in summary.upcoming_schedules" :key="`upcoming-${row.maintenance_order_id}-${row.scheduled_at}`">
                      <td><button class="dashboard-order-link" type="button" @click="openOrder(row.maintenance_order_id)">{{ orderNumber(row.maintenance_order_id) }}</button></td>
                      <td>{{ fullVehicleLabel(row.vehicle) }}</td><td>{{ fullWorkshopLabel(row.workshop) }}</td><td>{{ technicianLabel(row.technician) }}</td>
                      <td>{{ dateLabel(row.scheduled_at) }}</td><td><span class="dashboard-status-pill">{{ statusLabel(row.status) }}</span></td>
                      <td><v-btn :to="{ name: 'orders-detail', params: { id: row.maintenance_order_id } }" icon="mdi-eye-outline" size="small" variant="text" /></td>
                    </tr>
                    <tr v-if="summary.upcoming_schedules.length === 0"><td class="dashboard-table-empty" colspan="7">{{ t('dashboard.empty.noUpcomingOrdersTitle') }}</td></tr>
                  </tbody>
                </table>
              </div>
            </v-card>
          </section>

          <section v-if="roleContextType === 'system_admin'" class="dashboard-table-section">
            <div class="dashboard-section-heading">
              <div>
                <h2>Órdenes por taller</h2>
                <p>Carga actual de órdenes abiertas por ubicación.</p>
              </div>
            </div>
            <v-card class="dashboard-operational-card dashboard-table-card" rounded="xl">
              <div class="dashboard-data-table-wrap">
                <table class="dashboard-data-table">
                  <thead><tr><th>Taller</th><th>Órdenes abiertas</th></tr></thead>
                  <tbody>
                    <tr v-for="row in contextRows('orders_by_workshop')" :key="row.workshop_id">
                      <td>{{ fullWorkshopLabel(row.workshop) }}</td>
                      <td>{{ numberLabel(row.open_orders_count) }}</td>
                    </tr>
                    <tr v-if="contextRows('orders_by_workshop').length === 0"><td class="dashboard-table-empty" colspan="2">Sin órdenes abiertas por taller.</td></tr>
                  </tbody>
                </table>
              </div>
            </v-card>
          </section>

          <section v-if="roleContextType === 'system_admin'" class="dashboard-table-section">
            <div class="dashboard-section-heading">
              <div>
                <h2>Carga de técnicos hoy</h2>
                <p>Tareas asignadas a cada técnico durante el día.</p>
              </div>
            </div>
            <v-card class="dashboard-operational-card dashboard-table-card" rounded="xl">
              <div class="dashboard-data-table-wrap">
                <table class="dashboard-data-table">
                  <thead><tr><th>Técnico</th><th>Tareas asignadas</th><th>Tiempo planificado</th></tr></thead>
                  <tbody>
                    <tr v-for="row in contextRows('technician_workload_today')" :key="row.technician_id">
                      <td>{{ technicianLabel(row.technician) }}</td>
                      <td>{{ numberLabel(row.assigned_items_count) }}</td>
                      <td>{{ durationLabel(row.planned_minutes) }}</td>
                    </tr>
                    <tr v-if="contextRows('technician_workload_today').length === 0"><td class="dashboard-table-empty" colspan="3">Sin tareas asignadas hoy.</td></tr>
                  </tbody>
                </table>
              </div>
            </v-card>
          </section>

          <section class="insight-grid">
            <ActivityChart :data="weekActivity" />
            <OrderStatusChart :statuses="statusBreakdown" />
          </section>
        </template>
      </div>
    </v-main>
  </div>
</template>

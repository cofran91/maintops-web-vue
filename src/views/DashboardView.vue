<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ActivityChart from '@/components/dashboard/ActivityChart.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import MaintenanceSchedulePanel from '@/components/dashboard/MaintenanceSchedulePanel.vue'
import TechnicianWorkloadPanel from '@/components/dashboard/TechnicianWorkloadPanel.vue'
import WorkshopOrdersPanel from '@/components/dashboard/WorkshopOrdersPanel.vue'
import { useDashboardOverview } from '@/modules/dashboard/composables/useDashboardOverview'
import type {
  DashboardStat,
  DashboardTechnicianWorkloadRow,
  DashboardWorkshopOrderRow,
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

const roleContext = computed(() => summary.value?.role_context ?? {})
const roleContextType = computed(() => String(roleContext.value.type ?? ''))
const workshopRows = computed(() => {
  const rows = roleContext.value.orders_by_workshop
  return (Array.isArray(rows) ? rows : []) as DashboardWorkshopOrderRow[]
})
const technicianWorkloadRows = computed(() => {
  const rows = roleContext.value.technician_workload_today
  return (Array.isArray(rows) ? rows : []) as DashboardTechnicianWorkloadRow[]
})

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


          <MaintenanceSchedulePanel />

          <section v-if="roleContextType === 'system_admin'" class="dashboard-operational-grid">
            <WorkshopOrdersPanel :rows="workshopRows" />
            <TechnicianWorkloadPanel :rows="technicianWorkloadRows" />
          </section>

          <ActivityChart :data="weekActivity" />
        </template>
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ActivityChart from '@/components/dashboard/ActivityChart.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import OrderStatusChart from '@/components/dashboard/OrderStatusChart.vue'
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable.vue'
import UpcomingServices from '@/components/dashboard/UpcomingServices.vue'
import type {
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

const stats: DashboardStat[] = [
  {
    label: 'Órdenes activas',
    value: '24',
    detail: 'vs. 21 el mes pasado',
    change: '+12%',
    icon: mdiWrenchOutline,
    tone: 'blue',
    points: '1,27 17,25 32,18 48,21 63,12 79,15 99,5',
  },
  {
    label: 'Programadas hoy',
    value: '18',
    detail: '4 próximas a iniciar',
    change: 'Hoy',
    icon: mdiCalendarCheckOutline,
    tone: 'teal',
    points: '1,25 17,18 32,21 48,13 63,16 79,8 99,10',
  },
  {
    label: 'Por aprobación',
    value: '7',
    detail: '2 requieren atención',
    change: 'Pendiente',
    icon: mdiClipboardTextOutline,
    tone: 'amber',
    points: '1,17 17,20 32,14 48,18 63,10 79,13 99,7',
  },
  {
    label: 'Fuera de plazo',
    value: '3',
    detail: '2 menos esta semana',
    change: '-2',
    icon: mdiAlertOutline,
    tone: 'red',
    points: '1,9 17,13 32,8 48,17 63,15 79,23 99,20',
  },
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

const statusBreakdown: StatusBreakdown[] = [
  { label: 'En proceso', value: 42, count: 24, color: '#3158e7' },
  { label: 'Programadas', value: 28, count: 16, color: '#14a694' },
  { label: 'Finalizadas', value: 21, count: 12, color: '#8090ad' },
  { label: 'En pausa', value: 9, count: 5, color: '#f1a13c' },
]

const recentOrders: RecentOrder[] = [
  {
    id: 'OT-1048',
    vehicle: 'Toyota Hilux',
    plate: 'KLM 482',
    workshop: 'Taller Norte',
    technician: 'Carlos M.',
    initials: 'CM',
    date: 'Hoy, 10:30',
    status: 'En proceso',
    statusKey: 'progress',
  },
  {
    id: 'OT-1047',
    vehicle: 'Renault Duster',
    plate: 'JRP 910',
    workshop: 'Taller Central',
    technician: 'Diana R.',
    initials: 'DR',
    date: 'Hoy, 09:15',
    status: 'Finalizada',
    statusKey: 'done',
  },
  {
    id: 'OT-1046',
    vehicle: 'Chevrolet NHR',
    plate: 'UXT 235',
    workshop: 'Taller Sur',
    technician: 'Andrés P.',
    initials: 'AP',
    date: 'Hoy, 08:40',
    status: 'Programada',
    statusKey: 'scheduled',
  },
  {
    id: 'OT-1045',
    vehicle: 'Mazda CX-30',
    plate: 'LNS 604',
    workshop: 'Taller Central',
    technician: 'Laura G.',
    initials: 'LG',
    date: 'Ayer, 16:20',
    status: 'Por aprobar',
    statusKey: 'pending',
  },
]

const upcomingTasks: UpcomingTask[] = [
  {
    time: '09:30',
    title: 'Cambio de aceite y filtros',
    vehicle: 'Chevrolet NHR · UXT 235',
    location: 'Taller Sur',
    tone: 'blue',
  },
  {
    time: '11:15',
    title: 'Revisión sistema de frenos',
    vehicle: 'Renault Duster · JRP 910',
    location: 'Taller Central',
    tone: 'teal',
  },
  {
    time: '14:00',
    title: 'Alineación y balanceo',
    vehicle: 'Toyota Hilux · KLM 482',
    location: 'Taller Norte',
    tone: 'amber',
  },
]

const todayLabel = computed(() => {
  const label = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
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
            <v-btn color="primary" height="44">
              <v-icon :icon="mdiPlus" class="mr-2" size="20" />
              Nueva orden
            </v-btn>
          </div>
        </header>

        <section class="stats-grid" aria-label="Indicadores principales">
          <MetricCard v-for="stat in stats" :key="stat.label" :stat="stat" />
        </section>

        <section class="insight-grid">
          <ActivityChart :data="weekActivity" />
          <OrderStatusChart :statuses="statusBreakdown" />
        </section>

        <section class="content-grid">
          <RecentOrdersTable :orders="recentOrders" />
          <UpcomingServices :tasks="upcomingTasks" />
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/dashboard.scss" lang="scss"></style>

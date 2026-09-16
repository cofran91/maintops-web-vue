<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import {
  mdiAccountGroupOutline,
  mdiAlertOutline,
  mdiArrowRight,
  mdiArrowUp,
  mdiBellOutline,
  mdiCalendarCheckOutline,
  mdiCalendarClockOutline,
  mdiCalendarMonthOutline,
  mdiCarMultiple,
  mdiChartBoxOutline,
  mdiCheckCircleOutline,
  mdiChevronDown,
  mdiChevronRight,
  mdiClipboardTextOutline,
  mdiClockOutline,
  mdiCogOutline,
  mdiDotsHorizontal,
  mdiFilterVariant,
  mdiGarageVariant,
  mdiHelpCircleOutline,
  mdiLogoutVariant,
  mdiMagnify,
  mdiMapMarkerOutline,
  mdiMenu,
  mdiPlus,
  mdiViewDashboardOutline,
  mdiWrenchCogOutline,
  mdiWrenchOutline,
} from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()
const { mdAndDown } = useDisplay()
const mobileDrawer = ref(false)

const navigation = [
  { label: 'Inicio', icon: mdiViewDashboardOutline, active: true },
  { label: 'Órdenes de mantenimiento', icon: mdiClipboardTextOutline, badge: '12' },
  { label: 'Vehículos', icon: mdiCarMultiple },
  { label: 'Planes de mantenimiento', icon: mdiCalendarClockOutline },
  { label: 'Talleres', icon: mdiGarageVariant },
  { label: 'Usuarios', icon: mdiAccountGroupOutline },
]

const analysisNavigation = [
  { label: 'Analítica', icon: mdiChartBoxOutline },
  { label: 'Reportes', icon: mdiCalendarMonthOutline },
]

const stats = [
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

const weekActivity = [
  { day: 'Lun', planned: 78, completed: 61 },
  { day: 'Mar', planned: 62, completed: 48 },
  { day: 'Mié', planned: 86, completed: 69 },
  { day: 'Jue', planned: 72, completed: 58 },
  { day: 'Vie', planned: 94, completed: 75 },
  { day: 'Sáb', planned: 55, completed: 41 },
  { day: 'Dom', planned: 32, completed: 24 },
]

const statusBreakdown = [
  { label: 'En proceso', value: 42, count: 24, color: '#3158e7' },
  { label: 'Programadas', value: 28, count: 16, color: '#14a694' },
  { label: 'Finalizadas', value: 21, count: 12, color: '#8090ad' },
  { label: 'En pausa', value: 9, count: 5, color: '#f1a13c' },
]

const recentOrders = [
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

const upcomingTasks = [
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

const updateDrawer = (value: boolean) => {
  if (mdAndDown.value) {
    mobileDrawer.value = value
  }
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="dashboard-shell">
    <v-navigation-drawer
      :model-value="mdAndDown ? mobileDrawer : true"
      :temporary="mdAndDown"
      class="sidebar"
      color="#111d35"
      width="270"
      @update:model-value="updateDrawer"
    >
      <div class="sidebar__content">
        <div class="sidebar-brand">
          <span class="sidebar-brand__mark">
            <v-icon :icon="mdiWrenchCogOutline" size="22" />
          </span>
          <span>Maint<strong>Ops</strong></span>
        </div>

        <div class="workspace-switcher">
          <span class="workspace-avatar">AT</span>
          <div><small>Organización</small><strong>Autofleet Transportes</strong></div>
          <v-icon :icon="mdiChevronDown" size="17" />
        </div>

        <nav class="sidebar-nav" aria-label="Navegación principal">
          <span class="nav-section-label">Operación</span>
          <button
            v-for="item in navigation"
            :key="item.label"
            :class="['nav-item', { 'nav-item--active': item.active }]"
            type="button"
            @click="mdAndDown && (mobileDrawer = false)"
          >
            <v-icon :icon="item.icon" size="20" />
            <span>{{ item.label }}</span>
            <small v-if="item.badge">{{ item.badge }}</small>
          </button>

          <span class="nav-section-label nav-section-label--spaced">Análisis</span>
          <button
            v-for="item in analysisNavigation"
            :key="item.label"
            class="nav-item"
            type="button"
          >
            <v-icon :icon="item.icon" size="20" />
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <div class="sidebar-help">
          <span><v-icon :icon="mdiHelpCircleOutline" size="21" /></span>
          <div><strong>¿Necesitas ayuda?</strong><small>Consulta el centro de soporte</small></div>
          <v-icon :icon="mdiChevronRight" size="18" />
        </div>

        <div class="sidebar-bottom">
          <button class="nav-item" type="button">
            <v-icon :icon="mdiCogOutline" size="20" />
            <span>Configuración</span>
          </button>
          <button class="nav-item" type="button" @click="signOut">
            <v-icon :icon="mdiLogoutVariant" size="20" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </v-navigation-drawer>

    <v-app-bar class="topbar" color="#ffffff" flat height="76">
      <v-btn
        v-if="mdAndDown"
        :icon="mdiMenu"
        aria-label="Abrir navegación"
        class="topbar-menu"
        variant="text"
        @click="mobileDrawer = true"
      />

      <div class="topbar-context">
        <small>MaintOps</small>
        <span>Panel de operación</span>
      </div>

      <v-spacer />

      <div class="topbar-search">
        <v-icon :icon="mdiMagnify" size="20" />
        <input aria-label="Buscar" placeholder="Buscar orden, vehículo o placa..." type="search" />
        <kbd>⌘ K</kbd>
      </div>

      <button class="notification-button" aria-label="Notificaciones" type="button">
        <v-icon :icon="mdiBellOutline" size="22" />
        <i />
      </button>

      <span class="topbar-divider" />

      <button class="profile-button" type="button">
          <span class="profile-avatar">{{ userInitials }}</span>
          <span class="profile-copy"><strong>{{ userName }}</strong><small>Administrador</small></span>
        <v-icon :icon="mdiChevronDown" size="17" />
      </button>
    </v-app-bar>

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
          <article v-for="stat in stats" :key="stat.label" class="metric-card">
            <div class="metric-card__top">
              <span :class="['metric-icon', `metric-icon--${stat.tone}`]">
                <v-icon :icon="stat.icon" size="21" />
              </span>
              <button aria-label="Más opciones" type="button">
                <v-icon :icon="mdiDotsHorizontal" size="20" />
              </button>
            </div>

            <div class="metric-card__value">
              <strong>{{ stat.value }}</strong>
              <span :class="[`metric-change--${stat.tone}`]">
                <v-icon v-if="stat.change.startsWith('+')" :icon="mdiArrowUp" size="12" />
                {{ stat.change }}
              </span>
            </div>
            <h2>{{ stat.label }}</h2>

            <div class="metric-card__bottom">
              <small>{{ stat.detail }}</small>
              <svg viewBox="0 0 100 32" preserveAspectRatio="none">
                <defs>
                  <linearGradient :id="`fill-${stat.tone}`" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="currentColor" stop-opacity=".2" />
                    <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  :fill="`url(#fill-${stat.tone})`"
                  :points="`1,32 ${stat.points} 99,32`"
                />
                <polyline :points="stat.points" fill="none" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
          </article>
        </section>

        <section class="insight-grid">
          <article class="dashboard-card activity-chart-card">
            <div class="card-heading">
              <div>
                <h2>Actividad de mantenimiento</h2>
                <p>Órdenes planificadas y completadas esta semana</p>
              </div>
              <button class="period-selector" type="button">
                Esta semana
                <v-icon :icon="mdiChevronDown" size="16" />
              </button>
            </div>

            <div class="chart-legend">
              <span><i class="legend-dot legend-dot--planned" /> Planificadas</span>
              <span><i class="legend-dot legend-dot--done" /> Completadas</span>
            </div>

            <div class="bar-chart">
              <div class="axis-labels">
                <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
              </div>
              <div class="bar-grid">
                <div v-for="day in weekActivity" :key="day.day" class="bar-column">
                  <div class="bar-pair">
                    <i class="bar bar--planned" :style="{ height: `${day.planned}%` }" />
                    <i class="bar bar--done" :style="{ height: `${day.completed}%` }" />
                  </div>
                  <span>{{ day.day }}</span>
                </div>
              </div>
            </div>
          </article>

          <article class="dashboard-card status-card">
            <div class="card-heading">
              <div>
                <h2>Estado de órdenes</h2>
                <p>Distribución actual</p>
              </div>
              <button aria-label="Más opciones" class="icon-action" type="button">
                <v-icon :icon="mdiDotsHorizontal" size="20" />
              </button>
            </div>

            <div class="donut-wrap">
              <div class="donut-chart">
                <div><strong>57</strong><span>Total</span></div>
              </div>
            </div>

            <div class="status-list">
              <div v-for="status in statusBreakdown" :key="status.label" class="status-item">
                <span class="status-name"><i :style="{ background: status.color }" />{{ status.label }}</span>
                <span><strong>{{ status.count }}</strong><small>{{ status.value }}%</small></span>
              </div>
            </div>
          </article>
        </section>

        <section class="content-grid">
          <article class="dashboard-card orders-card">
            <div class="card-heading card-heading--table">
              <div>
                <h2>Órdenes recientes</h2>
                <p>Últimas actualizaciones de la operación</p>
              </div>
              <button class="see-all" type="button">
                Ver todas <v-icon :icon="mdiArrowRight" size="17" />
              </button>
            </div>

            <div class="orders-table-wrap">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Vehículo</th>
                    <th>Taller</th>
                    <th>Técnico</th>
                    <th>Actualización</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td><button class="order-link" type="button">{{ order.id }}</button></td>
                    <td>
                      <div class="vehicle-cell">
                        <span><v-icon :icon="mdiCarMultiple" size="18" /></span>
                        <div><strong>{{ order.vehicle }}</strong><small>{{ order.plate }}</small></div>
                      </div>
                    </td>
                    <td>{{ order.workshop }}</td>
                    <td>
                      <div class="technician-cell">
                        <span>{{ order.initials }}</span>{{ order.technician }}
                      </div>
                    </td>
                    <td>{{ order.date }}</td>
                    <td>
                      <span :class="['order-status', `order-status--${order.statusKey}`]">
                        <i />{{ order.status }}
                      </span>
                    </td>
                    <td>
                      <button aria-label="Más opciones" class="row-action" type="button">
                        <v-icon :icon="mdiDotsHorizontal" size="19" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="dashboard-card schedule-card">
            <div class="card-heading">
              <div>
                <h2>Próximos servicios</h2>
                <p>Agenda de hoy</p>
              </div>
              <button class="calendar-button" aria-label="Abrir calendario" type="button">
                <v-icon :icon="mdiCalendarMonthOutline" size="20" />
              </button>
            </div>

            <div class="schedule-list">
              <div v-for="task in upcomingTasks" :key="task.time" class="schedule-item">
                <div class="schedule-time">
                  <strong>{{ task.time }}</strong>
                  <i :class="[`schedule-dot--${task.tone}`]" />
                </div>
                <div :class="['schedule-info', `schedule-info--${task.tone}`]">
                  <strong>{{ task.title }}</strong>
                  <span>{{ task.vehicle }}</span>
                  <small><v-icon :icon="mdiMapMarkerOutline" size="13" />{{ task.location }}</small>
                </div>
              </div>
            </div>

            <button class="schedule-footer" type="button">
              <v-icon :icon="mdiClockOutline" size="17" />
              Ver agenda completa
              <v-icon :icon="mdiChevronRight" size="17" />
            </button>
          </article>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style scoped>
.dashboard-shell {
  min-height: 100dvh;
  color: #17223c;
  background: #f4f7fb;
}

.sidebar {
  border-right: 0 !important;
}

.sidebar :deep(.v-navigation-drawer__content) {
  overflow: hidden;
}

.sidebar__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 26px 18px 18px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 8px 24px;
  color: #ffffff;
  font-size: 20px;
  font-weight: 760;
  letter-spacing: -0.7px;
}

.sidebar-brand strong {
  color: #7ca0ff;
}

.sidebar-brand__mark {
  display: grid;
  width: 38px;
  height: 38px;
  color: #ffffff;
  background: linear-gradient(145deg, #5378ef, #3158e7);
  border-radius: 11px;
  box-shadow: 0 9px 22px rgba(38, 71, 181, 0.3);
  place-items: center;
}

.workspace-switcher {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin-bottom: 23px;
  padding: 11px;
  color: #9dabc1;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
}

.workspace-avatar {
  display: grid;
  width: 32px;
  height: 32px;
  color: #c8d8ff;
  font-size: 10px;
  font-weight: 750;
  background: rgba(78, 118, 237, 0.2);
  border: 1px solid rgba(115, 150, 255, 0.18);
  border-radius: 9px;
  place-items: center;
}

.workspace-switcher div {
  display: grid;
  min-width: 0;
}

.workspace-switcher small {
  color: #6f7e98;
  font-size: 9px;
}

.workspace-switcher strong {
  overflow: hidden;
  color: #dce4f1;
  font-size: 11px;
  font-weight: 620;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section-label {
  padding: 0 12px 8px;
  color: #61718c;
  font-size: 9px;
  font-weight: 740;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.nav-section-label--spaced {
  padding-top: 17px;
}

.nav-item {
  display: grid;
  grid-template-columns: 23px 1fr auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 43px;
  padding: 0 12px;
  color: #8e9db5;
  font-size: 12.5px;
  font-weight: 560;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: 180ms ease;
}

.nav-item:hover {
  color: #d8e1f0;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item--active {
  position: relative;
  color: #ffffff;
  background: linear-gradient(90deg, rgba(61, 97, 215, 0.34), rgba(61, 97, 215, 0.16));
  box-shadow: inset 0 0 0 1px rgba(104, 138, 241, 0.11);
}

.nav-item--active::before {
  position: absolute;
  top: 9px;
  bottom: 9px;
  left: -18px;
  width: 3px;
  background: #6488f5;
  border-radius: 0 4px 4px 0;
  content: '';
}

.nav-item small {
  display: grid;
  min-width: 21px;
  height: 19px;
  padding: 0 6px;
  color: #bfd0ff;
  font-size: 9px;
  font-weight: 720;
  background: rgba(73, 112, 229, 0.27);
  border-radius: 8px;
  place-items: center;
}

.sidebar-help {
  display: grid;
  grid-template-columns: 31px 1fr auto;
  align-items: center;
  gap: 9px;
  margin: auto 2px 13px;
  padding: 12px;
  color: #8190a9;
  background: linear-gradient(145deg, rgba(55, 90, 191, 0.16), rgba(22, 44, 80, 0.12));
  border: 1px solid rgba(114, 143, 226, 0.11);
  border-radius: 12px;
}

.sidebar-help > span {
  display: grid;
  width: 31px;
  height: 31px;
  color: #8da9fb;
  background: rgba(73, 111, 224, 0.16);
  border-radius: 9px;
  place-items: center;
}

.sidebar-help div {
  display: grid;
}

.sidebar-help strong {
  color: #c5cfde;
  font-size: 10px;
}

.sidebar-help small {
  font-size: 8px;
}

.sidebar-bottom {
  padding-top: 9px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.topbar {
  color: #18243d !important;
  border-bottom: 1px solid #e7ebf2 !important;
  box-shadow: 0 2px 12px rgba(20, 34, 62, 0.025) !important;
}

.topbar :deep(.v-toolbar__content) {
  gap: 12px;
  padding: 0 clamp(20px, 2.6vw, 42px);
}

.topbar-menu {
  margin-left: -10px;
}

.topbar-context {
  display: grid;
  gap: 1px;
}

.topbar-context small {
  color: #9aa5b7;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.topbar-context span {
  font-size: 13px;
  font-weight: 680;
}

.topbar-search {
  display: grid;
  grid-template-columns: auto minmax(160px, 250px) auto;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 10px 0 13px;
  color: #8b97aa;
  background: #f6f8fb;
  border: 1px solid #e7ebf1;
  border-radius: 11px;
}

.topbar-search input {
  width: 100%;
  color: #26334d;
  font-size: 11.5px;
  background: transparent;
  border: 0;
  outline: none;
}

.topbar-search input::placeholder {
  color: #96a1b2;
}

.topbar-search kbd {
  min-width: 28px;
  padding: 3px 5px;
  color: #97a2b4;
  font-family: inherit;
  font-size: 8px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #dfe4eb;
  border-radius: 5px;
  box-shadow: 0 1px 1px rgba(21, 34, 60, 0.04);
}

.notification-button {
  position: relative;
  display: grid;
  width: 39px;
  height: 39px;
  color: #60708a;
  background: #ffffff;
  border: 1px solid #e5e9f0;
  border-radius: 11px;
  cursor: pointer;
  place-items: center;
}

.notification-button i {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 7px;
  height: 7px;
  background: #e95866;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.topbar-divider {
  width: 1px;
  height: 30px;
  margin: 0 2px;
  background: #e6eaf0;
}

.profile-button {
  display: grid;
  grid-template-columns: 36px auto auto;
  align-items: center;
  gap: 9px;
  padding: 0;
  color: #738099;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.profile-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 750;
  background: linear-gradient(145deg, #5275e9, #3158e7);
  border-radius: 10px;
  box-shadow: 0 6px 14px rgba(49, 88, 231, 0.19);
  place-items: center;
}

.profile-copy {
  display: grid;
  min-width: 104px;
  text-align: left;
}

.profile-copy strong {
  color: #26334b;
  font-size: 11px;
}

.profile-copy small {
  color: #8b96a8;
  font-size: 9px;
}

.dashboard-main {
  min-height: 100dvh;
  background: #f4f7fb;
}

.dashboard-content {
  width: 100%;
  max-width: 1640px;
  margin: 0 auto;
  padding: 33px clamp(20px, 2.7vw, 44px) 46px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 27px;
}

.page-date {
  display: block;
  margin-bottom: 6px;
  color: #3158e7;
  font-size: 10px;
  font-weight: 740;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0 0 6px;
  color: #17223c;
  font-size: clamp(25px, 2.2vw, 32px);
  font-weight: 750;
  letter-spacing: -1px;
  line-height: 1.2;
}

.page-header h1 span {
  display: inline-block;
  font-size: 24px;
  transform: rotate(-7deg);
}

.page-header p {
  margin: 0;
  color: #7b879b;
  font-size: 12.5px;
}

.page-actions {
  display: flex;
  gap: 10px;
}

.page-actions :deep(.v-btn) {
  padding: 0 17px;
  font-size: 12px;
  font-weight: 670;
}

.page-actions :deep(.v-btn.bg-primary) {
  box-shadow: 0 9px 20px rgba(49, 88, 231, 0.2) !important;
}

.filter-button {
  color: #5d6b83 !important;
  background: #ffffff !important;
  border-color: #dfe4ec !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 17px;
}

.metric-card,
.dashboard-card {
  background: #ffffff;
  border: 1px solid #e8ecf2;
  border-radius: 15px;
  box-shadow: 0 5px 16px rgba(27, 41, 70, 0.025);
}

.metric-card {
  min-width: 0;
  padding: 17px 18px 14px;
}

.metric-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 13px;
}

.metric-card__top button,
.icon-action,
.row-action {
  display: grid;
  padding: 3px;
  color: #9ca6b6;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
  place-items: center;
}

.metric-icon {
  display: grid;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  place-items: center;
}

.metric-icon--blue {
  color: #3158e7;
  background: #eaf0ff;
}

.metric-icon--teal {
  color: #149782;
  background: #e5f7f3;
}

.metric-icon--amber {
  color: #dc872d;
  background: #fff2e2;
}

.metric-icon--red {
  color: #dc5361;
  background: #ffeaed;
}

.metric-card__value {
  display: flex;
  align-items: center;
  gap: 9px;
}

.metric-card__value > strong {
  color: #17223c;
  font-size: 29px;
  font-weight: 760;
  letter-spacing: -1px;
  line-height: 1;
}

.metric-card__value > span {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  padding: 3px 6px;
  font-size: 8px;
  font-weight: 750;
  border-radius: 8px;
}

.metric-change--blue,
.metric-change--teal {
  color: #198b70;
  background: #e8f7f2;
}

.metric-change--amber {
  color: #c17726;
  background: #fff2e2;
}

.metric-change--red {
  color: #28846e;
  background: #e8f7f2;
}

.metric-card h2 {
  margin: 7px 0 12px;
  color: #53617a;
  font-size: 11px;
  font-weight: 620;
}

.metric-card__bottom {
  display: grid;
  grid-template-columns: 1fr 76px;
  align-items: end;
  min-width: 0;
}

.metric-card__bottom small {
  overflow: hidden;
  color: #98a2b3;
  font-size: 8.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card__bottom svg {
  width: 76px;
  height: 28px;
}

.metric-card:nth-child(1) svg {
  color: #3158e7;
}

.metric-card:nth-child(2) svg {
  color: #18a18c;
}

.metric-card:nth-child(3) svg {
  color: #e39a42;
}

.metric-card:nth-child(4) svg {
  color: #db6270;
}

.insight-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.65fr);
  gap: 17px;
  margin-bottom: 17px;
}

.dashboard-card {
  min-width: 0;
  padding: 20px;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-heading h2 {
  margin: 0 0 4px;
  color: #24314a;
  font-size: 13px;
  font-weight: 730;
}

.card-heading p {
  margin: 0;
  color: #929dae;
  font-size: 9.5px;
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 34px;
  padding: 0 10px;
  color: #61708a;
  font-size: 9.5px;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #e2e7ee;
  border-radius: 9px;
  cursor: pointer;
}

.chart-legend {
  display: flex;
  justify-content: flex-end;
  gap: 17px;
  margin-top: 6px;
  color: #7e8a9f;
  font-size: 8.5px;
}

.chart-legend span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}

.legend-dot--planned {
  background: #3158e7;
}

.legend-dot--done {
  background: #86a0ef;
}

.bar-chart {
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 7px;
  height: 223px;
  margin-top: 6px;
}

.axis-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0 22px;
  color: #a1aaba;
  font-size: 7.5px;
  text-align: right;
}

.bar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(30px, 1fr));
  gap: clamp(8px, 2vw, 24px);
  height: 100%;
  padding: 0 9px;
  background-image: repeating-linear-gradient(
    to bottom,
    #edf0f5 0,
    #edf0f5 1px,
    transparent 1px,
    transparent 49px
  );
}

.bar-column {
  display: grid;
  grid-template-rows: 1fr 20px;
  height: 100%;
  min-width: 0;
}

.bar-column > span {
  align-self: end;
  color: #8d98a9;
  font-size: 8px;
  text-align: center;
}

.bar-pair {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  height: 190px;
}

.bar {
  display: block;
  width: min(10px, 40%);
  min-height: 7px;
  border-radius: 4px 4px 2px 2px;
  transition: height 400ms ease;
}

.bar--planned {
  background: linear-gradient(to top, #3158e7, #5276ef);
}

.bar--done {
  background: #a8baf0;
}

.status-card {
  display: flex;
  flex-direction: column;
}

.donut-wrap {
  display: grid;
  flex: 1;
  padding: 15px 0 10px;
  place-items: center;
}

.donut-chart {
  display: grid;
  width: 130px;
  height: 130px;
  background: conic-gradient(#3158e7 0 42%, #14a694 42% 70%, #8090ad 70% 91%, #f1a13c 91% 100%);
  border-radius: 50%;
  box-shadow: 0 9px 25px rgba(41, 67, 129, 0.09);
  place-items: center;
}

.donut-chart::before {
  grid-area: 1 / 1;
  width: 84px;
  height: 84px;
  background: #ffffff;
  border-radius: 50%;
  content: '';
}

.donut-chart div {
  z-index: 1;
  display: grid;
  grid-area: 1 / 1;
  text-align: center;
}

.donut-chart strong {
  color: #1e2b45;
  font-size: 23px;
  letter-spacing: -0.7px;
  line-height: 1;
}

.donut-chart span {
  color: #929cad;
  font-size: 8px;
}

.status-list {
  display: grid;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  color: #66748b;
  font-size: 9px;
  border-top: 1px solid #f0f2f6;
}

.status-name,
.status-item > span:last-child {
  display: flex;
  align-items: center;
}

.status-name {
  gap: 7px;
}

.status-name i {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}

.status-item > span:last-child {
  gap: 7px;
}

.status-item strong {
  color: #33405a;
  font-size: 9.5px;
}

.status-item small {
  width: 24px;
  color: #a0a9b8;
  font-size: 8px;
  text-align: right;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.62fr) minmax(290px, 0.62fr);
  gap: 17px;
}

.orders-card {
  padding: 0;
  overflow: hidden;
}

.card-heading--table {
  padding: 19px 20px 16px;
}

.see-all {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 0;
  color: #3158e7;
  font-size: 9.5px;
  font-weight: 680;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.orders-table-wrap {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  white-space: nowrap;
}

.orders-table th {
  height: 36px;
  padding: 0 12px;
  color: #929cad;
  font-size: 8px;
  font-weight: 670;
  text-align: left;
  background: #f8f9fb;
  border-top: 1px solid #edf0f4;
  border-bottom: 1px solid #edf0f4;
}

.orders-table th:first-child,
.orders-table td:first-child {
  padding-left: 20px;
}

.orders-table th:last-child,
.orders-table td:last-child {
  padding-right: 16px;
}

.orders-table td {
  height: 58px;
  padding: 0 12px;
  color: #607089;
  font-size: 9px;
  border-bottom: 1px solid #eff1f5;
}

.orders-table tbody tr:last-child td {
  border-bottom: 0;
}

.orders-table tbody tr {
  transition: background 150ms ease;
}

.orders-table tbody tr:hover {
  background: #fafbfe;
}

.order-link {
  padding: 0;
  color: #3158e7;
  font-size: 9.5px;
  font-weight: 730;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.vehicle-cell,
.technician-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vehicle-cell > span {
  display: grid;
  width: 30px;
  height: 30px;
  color: #5872bd;
  background: #eef2fb;
  border-radius: 8px;
  place-items: center;
}

.vehicle-cell > div {
  display: grid;
}

.vehicle-cell strong {
  color: #34415a;
  font-size: 9px;
  font-weight: 650;
}

.vehicle-cell small {
  color: #99a2b1;
  font-size: 7.5px;
}

.technician-cell > span {
  display: grid;
  width: 25px;
  height: 25px;
  color: #5270c7;
  font-size: 7px;
  font-weight: 750;
  background: #edf1fb;
  border-radius: 8px;
  place-items: center;
}

.order-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  font-size: 7.5px;
  font-weight: 680;
  border-radius: 9px;
}

.order-status i {
  width: 5px;
  height: 5px;
  background: currentColor;
  border-radius: 50%;
}

.order-status--progress {
  color: #3158d8;
  background: #ebf0ff;
}

.order-status--done {
  color: #17896c;
  background: #e6f6f1;
}

.order-status--scheduled {
  color: #5c6d89;
  background: #eef1f5;
}

.order-status--pending {
  color: #c47a27;
  background: #fff2e2;
}

.schedule-card {
  display: flex;
  flex-direction: column;
}

.calendar-button {
  display: grid;
  width: 34px;
  height: 34px;
  color: #61718a;
  background: #f7f9fc;
  border: 1px solid #e6eaf0;
  border-radius: 9px;
  cursor: pointer;
  place-items: center;
}

.schedule-list {
  display: grid;
  gap: 2px;
  margin-top: 17px;
}

.schedule-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  min-height: 76px;
}

.schedule-time {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 5px;
}

.schedule-time::after {
  position: absolute;
  top: 29px;
  right: 3px;
  bottom: -3px;
  width: 1px;
  background: #e5e9f0;
  content: '';
}

.schedule-item:last-child .schedule-time::after {
  display: none;
}

.schedule-time strong {
  color: #44526b;
  font-size: 8.5px;
}

.schedule-time i {
  z-index: 1;
  width: 7px;
  height: 7px;
  margin-top: 8px;
  margin-right: 0;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px currentColor;
}

.schedule-dot--blue {
  color: #3158e7;
  background: #3158e7;
}

.schedule-dot--teal {
  color: #18a08a;
  background: #18a08a;
}

.schedule-dot--amber {
  color: #e09235;
  background: #e09235;
}

.schedule-info {
  display: grid;
  align-content: start;
  gap: 2px;
  margin-bottom: 10px;
  padding: 9px 10px;
  border-left: 2px solid;
  border-radius: 0 8px 8px 0;
}

.schedule-info--blue {
  background: #f3f6ff;
  border-color: #6483e6;
}

.schedule-info--teal {
  background: #f0faf7;
  border-color: #39aa98;
}

.schedule-info--amber {
  background: #fff8ef;
  border-color: #e4a258;
}

.schedule-info strong {
  overflow: hidden;
  color: #36445d;
  font-size: 8.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-info span,
.schedule-info small {
  overflow: hidden;
  color: #7e8a9e;
  font-size: 7.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-info small {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #9aa4b4;
}

.schedule-footer {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 38px;
  margin-top: auto;
  padding: 0 11px;
  color: #596984;
  font-size: 8.5px;
  font-weight: 630;
  text-align: left;
  background: #f7f9fc;
  border: 1px solid #e9ecf2;
  border-radius: 9px;
  cursor: pointer;
}

@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .schedule-card {
    min-height: 320px;
  }
}

@media (max-width: 960px) {
  .topbar-context,
  .topbar-divider {
    display: none;
  }

  .dashboard-content {
    padding-top: 25px;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }

  .status-card {
    display: grid;
    grid-template-columns: 1fr 150px 1fr;
    align-items: center;
    gap: 16px;
  }

  .status-card .card-heading {
    align-self: start;
  }
}

@media (max-width: 760px) {
  .topbar-search {
    display: none;
  }

  .profile-copy,
  .profile-button > .v-icon,
  .topbar-divider {
    display: none;
  }

  .profile-button {
    grid-template-columns: 36px;
  }

  .page-header {
    align-items: flex-start;
  }

  .page-header p {
    max-width: 290px;
  }

  .page-actions .filter-button {
    display: none;
  }

  .status-card {
    display: flex;
  }
}

@media (max-width: 620px) {
  .dashboard-content {
    padding-right: 14px;
    padding-left: 14px;
  }

  .page-header {
    display: grid;
  }

  .page-actions {
    width: 100%;
  }

  .page-actions :deep(.v-btn.bg-primary) {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 16px;
  }

  .bar-grid {
    gap: 5px;
    padding: 0 2px;
  }

  .bar-pair {
    gap: 2px;
  }

  .bar {
    width: 7px;
  }

  .chart-legend {
    justify-content: flex-start;
    margin-top: 15px;
  }

  .activity-chart-card,
  .status-card,
  .schedule-card {
    padding: 17px;
  }
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAlertCircleOutline,
  mdiArrowRight,
  mdiCalendarCheckOutline,
  mdiCalendarMonthOutline,
  mdiChartDonut,
  mdiCheckCircleOutline,
  mdiClipboardTextOutline,
  mdiGarageVariant,
  mdiRefresh,
  mdiTimerAlertOutline,
  mdiTrendingUp,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useOperationsInsights } from '@/modules/analytics/composables/useOperationsInsights'
import { useAuthStore } from '@/stores/auth'
import type { OperationsInsights } from '@/types/analytics'
import type { MaintenanceOrder } from '@/types/maintenanceOrder'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)

const {
  errorMessage,
  fetchInsights,
  insights,
  isReady,
  lastUpdated,
  loading,
} = useOperationsInsights()

const currentInsights = computed<OperationsInsights>(() => insights.value ?? {
  totalOrders: 0,
  activeOrders: 0,
  scheduledToday: 0,
  awaitingApproval: 0,
  overdueActivities: 0,
  completionRate: 0,
  statusRows: [],
  workshopRows: [],
  attentionOrders: [],
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

const todayLabel = computed(() => {
  const label = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const updatedLabel = computed(() => {
  if (!lastUpdated.value) return 'Sin actualización reciente'

  return `Actualizado ${new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdated.value)}`
})

const kpis = computed(() => [
  {
    label: 'Órdenes registradas',
    value: insights.value?.totalOrders ?? 0,
    detail: 'Volumen total de operación',
    icon: mdiClipboardTextOutline,
    tone: 'blue',
  },
  {
    label: 'Órdenes activas',
    value: insights.value?.activeOrders ?? 0,
    detail: 'Requieren seguimiento operativo',
    icon: mdiWrenchOutline,
    tone: 'teal',
  },
  {
    label: 'Programadas hoy',
    value: insights.value?.scheduledToday ?? 0,
    detail: 'Servicios en la agenda del día',
    icon: mdiCalendarCheckOutline,
    tone: 'amber',
  },
  {
    label: 'Tasa de finalización',
    value: `${insights.value?.completionRate ?? 0}%`,
    detail: 'Órdenes finalizadas o entregadas',
    icon: mdiTrendingUp,
    tone: 'green',
  },
])

const orderNumber = (order: MaintenanceOrder) => `OT-${String(order.id).padStart(5, '0')}`
const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    created: 'Creada',
    pending_owner_approval: 'Por aprobar',
    approved: 'Aprobada',
    partially_approved: 'Aprobada parcialmente',
    rejected: 'Rechazada',
    scheduled: 'Programada',
    in_progress: 'En proceso',
    completed: 'Finalizada',
    delivered: 'Entregada',
    cancelled: 'Cancelada',
  }

  return labels[status] || 'Actualizada'
}

const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    created: '#7c8ba6',
    pending_owner_approval: '#d58930',
    approved: '#397eea',
    rejected: '#dc5967',
    scheduled: '#14a694',
    in_progress: '#3158e7',
    completed: '#239878',
    delivered: '#6b7e9d',
    cancelled: '#b65362',
  }

  return colors[status] || '#7c8ba6'
}

const vehicleLabel = (order: MaintenanceOrder) =>
  [order.vehicle?.brand, order.vehicle?.model].filter(Boolean).join(' ') || `Vehículo ${order.vehicle_id}`

const workshopLabel = (order: MaintenanceOrder) => order.workshop?.name || 'Sin taller asignado'

const openOrders = () => void router.push({ name: 'orders' })
const openSchedule = () => void router.push({ name: 'maintenance-schedule' })
const openOrder = (orderId: number) => void router.push({ name: 'orders-detail', params: { id: orderId } })

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}

onMounted(() => {
  void fetchInsights()
})
</script>

<template>
  <div class="analytics-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Analítica operativa"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="analytics-main">
      <div class="analytics-content">
        <header class="analytics-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Analítica operativa</h1>
            <p>Entiende el desempeño de tu operación y detecta dónde actuar primero.</p>
          </div>
          <div class="analytics-header__actions">
            <span class="analytics-updated"><v-icon :icon="mdiRefresh" size="14" />{{ updatedLabel }}</span>
            <v-btn :loading="loading" color="primary" height="42" @click="fetchInsights">
              <v-icon :icon="mdiRefresh" class="mr-2" size="17" />Actualizar datos
            </v-btn>
          </div>
        </header>

        <v-alert v-if="errorMessage" class="analytics-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append><v-btn size="small" variant="text" @click="fetchInsights">Reintentar</v-btn></template>
        </v-alert>

        <div v-if="loading && !isReady" class="analytics-state analytics-state--loading">
          <v-progress-circular color="primary" indeterminate size="34" width="3" />
          <strong>Construyendo el análisis operativo</strong>
          <span>Estamos consolidando órdenes, estados y talleres.</span>
        </div>

        <div v-else-if="!isReady" class="analytics-state">
          <v-icon :icon="mdiAlertCircleOutline" color="error" size="32" />
          <strong>No fue posible cargar la analítica</strong>
          <span>Verifica la conexión con MaintOps e inténtalo nuevamente.</span>
          <v-btn color="primary" :loading="loading" @click="fetchInsights">Reintentar</v-btn>
        </div>

        <template v-else>
          <section class="analytics-kpi-grid" aria-label="Indicadores analíticos">
            <article v-for="kpi in kpis" :key="kpi.label" class="analytics-kpi-card">
              <span :class="['analytics-kpi-card__icon', `analytics-kpi-card__icon--${kpi.tone}`]"><v-icon :icon="kpi.icon" size="21" /></span>
              <div><strong>{{ kpi.value }}</strong><span>{{ kpi.label }}</span><small>{{ kpi.detail }}</small></div>
            </article>
          </section>

          <section class="analytics-overview-grid">
            <article class="analytics-card analytics-status-card">
              <div class="analytics-card__heading">
                <div><span class="analytics-card__eyebrow">Distribución</span><h2>Estado de las órdenes</h2><p>Cómo se reparte actualmente el volumen de trabajo.</p></div>
                <span class="analytics-card__heading-icon"><v-icon :icon="mdiChartDonut" size="20" /></span>
              </div>
              <div class="analytics-status-list">
                <div v-for="status in currentInsights.statusRows" :key="status.key" class="analytics-status-row">
                  <div class="analytics-status-row__label"><i :style="{ background: status.color }" /><span>{{ status.label }}</span><strong>{{ status.count }}</strong></div>
                  <div class="analytics-status-row__bar"><span :style="{ width: `${status.percentage}%`, background: status.color }" /></div>
                  <small>{{ status.percentage }}%</small>
                </div>
              </div>
              <div class="analytics-status-footer"><span><v-icon :icon="mdiTimerAlertOutline" size="16" />{{ currentInsights.overdueActivities }} actividades fuera de plazo</span><v-btn variant="text" @click="openOrders">Ver órdenes <v-icon :icon="mdiArrowRight" size="15" /></v-btn></div>
            </article>

            <article class="analytics-card analytics-performance-card">
              <div class="analytics-card__heading">
                <div><span class="analytics-card__eyebrow">Capacidad</span><h2>Desempeño por taller</h2><p>Distribución de las órdenes cargadas por centro.</p></div>
                <span class="analytics-card__heading-icon analytics-card__heading-icon--teal"><v-icon :icon="mdiGarageVariant" size="20" /></span>
              </div>
              <div v-if="currentInsights.workshopRows.length" class="analytics-performance-list">
                <div v-for="workshop in currentInsights.workshopRows" :key="workshop.id ?? workshop.name" class="analytics-performance-row">
                  <div class="analytics-performance-row__identity"><span class="analytics-workshop-avatar"><v-icon :icon="mdiGarageVariant" size="16" /></span><span><strong>{{ workshop.name }}</strong><small>{{ workshop.code }} · {{ workshop.total }} órdenes</small></span></div>
                  <div class="analytics-performance-row__stats"><span><strong>{{ workshop.active }}</strong> activas</span><span><strong>{{ workshop.completed }}</strong> finalizadas</span></div>
                </div>
              </div>
              <div v-else class="analytics-card-empty"><v-icon :icon="mdiGarageVariant" size="26" />No hay órdenes asociadas a talleres.</div>
              <div class="analytics-status-footer"><span><v-icon :icon="mdiCalendarMonthOutline" size="16" />Consulta la carga en la agenda</span><v-btn variant="text" @click="openSchedule">Abrir agenda <v-icon :icon="mdiArrowRight" size="15" /></v-btn></div>
            </article>
          </section>

          <section class="analytics-card analytics-attention-card">
            <div class="analytics-card__heading analytics-card__heading--inline">
              <div><span class="analytics-card__eyebrow analytics-card__eyebrow--amber">Seguimiento</span><h2>Órdenes que requieren atención</h2><p>Prioriza aprobaciones, rechazos y programaciones vencidas.</p></div>
              <v-btn variant="outlined" @click="openOrders">Ver todas las órdenes <v-icon :icon="mdiArrowRight" class="ml-2" size="15" /></v-btn>
            </div>
            <div v-if="currentInsights.attentionOrders.length" class="analytics-attention-grid">
              <button v-for="order in currentInsights.attentionOrders" :key="order.id" class="analytics-attention-item" type="button" @click="openOrder(order.id)">
                <span class="analytics-attention-item__icon"><v-icon :icon="order.status === 'rejected' ? mdiAlertCircleOutline : mdiClipboardTextOutline" size="18" /></span>
                <span class="analytics-attention-item__body"><strong>{{ orderNumber(order) }}</strong><span>{{ vehicleLabel(order) }} · {{ order.vehicle?.license_plate || 'Placa pendiente' }}</span><small><v-icon :icon="mdiGarageVariant" size="13" />{{ workshopLabel(order) }}</small></span>
                <v-chip label size="x-small" :color="statusColor(order.status)" variant="tonal">{{ statusLabel(order.status) }}</v-chip>
                <v-icon :icon="mdiArrowRight" class="analytics-attention-item__arrow" size="16" />
              </button>
            </div>
            <div v-else class="analytics-card-empty analytics-card-empty--wide"><v-icon :icon="mdiCheckCircleOutline" color="success" size="28" />No hay órdenes pendientes de seguimiento.</div>
          </section>
        </template>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/analytics.scss" lang="scss"></style>

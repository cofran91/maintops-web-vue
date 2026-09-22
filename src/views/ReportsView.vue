<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiAlertCircleOutline,
  mdiCalendarRange,
  mdiChartBoxOutline,
  mdiCheckCircleOutline,
  mdiChevronRight,
  mdiClipboardTextOutline,
  mdiDownloadOutline,
  mdiFileChartOutline,
  mdiFileDocumentOutline,
  mdiFilterVariant,
  mdiRefresh,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useReportBuilder } from '@/modules/analytics/composables/useReportBuilder'
import { useAuthStore } from '@/stores/auth'
import type { MaintenanceOrder } from '@/types/maintenanceOrder'

const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()
const mobileDrawer = ref(false)
const reportType = ref('operations')
const startDate = ref('')
const endDate = ref('')
const statusFilter = ref('')
const workshopFilter = ref('')
const previewReady = ref(false)
const snackbar = ref(false)

const {
  errorMessage,
  fetchOrders,
  loading,
  orders,
  workshopOptions,
} = useReportBuilder()

const reportTypes = [
  { value: 'operations', title: 'Resumen operativo', description: 'Estado, carga y seguimiento de órdenes', icon: mdiChartBoxOutline },
  { value: 'maintenance', title: 'Mantenimiento ejecutado', description: 'Servicios programados y finalizados', icon: mdiFileDocumentOutline },
  { value: 'fleet', title: 'Actividad de flota', description: 'Vehículos con actividad de mantenimiento', icon: mdiFileChartOutline },
]

const statusOptions = [
  { value: '', title: 'Todos los estados' },
  { value: 'created', title: 'Creada' },
  { value: 'pending_owner_approval', title: 'Por aprobar' },
  { value: 'approved', title: 'Aprobada' },
  { value: 'scheduled', title: 'Programada' },
  { value: 'in_progress', title: 'En proceso' },
  { value: 'completed', title: 'Finalizada' },
  { value: 'delivered', title: 'Entregada' },
  { value: 'cancelled', title: 'Cancelada' },
]

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
  const label = new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const filteredOrders = computed(() => orders.value.filter((order) => {
  const dateValue = order.scheduled_at || order.created_at
  const orderDate = dateValue ? new Date(dateValue).getTime() : 0
  const startsAfter = startDate.value ? orderDate >= new Date(`${startDate.value}T00:00:00`).getTime() : true
  const endsBefore = endDate.value ? orderDate <= new Date(`${endDate.value}T23:59:59`).getTime() : true
  const workshopValue = order.workshop?.id ? String(order.workshop.id) : 'unassigned'

  return startsAfter && endsBefore && (!statusFilter.value || order.status === statusFilter.value) && (!workshopFilter.value || workshopValue === workshopFilter.value)
}))

const reportMetrics = computed(() => {
  const selectedOrders = filteredOrders.value
  const completed = selectedOrders.filter((order) => ['completed', 'delivered'].includes(order.status)).length
  const active = selectedOrders.filter((order) => ['approved', 'scheduled', 'in_progress'].includes(order.status)).length
  const uniqueVehicles = new Set(selectedOrders.map((order) => order.vehicle_id)).size

  return [
    { label: 'Órdenes incluidas', value: selectedOrders.length, icon: mdiClipboardTextOutline, tone: 'blue' },
    { label: 'Servicios finalizados', value: completed, icon: mdiCheckCircleOutline, tone: 'green' },
    { label: 'En seguimiento', value: active, icon: mdiRefresh, tone: 'amber' },
    { label: 'Vehículos involucrados', value: uniqueVehicles, icon: mdiFileChartOutline, tone: 'teal' },
  ]
})

const selectedReport = computed(() => reportTypes.find((report) => report.value === reportType.value) || reportTypes[0]!)

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

const statusLabel = (status: string) => statusOptions.find((option) => option.value === status)?.title || 'Actualizada'
const vehicleLabel = (order: MaintenanceOrder) => order.vehicle?.license_plate || `Vehículo ${order.vehicle_id}`

const clearFilters = () => {
  startDate.value = ''
  endDate.value = ''
  statusFilter.value = ''
  workshopFilter.value = ''
  previewReady.value = false
}

const preparePreview = () => {
  previewReady.value = true
}

const requestExport = () => {
  previewReady.value = true
  snackbar.value = true
}

const openAnalytics = () => void router.push({ name: 'analytics' })
const openOrder = (orderId: number) => void router.push({ name: 'orders-detail', params: { id: orderId } })

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}

onMounted(() => {
  void fetchOrders()
})
</script>

<template>
  <div class="reports-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Reportes operativos"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="reports-main">
      <div class="reports-content">
        <header class="reports-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Reportes operativos</h1>
            <p>Configura una vista de información para compartir o revisar con tu equipo.</p>
          </div>
          <v-btn :loading="loading" class="reports-refresh" height="42" variant="outlined" @click="fetchOrders">
            <v-icon :icon="mdiRefresh" class="mr-2" size="17" />Actualizar fuente
          </v-btn>
        </header>

        <v-alert v-if="errorMessage" class="reports-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append><v-btn size="small" variant="text" @click="fetchOrders">Reintentar</v-btn></template>
        </v-alert>

        <section class="reports-layout">
          <aside class="reports-builder">
            <div class="reports-builder__heading"><span class="reports-section-icon"><v-icon :icon="mdiFileChartOutline" size="19" /></span><div><h2>Configurar reporte</h2><p>Define el alcance de la información.</p></div></div>

            <div class="reports-field-group">
              <span class="reports-field-label">Tipo de reporte</span>
              <button v-for="report in reportTypes" :key="report.value" :class="['report-type-option', { 'report-type-option--active': reportType === report.value }]" type="button" @click="reportType = report.value; previewReady = false">
                <span class="report-type-option__icon"><v-icon :icon="report.icon" size="18" /></span><span><strong>{{ report.title }}</strong><small>{{ report.description }}</small></span><v-icon v-if="reportType === report.value" :icon="mdiCheckCircleOutline" color="primary" size="17" />
              </button>
            </div>

            <div class="reports-field-group"><span class="reports-field-label">Periodo</span><div class="reports-date-grid"><v-text-field v-model="startDate" hide-details label="Desde" type="date" /><v-text-field v-model="endDate" hide-details label="Hasta" type="date" /></div></div>

            <div class="reports-field-group"><span class="reports-field-label">Segmentar por</span><v-select v-model="workshopFilter" clearable hide-details item-title="title" item-value="value" label="Taller" :items="workshopOptions" /><v-select v-model="statusFilter" clearable hide-details item-title="title" item-value="value" label="Estado" :items="statusOptions" /></div>

            <div class="reports-builder__actions"><v-btn color="primary" block height="43" @click="preparePreview"><v-icon :icon="mdiFilterVariant" class="mr-2" size="17" />Generar vista previa</v-btn><v-btn block variant="text" @click="clearFilters">Limpiar configuración</v-btn></div>
          </aside>

          <section class="reports-preview">
            <div class="reports-preview__heading"><div><span class="reports-card-eyebrow">Vista previa</span><h2>{{ selectedReport.title }}</h2><p>{{ selectedReport.description }} · {{ previewReady ? 'Filtros aplicados' : 'Selecciona los filtros para comenzar' }}</p></div><v-btn color="primary" :disabled="!previewReady" variant="tonal" @click="requestExport"><v-icon :icon="mdiDownloadOutline" class="mr-2" size="17" />Exportar reporte</v-btn></div>

            <div class="reports-metrics-grid"><article v-for="metric in reportMetrics" :key="metric.label" class="reports-metric"><span :class="['reports-metric__icon', `reports-metric__icon--${metric.tone}`]"><v-icon :icon="metric.icon" size="18" /></span><span><strong>{{ metric.value }}</strong><small>{{ metric.label }}</small></span></article></div>

            <div class="reports-result-card">
              <div class="reports-result-card__heading"><div><h3>Registros incluidos</h3><p>{{ filteredOrders.length }} órdenes disponibles para este reporte.</p></div><v-icon :icon="mdiCalendarRange" color="#8290aa" size="20" /></div>
              <div v-if="previewReady && filteredOrders.length" class="reports-result-list">
                <button v-for="order in filteredOrders.slice(0, 7)" :key="order.id" class="reports-result-row" type="button" @click="openOrder(order.id)"><span class="reports-result-row__icon"><v-icon :icon="mdiClipboardTextOutline" size="16" /></span><span><strong>OT-{{ String(order.id).padStart(5, '0') }}</strong><small>{{ vehicleLabel(order) }} · {{ formatDate(order.scheduled_at || order.created_at) }}</small></span><v-chip label size="x-small" variant="tonal">{{ statusLabel(order.status) }}</v-chip><v-icon :icon="mdiChevronRight" size="17" /></button>
                <p v-if="filteredOrders.length > 7" class="reports-result-more">Mostrando 7 de {{ filteredOrders.length }} registros. La exportación incluirá el resultado completo.</p>
              </div>
              <div v-else-if="previewReady" class="reports-empty"><v-icon :icon="mdiAlertCircleOutline" size="28" /><strong>No hay registros con esta configuración</strong><span>Ajusta el periodo o los filtros para obtener resultados.</span></div>
              <div v-else class="reports-empty reports-empty--initial"><v-icon :icon="mdiFileDocumentOutline" size="30" /><strong>Tu reporte aparecerá aquí</strong><span>Configura el alcance y genera una vista previa para revisar los datos.</span></div>
            </div>

            <div class="reports-info-banner"><v-icon :icon="mdiChartBoxOutline" size="18" /><span>Los reportes se basan en la información disponible en la fuente operativa actual. La exportación en PDF y Excel se habilitará con el servicio de reportes.</span></div>
          </section>
        </section>
      </div>
    </v-main>

    <v-snackbar v-model="snackbar" color="primary" timeout="3500">El reporte quedó preparado para exportación.</v-snackbar>
  </div>
</template>

<style src="@/styles/views/reports.scss" lang="scss"></style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiAlertCircleOutline, mdiArrowRight, mdiChartBoxOutline, mdiRefresh } from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters.vue'
import AnalyticsSummaryCards from '@/components/analytics/AnalyticsSummaryCards.vue'
import OperationalSignalsPanel from '@/components/analytics/OperationalSignalsPanel.vue'
import TechnicianEfficiencyPanel from '@/components/analytics/TechnicianEfficiencyPanel.vue'
import WorkshopBottlenecksPanel from '@/components/analytics/WorkshopBottlenecksPanel.vue'
import WorkloadForecastPanel from '@/components/analytics/WorkloadForecastPanel.vue'
import { useAnalyticsOverview } from '@/modules/analytics/composables/useAnalyticsOverview'
import { useAuthStore } from '@/stores/auth'
import type { AnalyticsEndpointResponse } from '@/types/analytics'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)

const {
  alerts,
  analyticsEnabled,
  canEditWorkshopFilter,
  errorMessage,
  fetchAnalytics,
  filters,
  forecasts,
  lastUpdated,
  loading,
  observedSample,
  overview,
  recommendations,
  resetFilters,
  technicianMetrics,
  workshopMetrics,
} = useAnalyticsOverview()

const fallbackResponse: AnalyticsEndpointResponse = { horizon_days: 0 }
const forecastResponse = computed(() => overview.value?.workloadForecast ?? fallbackResponse)
const isReady = computed(() => Boolean(overview.value))
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())
const updatedLabel = computed(() => lastUpdated.value
  ? 'Actualizado ' + new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(lastUpdated.value)
  : 'Sin actualización reciente')

const updateFilter = (key: keyof typeof filters, value: string | number) => {
  filters[key] = value as never
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="analytics-shell analytics-shell--advanced">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar :user-initials="userInitials" :user-name="userName" context="Analítica avanzada" @open-menu="mobileDrawer = true" />

    <v-main class="analytics-main">
      <div class="analytics-content analytics-content--advanced">
        <header class="analytics-advanced-header">
          <div>
            <span class="analytics-card-eyebrow">Centro de inteligencia operativa</span>
            <h1>Analítica avanzada</h1>
            <p>Convierte el comportamiento de tu operación en señales claras para decidir dónde actuar.</p>
          </div>
          <div class="analytics-advanced-header__actions">
            <span class="analytics-updated"><v-icon :icon="mdiRefresh" size="14" />{{ updatedLabel }}</span>
            <v-btn :loading="loading" color="primary" height="42" @click="fetchAnalytics"><v-icon :icon="mdiRefresh" class="mr-2" size="17" />Actualizar análisis</v-btn>
          </div>
        </header>

        <v-alert v-if="!analyticsEnabled" class="analytics-advanced-alert" type="warning" variant="tonal">
          El servicio de analítica no está configurado. Define <code>VITE_ANALYTICS_BASE_URL</code> para consultar pronósticos y señales.
        </v-alert>
        <v-alert v-if="errorMessage" class="analytics-advanced-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append><v-btn size="small" variant="text" @click="fetchAnalytics">Reintentar</v-btn></template>
        </v-alert>

        <AnalyticsFilters
          :can-edit-workshop-filter="canEditWorkshopFilter"
          :filters="filters"
          :loading="loading"
          @apply="fetchAnalytics"
          @reset="resetFilters"
          @update="updateFilter"
        />

        <div v-if="loading && !isReady" class="analytics-advanced-state">
          <v-progress-circular color="primary" indeterminate size="36" width="3" />
          <strong>Construyendo el análisis operativo</strong>
          <span>Consolidando datos observados, capacidad y pronósticos.</span>
        </div>

        <div v-else-if="!isReady" class="analytics-advanced-state analytics-advanced-state--empty">
          <v-icon :icon="mdiAlertCircleOutline" color="error" size="34" />
          <strong>No fue posible cargar la analítica</strong>
          <span>Verifica la conexión con el servicio y vuelve a intentarlo.</span>
          <v-btn color="primary" :loading="loading" @click="fetchAnalytics">Reintentar</v-btn>
        </div>

        <template v-else>
          <AnalyticsSummaryCards :alerts="alerts.length" :forecast="forecastResponse" :recommendations="recommendations.length" :sample="observedSample" />

          <section class="analytics-advanced-section-heading">
            <div><span class="analytics-card-eyebrow">Lectura operacional</span><h2>Desempeño observado</h2><p>Comparaciones del trabajo registrado durante el periodo seleccionado.</p></div>
            <v-chip label variant="tonal"><v-icon :icon="mdiChartBoxOutline" class="mr-1" size="16" />Datos de operación</v-chip>
          </section>
          <div class="analytics-analysis-grid">
            <TechnicianEfficiencyPanel :metrics="technicianMetrics" />
            <WorkshopBottlenecksPanel :metrics="workshopMetrics" />
          </div>

          <section class="analytics-advanced-section-heading">
            <div><span class="analytics-card-eyebrow">Planeación</span><h2>Capacidad futura</h2><p>Anticipa presión de demanda sin ejecutar cambios automáticos.</p></div>
            <v-btn variant="text" @click="router.push({ name: 'maintenance-schedule' })">Abrir agenda <v-icon :icon="mdiArrowRight" class="ml-1" size="16" /></v-btn>
          </section>
          <WorkloadForecastPanel :algorithm-version="forecastResponse.algorithm_version" :forecasts="forecasts" />

          <section class="analytics-advanced-section-heading">
            <div><span class="analytics-card-eyebrow">Seguimiento recomendado</span><h2>Riesgos y oportunidades</h2><p>Revisa los hallazgos antes de tomar decisiones en la operación.</p></div>
          </section>
          <OperationalSignalsPanel :alerts="alerts" :recommendations="recommendations" />
        </template>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/analytics-advanced.scss" lang="scss"></style>

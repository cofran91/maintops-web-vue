<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarClockOutline,
  mdiCalendarOutline,
  mdiClockOutline,
  mdiCogOutline,
  mdiDeleteOutline,
  mdiPencilOutline,
  mdiRefresh,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useMaintenancePlanDetail } from '@/modules/maintenance-plans/composables/useMaintenancePlanDetail'
import { useAuthStore } from '@/stores/auth'
import type { MaintenanceTask } from '@/types/maintenancePlan'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()
const mobileDrawer = ref(false)
const planId = computed(() => String(route.params.id ?? ''))

const {
  deleteDialogOpen,
  deletePlan,
  deleting,
  errorMessage,
  fetchPlan,
  loading,
  plan,
} = useMaintenancePlanDetail(planId)

const currentUserName = computed(() => authStore.user?.name || 'Juan Martínez')
const currentUserInitials = computed(() =>
  currentUserName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
const planTitle = computed(() => plan.value?.name || 'Detalle de plan')
const statusLabel = computed(() => (plan.value?.is_active ? 'Activo' : 'Inactivo'))
const statusColor = computed(() => (plan.value?.is_active ? '#239878' : '#7c8ba6'))
const intervalLabel = computed(() => {
  if (!plan.value) return 'Sin intervalo definido'
  const parts = []
  if (plan.value.recommended_interval_days) parts.push(`${plan.value.recommended_interval_days} días`)
  if (plan.value.recommended_interval_km) parts.push(`${plan.value.recommended_interval_km.toLocaleString(locale.value)} km`)
  return parts.join(' · ') || 'Sin intervalo definido'
})
const taskCount = computed(() => plan.value?.tasks_count ?? plan.value?.tasks?.length ?? 0)
const formatDuration = (minutes?: number | null) => {
  if (!minutes) return 'Sin duración'
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} min`
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`
}
const taskSystem = (task: MaintenanceTask) => task.vehicle_system?.name || 'Sistema general'
const formatDateTime = (value?: string | null) => {
  if (!value) return 'Sin registrar'
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const confirmDelete = async () => {
  const deleted = await deletePlan()
  if (deleted) await router.replace({ name: 'maintenance-plans' })
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="maintenance-plan-detail-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar :user-initials="currentUserInitials" :user-name="currentUserName" context="Detalle de plan" @open-menu="mobileDrawer = true" />

    <v-main class="maintenance-plan-detail-main">
      <div class="maintenance-plan-detail-content">
        <div class="maintenance-plan-breadcrumbs">
          <router-link :to="{ name: 'maintenance-plans' }">Planes de mantenimiento</router-link>
          <v-icon :icon="mdiArrowLeft" class="maintenance-plan-breadcrumbs__arrow" size="14" />
          <span>{{ planTitle }}</span>
        </div>

        <header class="maintenance-plan-detail-header">
          <div>
            <span class="page-date">Rutina preventiva</span>
            <h1>{{ planTitle }}</h1>
            <p>Consulta la frecuencia y las actividades que componen este plan.</p>
          </div>
          <div class="maintenance-plan-detail-header__actions">
            <v-btn class="maintenance-plan-detail-refresh" height="42" variant="outlined" :to="{ name: 'maintenance-plans' }">
              <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" /> Volver al listado
            </v-btn>
            <v-btn v-if="plan" color="primary" height="42" :to="{ name: 'maintenance-plans-edit', params: { id: plan.id } }">
              <v-icon :icon="mdiPencilOutline" class="mr-2" size="17" /> Editar plan
            </v-btn>
            <v-btn v-if="plan" color="error" height="42" variant="tonal" @click="deleteDialogOpen = true">
              <v-icon :icon="mdiDeleteOutline" class="mr-2" size="17" /> Eliminar
            </v-btn>
          </div>
        </header>

        <v-alert v-if="errorMessage" class="maintenance-plan-detail-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append><v-btn :loading="loading" size="small" variant="text" @click="fetchPlan"><v-icon :icon="mdiRefresh" class="mr-1" size="15" /> Reintentar</v-btn></template>
        </v-alert>

        <section v-if="loading" class="maintenance-plan-detail-loading"><v-skeleton-loader type="article, table-tbody" /></section>
        <section v-else-if="!plan" class="maintenance-plan-detail-empty">
          <v-icon :icon="mdiAlertOutline" color="error" size="34" />
          <strong>No fue posible encontrar este plan</strong>
          <span>Regresa al catálogo para seleccionar otra rutina preventiva.</span>
          <v-btn color="primary" :to="{ name: 'maintenance-plans' }">Ver planes</v-btn>
        </section>

        <template v-else>
          <section class="maintenance-plan-detail-hero">
            <div class="maintenance-plan-detail-hero__identity">
              <span class="maintenance-plan-detail-hero__icon"><v-icon :icon="mdiCalendarClockOutline" size="27" /></span>
              <div><span class="maintenance-plan-detail-overline">Plan preventivo</span><h2>{{ plan.name }}</h2><p>{{ plan.code }} · Plan #{{ plan.id }}</p></div>
            </div>
            <div class="maintenance-plan-detail-hero__stat"><span class="maintenance-plan-detail-overline">Frecuencia</span><strong>{{ intervalLabel }}</strong><span>Activación por kilometraje o tiempo</span></div>
            <div class="maintenance-plan-detail-hero__stat"><span class="maintenance-plan-detail-overline">Estado del plan</span><v-chip label size="small" :color="statusColor" variant="tonal">{{ statusLabel }}</v-chip><span>{{ taskCount }} actividades configuradas</span></div>
          </section>

          <section class="maintenance-plan-detail-grid">
            <article class="maintenance-plan-detail-card">
              <div class="maintenance-plan-detail-card__heading"><span class="maintenance-plan-detail-card__icon maintenance-plan-detail-card__icon--blue"><v-icon :icon="mdiCogOutline" size="18" /></span><div><h2>Configuración del plan</h2><p>Parámetros de activación preventiva</p></div></div>
              <dl class="maintenance-plan-definition-list">
                <div><dt>Código</dt><dd>{{ plan.code }}</dd></div>
                <div><dt>Intervalo</dt><dd>{{ intervalLabel }}</dd></div>
                <div><dt>Estado</dt><dd>{{ statusLabel }}</dd></div>
              </dl>
              <p class="maintenance-plan-description">{{ plan.description || 'Este plan no tiene una descripción adicional.' }}</p>
            </article>
            <article class="maintenance-plan-detail-card">
              <div class="maintenance-plan-detail-card__heading"><span class="maintenance-plan-detail-card__icon maintenance-plan-detail-card__icon--teal"><v-icon :icon="mdiWrenchOutline" size="18" /></span><div><h2>Resumen operativo</h2><p>Actividades incluidas en la rutina</p></div></div>
              <div class="maintenance-plan-detail-summary"><strong>{{ taskCount }}</strong><span>actividades de mantenimiento</span></div>
              <div class="maintenance-plan-detail-summary"><strong>{{ plan.recommended_interval_km ? `${plan.recommended_interval_km.toLocaleString(locale)} km` : '—' }}</strong><span>intervalo por kilometraje</span></div>
              <div class="maintenance-plan-detail-summary"><strong>{{ plan.recommended_interval_days ? `${plan.recommended_interval_days} días` : '—' }}</strong><span>intervalo por tiempo</span></div>
            </article>
          </section>

          <section class="maintenance-plan-tasks-card">
            <div class="maintenance-plan-tasks-card__heading"><div><h2>Actividades del plan</h2><p>Orden sugerido de ejecución para los técnicos.</p></div><v-icon :icon="mdiWrenchOutline" color="#8290aa" size="21" /></div>
            <div class="maintenance-plan-tasks-wrap">
              <table class="maintenance-plan-tasks-table">
                <thead><tr><th>#</th><th>Actividad</th><th>Sistema</th><th>Duración estimada</th></tr></thead>
                <tbody>
                  <tr v-for="(task, index) in plan.tasks || []" :key="task.id || task.code">
                    <td><span class="maintenance-plan-task-order">{{ index + 1 }}</span></td>
                    <td><strong>{{ task.name }}</strong><small>{{ task.code }}{{ task.description ? ` · ${task.description}` : '' }}</small></td>
                    <td><span class="maintenance-plan-muted">{{ taskSystem(task) }}</span></td>
                    <td><span class="maintenance-plan-muted">{{ formatDuration(task.estimated_duration_minutes) }}</span></td>
                  </tr>
                  <tr v-if="!plan.tasks?.length"><td class="maintenance-plan-tasks-empty" colspan="4">Este plan aún no tiene actividades configuradas.</td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section class="maintenance-plan-detail-meta"><span><v-icon :icon="mdiCalendarOutline" size="15" /> Creado {{ formatDateTime(plan.created_at) }}</span><span><v-icon :icon="mdiClockOutline" size="15" /> Última actualización {{ formatDateTime(plan.updated_at) }}</span></section>
        </template>
      </div>
    </v-main>

    <v-dialog v-model="deleteDialogOpen" max-width="430">
      <v-card class="maintenance-plan-delete-dialog"><v-card-title>¿Eliminar este plan?</v-card-title><v-card-text>{{ plan?.name }} y sus actividades dejarán de estar disponibles para nuevas órdenes. Esta acción no se puede deshacer desde la plataforma.</v-card-text><v-card-actions><v-spacer /><v-btn variant="text" :disabled="deleting" @click="deleteDialogOpen = false">Cancelar</v-btn><v-btn color="error" :loading="deleting" @click="confirmDelete">Eliminar plan</v-btn></v-card-actions></v-card>
    </v-dialog>
  </div>
</template>

<style src="@/styles/views/maintenance-plan-detail.scss" lang="scss"></style>

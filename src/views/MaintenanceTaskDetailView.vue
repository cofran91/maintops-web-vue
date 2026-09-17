<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarOutline,
  mdiCarMultiple,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiContentCopy,
  mdiPencilOutline,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useMaintenanceTaskDetail } from '@/modules/maintenance-tasks/composables/useMaintenanceTaskDetail'
import { MAINTENANCE_TASK_STATUS_LABELS } from '@/types/maintenanceTask'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const taskId = computed(() => String(route.params.id ?? ''))
const { deleteDialogOpen, deleteTask, deleting, errorMessage, fetchTask, loading, task } = useMaintenanceTaskDetail(taskId)

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())
const statusLabel = computed(() => task.value ? MAINTENANCE_TASK_STATUS_LABELS[task.value.status as keyof typeof MAINTENANCE_TASK_STATUS_LABELS] || 'Actualizada' : 'Sin estado')
const statusColor = computed(() => ({ created: '#7c8ba6', scheduled: '#397eea', started: '#d58930', completed: '#239878', rejected: '#dc5967', cancelled: '#b65362' }[task.value?.status || ''] || '#7c8ba6'))
const scopeLabel = computed(() => task.value?.vehicle ? 'Vehículo específico' : 'Tarea reutilizable')
const vehicleLabel = computed(() => task.value?.vehicle ? `${task.value.vehicle.license_plate} · ${[task.value.vehicle.brand, task.value.vehicle.model].filter(Boolean).join(' ')}` : 'Disponible para toda la flota')
const formatDateTime = (value?: string | null) => value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin registrar'
const formatDuration = (value?: number | null) => value === null || value === undefined ? 'Sin estimar' : `${new Intl.NumberFormat('es-CO').format(value)} minutos`

const confirmDelete = async () => {
  if (await deleteTask()) await router.replace({ name: 'maintenance-tasks' })
}
const signOut = async () => { await authStore.logout(); await router.push({ name: 'login' }) }
</script>

<template>
  <div class="tasks-shell task-detail-shell"><AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" /><AppTopbar :user-initials="userInitials" :user-name="userName" context="Detalle de tarea" @open-menu="mobileDrawer = true" /><v-main class="tasks-main"><div class="tasks-content task-detail-content"><div class="task-breadcrumbs"><router-link :to="{ name: 'maintenance-tasks' }">Catálogo de tareas</router-link><v-icon :icon="mdiArrowLeft" size="14" /><span>{{ task?.name || 'Detalle de tarea' }}</span></div><header class="task-detail-header"><div><span class="page-date">Biblioteca operativa</span><h1>{{ task?.name || 'Detalle de tarea' }}</h1><p>Consulta la configuración y el alcance de esta actividad de mantenimiento.</p></div><div class="task-detail-header__actions"><v-btn class="tasks-refresh" height="42" variant="outlined" :to="{ name: 'maintenance-tasks' }"><v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />Volver</v-btn><v-btn v-if="task" color="primary" height="42" :to="{ name: 'maintenance-tasks-edit', params: { id: task.id } }"><v-icon :icon="mdiPencilOutline" class="mr-2" size="17" />Editar</v-btn><v-btn v-if="task" color="error" height="42" variant="tonal" @click="deleteDialogOpen = true"><v-icon :icon="mdiTrashCanOutline" class="mr-2" size="17" />Eliminar</v-btn></div></header>
        <v-alert v-if="errorMessage" class="tasks-alert" type="error" variant="tonal"><span>{{ errorMessage }}</span><template #append><v-btn :loading="loading" size="small" variant="text" @click="fetchTask"><v-icon :icon="mdiRefresh" class="mr-1" size="15" />Reintentar</v-btn></template></v-alert><div v-if="loading" class="task-form-loading"><v-skeleton-loader type="article, table-tbody" /></div><div v-else-if="!task" class="task-detail-empty"><v-icon :icon="mdiAlertOutline" color="error" size="34" /><strong>No fue posible encontrar esta tarea</strong><span>Regresa al catálogo para seleccionar otra actividad.</span><v-btn color="primary" :to="{ name: 'maintenance-tasks' }">Ver catálogo</v-btn></div>
        <template v-else><section class="task-detail-hero"><div class="task-detail-hero__identity"><span class="task-detail-hero__icon"><v-icon :icon="mdiWrenchOutline" size="27" /></span><div><span class="task-detail-overline">Actividad del catálogo</span><h2>{{ task.name }}</h2><p>{{ task.code }} · {{ scopeLabel }}</p></div></div><div class="task-detail-hero__stat"><span class="task-detail-overline">Estado</span><v-chip label size="small" :color="statusColor" variant="tonal">{{ statusLabel }}</v-chip><span>{{ task.is_active ? 'Disponible para nuevos planes' : 'No disponible para nuevos planes' }}</span></div><div class="task-detail-hero__stat"><span class="task-detail-overline">Duración estimada</span><strong>{{ formatDuration(task.estimated_duration_minutes) }}</strong><span>Tiempo previsto de ejecución</span></div></section>
          <section class="task-detail-grid"><article class="task-detail-card"><div class="task-detail-card__heading"><span class="task-detail-card__icon task-detail-card__icon--blue"><v-icon :icon="mdiWrenchOutline" size="19" /></span><div><h2>Configuración de la tarea</h2><p>Datos utilizados al planificar el mantenimiento.</p></div></div><dl class="task-definition-list"><div><dt>Código interno</dt><dd><span>{{ task.code }}</span><v-icon :icon="mdiContentCopy" size="14" /></dd></div><div><dt>Nombre</dt><dd>{{ task.name }}</dd></div><div><dt>Sistema del vehículo</dt><dd>{{ task.vehicle_system?.name || `Sistema ${task.vehicle_system_id}` }}<small>{{ task.vehicle_system?.code || 'Código no disponible' }}</small></dd></div><div><dt>Duración estimada</dt><dd>{{ formatDuration(task.estimated_duration_minutes) }}</dd></div></dl></article><article class="task-detail-card"><div class="task-detail-card__heading"><span class="task-detail-card__icon task-detail-card__icon--teal"><v-icon :icon="mdiCarMultiple" size="19" /></span><div><h2>Alcance operativo</h2><p>Vehículos que pueden utilizar esta actividad.</p></div></div><div class="task-scope-detail"><span class="task-scope-detail__icon"><v-icon :icon="task.vehicle ? mdiCarMultiple : mdiCheckCircleOutline" size="21" /></span><strong>{{ scopeLabel }}</strong><p>{{ vehicleLabel }}</p><router-link v-if="task.vehicle" :to="{ name: 'vehicles-detail', params: { id: task.vehicle.id } }">Ver vehículo <v-icon :icon="mdiArrowLeft" size="14" /></router-link></div></article><article class="task-detail-card task-detail-card--wide"><div class="task-detail-card__heading"><span class="task-detail-card__icon task-detail-card__icon--amber"><v-icon :icon="mdiContentCopy" size="19" /></span><div><h2>Descripción operativa</h2><p>Indicaciones registradas para la ejecución.</p></div></div><p class="task-description">{{ task.description || 'Esta actividad todavía no tiene una descripción operativa registrada.' }}</p></article></section><section class="task-detail-meta"><span><v-icon :icon="mdiCalendarOutline" size="15" />Creada {{ formatDateTime(task.created_at) }}</span><span><v-icon :icon="mdiClockOutline" size="15" />Actualizada {{ formatDateTime(task.updated_at) }}</span><span><v-icon :icon="mdiCheckCircleOutline" size="15" />{{ task.is_active ? 'Disponible' : 'Inactiva' }}</span></section></template>
      </div></v-main><v-dialog v-model="deleteDialogOpen" max-width="430"><v-card class="task-delete-dialog"><v-card-title>¿Eliminar esta tarea?</v-card-title><v-card-text>{{ task?.name }} dejará de estar disponible para nuevos planes. Esta acción no se puede deshacer desde la plataforma.</v-card-text><v-card-actions><v-spacer /><v-btn variant="text" :disabled="deleting" @click="deleteDialogOpen = false">Cancelar</v-btn><v-btn color="error" :loading="deleting" @click="confirmDelete">Eliminar tarea</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>

<style src="@/styles/views/maintenance-tasks.scss" lang="scss"></style>

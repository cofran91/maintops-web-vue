<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiCarMultiple,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiMagnify,
  mdiPencilOutline,
  mdiPlus,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiTuneVariant,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useMaintenanceTasks } from '@/modules/maintenance-tasks/composables/useMaintenanceTasks'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService'
import { MAINTENANCE_TASK_STATUS_LABELS, MAINTENANCE_TASK_STATUSES, type MaintenanceTask } from '@/types/maintenanceTask'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const canCreateTask = computed(() => authStore.canUseResource('maintenance-tasks', 'create'))
const vehicleSystems = ref<{ id: number; code: string; name: string }[]>([])
const loadingSystems = ref(false)
const systemsError = ref('')
const deleteDialogOpen = ref(false)
const taskToDelete = ref<MaintenanceTask | null>(null)
const deleting = ref(false)

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchTasks,
  filters,
  loading,
  pagination,
  perPage,
  tasks,
  updatePage,
  updatePerPage,
} = useMaintenanceTasks()

const pageSizeOptions = [10, 15, 25, 50].map((value) => ({ title: String(value), value }))
const statusOptions = MAINTENANCE_TASK_STATUSES.map((value) => ({ title: MAINTENANCE_TASK_STATUS_LABELS[value], value }))
const activeOptions = [{ title: 'Activas', value: 'active' }, { title: 'Inactivas', value: 'inactive' }]

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())
const todayLabel = computed(() => {
  const label = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  return label.charAt(0).toUpperCase() + label.slice(1)
})
const activeCount = computed(() => tasks.value.filter((task) => task.is_active).length)
const reusableCount = computed(() => tasks.value.filter((task) => !task.vehicle_id).length)
const totalDuration = computed(() => tasks.value.reduce((total, task) => total + Number(task.estimated_duration_minutes || 0), 0))

const taskStatusLabel = (status: string) => MAINTENANCE_TASK_STATUS_LABELS[status as keyof typeof MAINTENANCE_TASK_STATUS_LABELS] || 'Actualizada'
const taskStatusColor = (status: string) => ({ created: '#7c8ba6', scheduled: '#397eea', started: '#d58930', completed: '#239878', rejected: '#dc5967', cancelled: '#b65362' }[status] || '#7c8ba6')
const systemName = (task: MaintenanceTask) => task.vehicle_system?.name || `Sistema ${task.vehicle_system_id}`
const vehicleName = (task: MaintenanceTask) => task.vehicle ? `${task.vehicle.license_plate} · ${[task.vehicle.brand, task.vehicle.model].filter(Boolean).join(' ')}` : 'Tarea reutilizable'
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Sin fecha'
const formatDuration = (value?: number | null) => value === null || value === undefined ? 'Sin estimar' : `${new Intl.NumberFormat('es-CO').format(value)} min`

const fetchVehicleSystems = async () => {
  loadingSystems.value = true
  systemsError.value = ''
  try {
    vehicleSystems.value = (await vehicleSystemsApi.index()).items
  } catch {
    systemsError.value = 'No fue posible cargar los sistemas de vehículo.'
  } finally {
    loadingSystems.value = false
  }
}

const askDelete = (task: MaintenanceTask) => {
  taskToDelete.value = task
  deleteDialogOpen.value = true
}

const deleteTask = async () => {
  if (!taskToDelete.value) return
  deleting.value = true
  try {
    await maintenanceTasksApi.remove(taskToDelete.value.id)
    deleteDialogOpen.value = false
    taskToDelete.value = null
    await fetchTasks(pagination.value.current_page)
    if (!tasks.value.length && pagination.value.current_page > 1) await fetchTasks(pagination.value.current_page - 1)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No fue posible eliminar la tarea.'
  } finally {
    deleting.value = false
  }
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}

onMounted(() => void fetchVehicleSystems())
</script>

<template>
  <div class="tasks-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar :user-initials="userInitials" :user-name="userName" context="Catálogo de tareas" @open-menu="mobileDrawer = true" />

    <v-main class="tasks-main">
      <div class="tasks-content">
        <header class="tasks-header"><div><span class="page-date">{{ todayLabel }}</span><h1>Catálogo de tareas</h1><p>Administra las actividades reutilizables que componen tus rutinas de mantenimiento.</p></div><div class="tasks-header__actions"><v-btn v-if="canCreateTask" color="primary" height="42" :to="{ name: 'maintenance-tasks-new' }"><v-icon :icon="mdiPlus" class="mr-2" size="18" />Nueva tarea</v-btn><v-btn class="tasks-refresh" height="42" :loading="loading" variant="outlined" @click="fetchTasks"><v-icon :icon="mdiRefresh" class="mr-2" size="17" />Actualizar</v-btn></div></header>

        <section class="tasks-summary-grid" aria-label="Resumen del catálogo"><article><span class="tasks-summary__icon tasks-summary__icon--blue"><v-icon :icon="mdiWrenchOutline" size="19" /></span><div><strong>{{ pagination.total }}</strong><span>Tareas registradas</span><small>En el catálogo operativo</small></div></article><article><span class="tasks-summary__icon tasks-summary__icon--teal"><v-icon :icon="mdiCheckCircleOutline" size="19" /></span><div><strong>{{ activeCount }}</strong><span>Disponibles ahora</span><small>De la página actual</small></div></article><article><span class="tasks-summary__icon tasks-summary__icon--amber"><v-icon :icon="mdiCarMultiple" size="19" /></span><div><strong>{{ reusableCount }}</strong><span>Reutilizables</span><small>Sin vehículo específico</small></div></article><article><span class="tasks-summary__icon tasks-summary__icon--slate"><v-icon :icon="mdiClockOutline" size="19" /></span><div><strong>{{ formatDuration(totalDuration) }}</strong><span>Duración visible</span><small>Acumulado de la página</small></div></article></section>

        <section class="tasks-panel"><div class="tasks-panel__heading"><div><span class="tasks-panel__eyebrow">Biblioteca operativa</span><h2>Actividades de mantenimiento</h2><p>Busca por nombre, código o sistema y mantén las tareas listas para tus planes.</p></div><v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" /></div>
          <form class="tasks-filters" @submit.prevent="applyFilters"><v-text-field v-model="filters.search" clearable hide-details label="Buscar tarea" placeholder="Nombre, código o sistema" :prepend-inner-icon="mdiMagnify" /><v-select v-model="filters.vehicle_system_id" clearable hide-details item-title="title" item-value="value" label="Sistema" :items="vehicleSystems.map((system) => ({ title: system.name, value: String(system.id) }))" :loading="loadingSystems" /><v-select v-model="filters.status" clearable hide-details item-title="title" item-value="value" label="Estado" :items="statusOptions" /><v-select v-model="filters.is_active" clearable hide-details item-title="title" item-value="value" label="Disponibilidad" :items="activeOptions" /><div class="tasks-filters__actions"><v-btn color="primary" type="submit">Aplicar</v-btn><v-btn variant="text" type="button" @click="clearFilters">Limpiar</v-btn></div></form>
          <v-alert v-if="systemsError" class="tasks-alert" type="warning" variant="tonal">{{ systemsError }}</v-alert><v-progress-linear v-if="loading" color="primary" indeterminate /><v-alert v-if="errorMessage" class="tasks-alert" type="error" variant="tonal"><span>{{ errorMessage }}</span><template #append><v-btn size="small" variant="text" @click="fetchTasks">Reintentar</v-btn></template></v-alert>
          <div class="tasks-table-wrap"><table class="tasks-table"><thead><tr><th>Tarea</th><th>Sistema</th><th>Alcance</th><th>Duración</th><th>Estado</th><th>Actualizada</th><th /></tr></thead><tbody><template v-if="loading && !tasks.length"><tr v-for="row in 6" :key="row" class="tasks-skeleton-row"><td v-for="cell in 7" :key="cell"><v-skeleton-loader type="text" /></td></tr></template><template v-else><tr v-for="task in tasks" :key="task.id"><td><div class="task-identity"><span class="task-identity__icon"><v-icon :icon="mdiWrenchOutline" size="16" /></span><span><router-link :to="{ name: 'maintenance-tasks-detail', params: { id: task.id } }">{{ task.name }}</router-link><small>{{ task.code }}</small></span></div></td><td><span class="task-muted">{{ systemName(task) }}</span><small class="task-secondary">{{ task.vehicle_system?.code || 'Sistema general' }}</small></td><td><span :class="['task-scope', { 'task-scope--specific': task.vehicle_id }]" >{{ vehicleName(task) }}</span></td><td><span class="task-muted">{{ formatDuration(task.estimated_duration_minutes) }}</span></td><td><v-chip label size="small" :color="taskStatusColor(task.status)" variant="tonal">{{ taskStatusLabel(task.status) }}</v-chip></td><td><span class="task-muted">{{ formatDate(task.updated_at) }}</span></td><td><div class="task-row-actions"><v-btn aria-label="Editar tarea" icon size="small" variant="text" :to="{ name: 'maintenance-tasks-edit', params: { id: task.id } }"><v-icon :icon="mdiPencilOutline" size="17" /></v-btn><v-btn aria-label="Eliminar tarea" color="error" icon size="small" variant="text" @click="askDelete(task)"><v-icon :icon="mdiTrashCanOutline" size="17" /></v-btn></div></td></tr></template><tr v-if="!loading && !tasks.length"><td class="tasks-empty" colspan="7"><v-icon :icon="mdiAlertOutline" size="28" /><strong>No encontramos tareas</strong><span>Prueba con otros filtros o registra una nueva actividad.</span></td></tr></tbody></table></div>
          <footer class="tasks-pagination"><span>Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}</span><div class="tasks-pagination__controls"><v-select hide-details density="compact" item-title="title" item-value="value" label="Por página" :items="pageSizeOptions" :model-value="perPage" variant="outlined" @update:model-value="updatePerPage" /><v-pagination density="comfortable" :length="pagination.last_page" :model-value="pagination.current_page" :total-visible="5" @update:model-value="updatePage" /></div></footer>
        </section>
      </div>
    </v-main>

    <v-dialog v-model="deleteDialogOpen" max-width="430"><v-card class="task-delete-dialog"><v-card-title>¿Eliminar esta tarea?</v-card-title><v-card-text>{{ taskToDelete?.name }} dejará de estar disponible para nuevos planes. Las órdenes que ya la utilicen no se modificarán.</v-card-text><v-card-actions><v-spacer /><v-btn variant="text" :disabled="deleting" @click="deleteDialogOpen = false">Cancelar</v-btn><v-btn color="error" :loading="deleting" @click="deleteTask">Eliminar tarea</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>

<style src="@/styles/views/maintenance-tasks.scss" lang="scss"></style>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCarMultiple,
  mdiCheckCircleOutline,
  mdiContentSaveOutline,
  mdiPlus,
  mdiRefresh,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError } from '@/api/errors'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService'
import { useAuthStore } from '@/stores/auth'
import type { Vehicle } from '@/types/vehicle'
import type { MaintenanceTaskPayload } from '@/types/maintenanceTask'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loading = ref(false)
const loadingOptions = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const vehicleSystems = ref<{ id: number; code: string; name: string }[]>([])
const vehicles = ref<Vehicle[]>([])

const form = reactive({ vehicle_system_id: null as number | null, vehicle_id: null as number | null, name: '', code: '', description: '', estimated_duration_minutes: '', is_active: true, reusable: true })
const isEditing = computed(() => route.name === 'maintenance-tasks-edit')
const taskId = computed(() => String(route.params.id ?? ''))
const pageTitle = computed(() => isEditing.value ? 'Editar tarea' : 'Nueva tarea')
const pageSubtitle = computed(() => isEditing.value ? 'Actualiza la información de esta actividad del catálogo.' : 'Registra una actividad que puedas reutilizar en tus planes de mantenimiento.')
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())
const vehicleOptions = computed(() => vehicles.value.map((vehicle) => ({ title: `${vehicle.license_plate} · ${[vehicle.brand, vehicle.model].filter(Boolean).join(' ')}`, value: vehicle.id, subtitle: vehicle.owner?.name || 'Propietario sin registrar' })))
const systemOptions = computed(() => vehicleSystems.value.map((system) => ({ title: system.name, value: system.id, subtitle: system.code })))
const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''

const resetForm = () => {
  form.vehicle_system_id = null
  form.vehicle_id = null
  form.name = ''
  form.code = ''
  form.description = ''
  form.estimated_duration_minutes = ''
  form.is_active = true
  form.reusable = true
}

const clearFeedback = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const loadOptions = async () => {
  loadingOptions.value = true
  try {
    const [systemsPage, vehiclesPage] = await Promise.all([vehicleSystemsApi.index(), vehiclesApi.index({ page: 1, per_page: 100 })])
    vehicleSystems.value = systemsPage.items
    vehicles.value = vehiclesPage.items
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loadingOptions.value = false
  }
}

const loadTask = async () => {
  resetForm()
  clearFeedback()
  if (!isEditing.value) return
  loading.value = true
  try {
    const task = await maintenanceTasksApi.show(taskId.value)
    form.vehicle_system_id = task.vehicle_system_id
    form.vehicle_id = task.vehicle_id ?? null
    form.name = task.name
    form.code = task.code
    form.description = task.description || ''
    form.estimated_duration_minutes = String(task.estimated_duration_minutes)
    form.is_active = task.is_active
    form.reusable = !task.vehicle_id
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const validate = () => {
  const errors: Record<string, string[]> = {}
  if (!form.vehicle_system_id) errors.vehicle_system_id = ['Selecciona el sistema del vehículo.']
  if (!form.name.trim()) errors.name = ['El nombre de la tarea es obligatorio.']
  if (!form.code.trim()) errors.code = ['El código de la tarea es obligatorio.']
  const duration = Number(form.estimated_duration_minutes)
  if (!Number.isInteger(duration) || duration < 1 || duration > 10080) errors.estimated_duration_minutes = ['Usa una duración entera entre 1 y 10080 minutos.']
  if (!form.reusable && !form.vehicle_id) errors.vehicle_id = ['Selecciona el vehículo específico.']
  validationErrors.value = errors
  if (Object.keys(errors).length) formError.value = 'Revisa los campos señalados antes de continuar.'
  return !Object.keys(errors).length
}

const submit = async () => {
  clearFeedback()
  if (!validate()) return
  saving.value = true
  const payload: MaintenanceTaskPayload = { vehicle_system_id: form.vehicle_system_id!, vehicle_id: form.reusable ? null : form.vehicle_id, name: form.name.trim(), code: form.code.trim().toUpperCase(), description: form.description.trim() || null, estimated_duration_minutes: Number(form.estimated_duration_minutes), is_active: form.is_active }
  try {
    const task = isEditing.value ? await maintenanceTasksApi.update(taskId.value, payload) : await maintenanceTasksApi.create(payload)
    await router.push({ name: 'maintenance-tasks-detail', params: { id: task.id } })
  } catch (error) {
    const apiError = normalizeApiError(error)
    formError.value = apiError.message
    validationErrors.value = apiError.errors || {}
  } finally {
    saving.value = false
  }
}

const setReusable = (value: boolean | null) => {
  form.reusable = Boolean(value)
  if (form.reusable) form.vehicle_id = null
}
const backRoute = computed(() => isEditing.value ? { name: 'maintenance-tasks-detail', params: { id: taskId.value } } : { name: 'maintenance-tasks' })
const signOut = async () => { await authStore.logout(); await router.push({ name: 'login' }) }

onMounted(async () => { await loadOptions(); await loadTask() })
watch(() => route.fullPath, () => { if (route.name === 'maintenance-tasks-edit' || route.name === 'maintenance-tasks-new') void loadTask() })
</script>

<template>
  <div class="tasks-shell task-form-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar :user-initials="userInitials" :user-name="userName" :context="pageTitle" @open-menu="mobileDrawer = true" />
    <v-main class="tasks-main"><div class="tasks-content task-form-content"><div class="task-breadcrumbs"><router-link :to="{ name: 'maintenance-tasks' }">Catálogo de tareas</router-link><v-icon :icon="mdiArrowLeft" size="14" /><span>{{ pageTitle }}</span></div><header class="task-form-header"><div><span class="page-date">Biblioteca operativa</span><h1>{{ pageTitle }}</h1><p>{{ pageSubtitle }}</p></div><v-btn class="tasks-refresh" height="42" variant="outlined" :to="backRoute"><v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />Cancelar</v-btn></header>
      <v-alert v-if="loadError" class="tasks-alert" type="error" variant="tonal"><span>{{ loadError }}</span><template #append><v-btn size="small" variant="text" @click="loadTask"><v-icon :icon="mdiRefresh" class="mr-1" size="15" />Reintentar</v-btn></template></v-alert>
      <v-form v-if="!loading && !loadError" class="task-form-card" @submit.prevent="submit"><div class="task-form-card__heading"><span class="task-form-card__icon"><v-icon :icon="mdiWrenchOutline" size="20" /></span><div><h2>Información de la actividad</h2><p>Define los datos que verán los equipos al ejecutar esta tarea.</p></div></div><v-alert v-if="formError" class="tasks-alert" type="error" variant="tonal">{{ formError }}</v-alert>
        <section class="task-form-section"><div class="task-form-section__heading"><span>Identificación</span><small>Campos requeridos para encontrar la actividad.</small></div><div class="task-form-grid"><v-text-field v-model="form.name" :error-messages="fieldError('name')" label="Nombre de la tarea" placeholder="Ej. Cambio de aceite y filtro" /><v-text-field v-model="form.code" :error-messages="fieldError('code')" label="Código interno" placeholder="Ej. ACEITE-001" @update:model-value="form.code = form.code.toUpperCase()" /><v-autocomplete v-model="form.vehicle_system_id" item-title="title" item-value="value" :items="systemOptions" :loading="loadingOptions" :error-messages="fieldError('vehicle_system_id')" label="Sistema del vehículo" placeholder="Selecciona un sistema"><template #item="{ props, item }"><v-list-item v-bind="props" :subtitle="item.raw.subtitle" /></template></v-autocomplete><v-text-field v-model="form.estimated_duration_minutes" :error-messages="fieldError('estimated_duration_minutes')" label="Duración estimada (minutos)" min="1" max="10080" placeholder="Ej. 90" type="number" /></div><v-textarea v-model="form.description" auto-grow hide-details label="Descripción operativa" maxlength="2000" placeholder="Describe el procedimiento o el resultado esperado." rows="4" /></section>
        <section class="task-form-section"><div class="task-form-section__heading"><span>Alcance de la tarea</span><small>Indica si puede reutilizarse en cualquier vehículo.</small></div><div class="task-scope-toggle"><span class="task-scope-toggle__icon"><v-icon :icon="form.reusable ? mdiWrenchOutline : mdiCarMultiple" size="19" /></span><div><strong>{{ form.reusable ? 'Tarea reutilizable' : 'Tarea específica de un vehículo' }}</strong><small>{{ form.reusable ? 'Disponible para seleccionarse en diferentes planes y vehículos.' : 'Solo estará disponible para la unidad seleccionada.' }}</small></div><v-switch :model-value="form.reusable" color="primary" hide-details inset @update:model-value="setReusable" /></div><v-autocomplete v-if="!form.reusable" v-model="form.vehicle_id" class="task-vehicle-select" item-title="title" item-value="value" :items="vehicleOptions" :loading="loadingOptions" :error-messages="fieldError('vehicle_id')" label="Vehículo asignado" placeholder="Selecciona una unidad"><template #item="{ props, item }"><v-list-item v-bind="props" :subtitle="item.raw.subtitle" /></template></v-autocomplete></section>
        <section class="task-form-section task-form-status"><div><span class="task-form-section__heading">Disponibilidad</span><small>Las tareas inactivas no aparecerán como opción en nuevos planes.</small></div><v-switch v-model="form.is_active" color="success" hide-details inset label="Tarea activa" /></section><footer class="task-form-actions"><v-btn variant="text" :to="backRoute">Cancelar</v-btn><v-btn color="primary" :loading="saving" type="submit"><v-icon :icon="isEditing ? mdiContentSaveOutline : mdiPlus" class="mr-2" size="17" />{{ isEditing ? 'Guardar cambios' : 'Crear tarea' }}</v-btn></footer>
      </v-form><div v-else-if="loading" class="task-form-loading"><v-skeleton-loader type="article, table-tbody" /></div></div></v-main>
  </div>
</template>

<style src="@/styles/views/maintenance-tasks.scss" lang="scss"></style>

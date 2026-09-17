<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarClockOutline,
  mdiCheckCircleOutline,
  mdiContentSaveOutline,
  mdiDeleteOutline,
  mdiPlus,
  mdiRefresh,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError, type ApiError } from '@/api/errors'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService'
import { useAuthStore } from '@/stores/auth'
import type { VehicleSystem } from '@/types/vehicleSystem'
import type { MaintenancePlan, MaintenancePlanPayload, MaintenanceTaskPayload } from '@/types/maintenancePlan'

interface TaskDraft {
  code: string
  name: string
  description: string
  vehicle_system_id: number | null
  estimated_duration_minutes: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loading = ref(false)
const loadingSystems = ref(false)
const saving = ref(false)
const optionsError = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const vehicleSystems = ref<VehicleSystem[]>([])

const form = reactive({
  code: '',
  name: '',
  description: '',
  interval_km: '',
  interval_months: '',
  is_active: true,
  tasks: [] as TaskDraft[],
})

const roleSystemOptions = computed(() => vehicleSystems.value.map((system) => ({
  ...system,
  title: system.name,
  subtitle: system.code,
})))
const isEditing = computed(() => route.name === 'maintenance-plans-edit')
const planId = computed(() => String(route.params.id ?? ''))
const pageTitle = computed(() => (isEditing.value ? 'Editar plan' : 'Nuevo plan'))
const pageSubtitle = computed(() => isEditing.value
  ? 'Actualiza la frecuencia y las actividades de esta rutina preventiva.'
  : 'Configura una rutina preventiva para estandarizar el mantenimiento de la flota.')
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Registrar plan'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() => isEditing.value && planId.value
  ? { name: 'maintenance-plans-detail', params: { id: planId.value } }
  : { name: 'maintenance-plans' })
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())

const emptyTask = (): TaskDraft => ({ code: '', name: '', description: '', vehicle_system_id: null, estimated_duration_minutes: '' })
const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''
const taskError = (index: number, field: string) => fieldError(`tasks.${index}.${field}`)
const nullableText = (value: string) => value.trim() || null

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.description = ''
  form.interval_km = ''
  form.interval_months = ''
  form.is_active = true
  form.tasks = [emptyTask()]
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
  optionsError.value = false
}

const fillForm = (plan: MaintenancePlan) => {
  form.code = plan.code || ''
  form.name = plan.name || ''
  form.description = plan.description || ''
  form.interval_km = plan.interval_km ? String(plan.interval_km) : ''
  form.interval_months = plan.interval_months ? String(plan.interval_months) : ''
  form.is_active = plan.is_active
  form.tasks = plan.tasks?.map((task) => ({
    code: task.code || '',
    name: task.name || '',
    description: task.description || '',
    vehicle_system_id: task.vehicle_system_id ?? task.vehicle_system?.id ?? null,
    estimated_duration_minutes: task.estimated_duration_minutes ? String(task.estimated_duration_minutes) : '',
  })) || [emptyTask()]
}

const loadSystems = async () => {
  loadingSystems.value = true
  optionsError.value = false
  try {
    vehicleSystems.value = (await vehicleSystemsApi.index()).items
  } catch (error) {
    optionsError.value = true
    formError.value = normalizeApiError(error).message
  } finally {
    loadingSystems.value = false
  }
}

const loadPlan = async () => {
  if (!planId.value) {
    loadError.value = 'No se encontró el identificador del plan.'
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    fillForm(await maintenancePlansApi.show(planId.value))
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const isPositiveInteger = (value: string) => value.trim() !== '' && Number.isInteger(Number(value)) && Number(value) > 0

const validateForm = () => {
  const errors: Record<string, string[]> = {}
  if (!form.code.trim()) errors.code = ['El código del plan es obligatorio.']
  if (!form.name.trim()) errors.name = ['El nombre del plan es obligatorio.']
  if (!isPositiveInteger(form.interval_km) && !isPositiveInteger(form.interval_months)) {
    errors.interval = ['Define al menos un intervalo válido por kilometraje o tiempo.']
  }
  if (form.tasks.length === 0) errors.tasks = ['Agrega al menos una actividad al plan.']

  form.tasks.forEach((task, index) => {
    if (!task.code.trim()) errors[`tasks.${index}.code`] = ['El código es obligatorio.']
    if (!task.name.trim()) errors[`tasks.${index}.name`] = ['El nombre es obligatorio.']
    if (task.estimated_duration_minutes && !isPositiveInteger(task.estimated_duration_minutes)) {
      errors[`tasks.${index}.estimated_duration_minutes`] = ['Usa una duración entera mayor que cero.']
    }
  })

  validationErrors.value = errors
  if (Object.keys(errors).length > 0) {
    formError.value = 'Revisa los campos marcados antes de continuar.'
    return false
  }
  return true
}

const buildPayload = (): MaintenancePlanPayload => ({
  code: form.code.trim().toUpperCase(),
  name: form.name.trim(),
  description: nullableText(form.description),
  interval_km: isPositiveInteger(form.interval_km) ? Number(form.interval_km) : null,
  interval_months: isPositiveInteger(form.interval_months) ? Number(form.interval_months) : null,
  is_active: form.is_active,
  tasks: form.tasks.map((task, index): MaintenanceTaskPayload => ({
    code: task.code.trim().toUpperCase(),
    name: task.name.trim(),
    description: nullableText(task.description),
    vehicle_system_id: task.vehicle_system_id,
    estimated_duration_minutes: isPositiveInteger(task.estimated_duration_minutes) ? Number(task.estimated_duration_minutes) : null,
    sequence: index + 1,
  })),
})

const addTask = () => form.tasks.push(emptyTask())
const removeTask = (index: number) => {
  if (form.tasks.length === 1) {
    form.tasks[0] = emptyTask()
    return
  }
  form.tasks.splice(index, 1)
}

const submitForm = async () => {
  resetErrors()
  if (!validateForm()) return
  saving.value = true
  try {
    const savedPlan = isEditing.value
      ? await maintenancePlansApi.update(planId.value, buildPayload())
      : await maintenancePlansApi.create(buildPayload())
    await router.push({ name: 'maintenance-plans-detail', params: { id: savedPlan.id } })
  } catch (error) {
    const apiError: ApiError = normalizeApiError(error)
    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}

watch(() => route.fullPath, () => {
  resetForm()
  resetErrors()
  if (isEditing.value) void loadPlan()
}, { immediate: true })

onMounted(() => void loadSystems())
</script>

<template>
  <div class="maintenance-plans-shell maintenance-plan-form-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar :user-initials="userInitials" :user-name="userName" :context="pageTitle" @open-menu="mobileDrawer = true" />

    <v-main class="maintenance-plans-main">
      <div class="maintenance-plans-content vehicle-form-content">
        <div class="maintenance-plan-form-breadcrumbs"><router-link :to="{ name: 'maintenance-plans' }">Planes de mantenimiento</router-link><v-icon :icon="mdiArrowLeft" size="14" /><span>{{ pageTitle }}</span></div>
        <header class="vehicle-form-header">
          <div><span class="page-date">Configuración preventiva</span><h1>{{ pageTitle }}</h1><p>{{ pageSubtitle }}</p></div>
          <v-btn :to="backRoute" class="maintenance-plans-refresh" height="42" variant="outlined"><v-icon :icon="mdiArrowLeft" class="mr-2" size="17" /> Cancelar</v-btn>
        </header>

        <v-alert v-if="formError || loadError" class="vehicle-form-alert" type="error" variant="tonal">
          <span>{{ formError || loadError }}</span>
          <template #append><v-btn v-if="loadError && !saving" size="small" variant="text" @click="loadPlan">Reintentar</v-btn><v-btn v-else-if="optionsError && !saving" size="small" variant="text" @click="loadSystems">Reintentar catálogos</v-btn></template>
        </v-alert>

        <section v-if="loading" class="vehicle-form-loading"><v-skeleton-loader type="article, article" /></section>
        <section v-else-if="!loadError || !isEditing" class="vehicle-form-layout">
          <form class="vehicle-form-card maintenance-plan-form-card" @submit.prevent="submitForm">
            <div class="vehicle-form-card__heading"><span class="vehicle-form-card__icon"><v-icon :icon="mdiCalendarClockOutline" size="20" /></span><div><h2>Configuración del plan</h2><p>Define la identidad, frecuencia y disponibilidad de la rutina.</p></div></div>
            <div class="vehicle-form-fields">
              <v-text-field v-model="form.name" :error-messages="fieldError('name')" label="Nombre del plan" maxlength="255" placeholder="Ej. Mantenimiento preventivo 10.000 km" required variant="outlined" />
              <v-text-field v-model="form.code" :error-messages="fieldError('code')" label="Código" maxlength="100" placeholder="Ej. PM-10000" required variant="outlined" />
              <v-text-field v-model="form.interval_km" :error-messages="fieldError('interval')" label="Intervalo en kilómetros" min="1" type="number" placeholder="Ej. 10000" variant="outlined" />
              <v-text-field v-model="form.interval_months" :error-messages="fieldError('interval')" label="Intervalo en meses" min="1" type="number" placeholder="Ej. 6" variant="outlined" />
            </div>
            <v-textarea v-model="form.description" auto-grow hide-details label="Descripción" maxlength="1000" placeholder="Describe el objetivo de esta rutina preventiva." rows="3" variant="outlined" />

            <div class="maintenance-plan-form-section-heading"><div><h3>Actividades del plan</h3><p>Ordena las tareas y asocia cada una con su sistema de vehículo.</p></div><v-btn color="primary" size="small" variant="tonal" type="button" @click="addTask"><v-icon :icon="mdiPlus" class="mr-1" size="15" /> Agregar actividad</v-btn></div>
            <p v-if="fieldError('tasks')" class="maintenance-plan-form-error">{{ fieldError('tasks') }}</p>

            <div class="maintenance-plan-task-editor">
              <article v-for="(task, index) in form.tasks" :key="index" class="maintenance-plan-task-row">
                <div class="maintenance-plan-task-row__number">{{ index + 1 }}</div>
                <div class="maintenance-plan-task-row__fields">
                  <v-text-field v-model="task.name" :error-messages="taskError(index, 'name')" label="Nombre de actividad" placeholder="Ej. Cambio de aceite y filtro" required variant="outlined" />
                  <v-text-field v-model="task.code" :error-messages="taskError(index, 'code')" label="Código" placeholder="Ej. ACEITE-001" required variant="outlined" />
                  <v-autocomplete v-model="task.vehicle_system_id" item-title="title" item-value="id" label="Sistema" :items="roleSystemOptions" :loading="loadingSystems" placeholder="Selecciona un sistema" variant="outlined" />
                  <v-text-field v-model="task.estimated_duration_minutes" :error-messages="taskError(index, 'estimated_duration_minutes')" label="Duración (min)" min="1" type="number" placeholder="Ej. 60" variant="outlined" />
                  <v-textarea v-model="task.description" auto-grow hide-details label="Descripción de la actividad" rows="2" variant="outlined" />
                </div>
                <v-btn aria-label="Eliminar actividad" class="maintenance-plan-task-row__remove" color="error" icon size="small" variant="text" type="button" @click="removeTask(index)"><v-icon :icon="mdiDeleteOutline" size="18" /></v-btn>
              </article>
            </div>

            <v-switch v-model="form.is_active" color="primary" hide-details inset label="Plan activo para nuevas órdenes" />
            <div class="vehicle-form-actions"><v-btn :to="backRoute" variant="text">Cancelar</v-btn><v-btn color="primary" :loading="saving" type="submit"><v-icon :icon="submitIcon" class="mr-2" size="17" /> {{ submitLabel }}</v-btn></div>
          </form>

          <aside class="vehicle-form-aside"><span class="vehicle-form-aside__icon"><v-icon :icon="mdiCheckCircleOutline" size="21" /></span><h2>Rutinas consistentes</h2><p>Los planes estandarizan las actividades que deben ejecutarse para cada intervalo de mantenimiento.</p><ul><li>El código se normaliza en mayúsculas.</li><li>Define kilometraje, meses o ambos intervalos.</li><li>Cada actividad conserva su orden de ejecución.</li></ul><span class="vehicle-form-aside__footer"><v-icon :icon="mdiWrenchOutline" size="15" /> Las actividades se enviarán junto con el plan.</span></aside>
        </section>
        <section v-else class="vehicle-form-loading"><v-icon :icon="mdiAlertOutline" color="error" size="28" /><p>No fue posible cargar el plan seleccionado.</p></section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/maintenance-plan-form.scss" lang="scss"></style>

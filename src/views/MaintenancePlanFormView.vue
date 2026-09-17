<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarClockOutline,
  mdiCheckCircleOutline,
  mdiContentSaveOutline,
  mdiPlus,
  mdiRefresh,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError, type ApiError } from '@/api/errors'
import MaintenanceTaskMultiSelect from '@/modules/maintenance-tasks/components/MaintenanceTaskMultiSelect.vue'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService'
import { useAuthStore } from '@/stores/auth'
import type { MaintenancePlan, MaintenancePlanPayload } from '@/types/maintenancePlan'
import type { MaintenanceTask } from '@/types/maintenanceTask'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const selectedTaskItems = ref<MaintenanceTask[]>([])

const form = reactive({
  code: '',
  name: '',
  description: '',
  recommended_interval_days: '',
  recommended_interval_km: '',
  task_ids: [] as number[],
  is_active: true,
})

const isEditing = computed(() => route.name === 'maintenance-plans-edit')
const planId = computed(() => String(route.params.id ?? ''))
const pageTitle = computed(() => (isEditing.value ? 'Editar plan' : 'Nuevo plan'))
const pageSubtitle = computed(() => isEditing.value
  ? 'Actualiza la frecuencia y las actividades de esta rutina preventiva.'
  : 'Configura una rutina preventiva con actividades reutilizables del catálogo.')
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Registrar plan'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() => isEditing.value && planId.value
  ? { name: 'maintenance-plans-detail', params: { id: planId.value } }
  : { name: 'maintenance-plans' })
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())
const selectedTaskCount = computed(() => form.task_ids.length)

const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''
const nullableText = (value: string) => value.trim() || null
const nullablePositiveInteger = (value: string, max: number) => {
  if (value.trim() === '') return null
  const number = Number(value)
  return Number.isInteger(number) && number > 0 && number <= max ? number : null
}
const hasValidInterval = (value: string, max: number) => value.trim() === '' || nullablePositiveInteger(value, max) !== null

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.description = ''
  form.recommended_interval_days = ''
  form.recommended_interval_km = ''
  form.task_ids = []
  form.is_active = true
  selectedTaskItems.value = []
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const fillForm = (plan: MaintenancePlan) => {
  form.code = plan.code || ''
  form.name = plan.name || ''
  form.description = plan.description || ''
  form.recommended_interval_days = plan.recommended_interval_days ? String(plan.recommended_interval_days) : ''
  form.recommended_interval_km = plan.recommended_interval_km ? String(plan.recommended_interval_km) : ''
  form.task_ids = plan.task_ids ?? plan.tasks?.map((task) => Number(task.id)) ?? []
  form.is_active = Boolean(plan.is_active)
  selectedTaskItems.value = plan.tasks ?? []
}

const loadPlan = async () => {
  resetForm()
  resetErrors()
  if (!isEditing.value) return
  if (!planId.value) {
    loadError.value = 'No se encontró el identificador del plan.'
    return
  }

  loading.value = true
  try {
    fillForm(await maintenancePlansApi.show(planId.value))
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  const errors: Record<string, string[]> = {}
  if (!form.code.trim()) errors.code = ['El código del plan es obligatorio.']
  if (!form.name.trim()) errors.name = ['El nombre del plan es obligatorio.']
  if (!form.task_ids.length) errors.task_ids = ['Selecciona al menos una actividad reutilizable.']
  if (!hasValidInterval(form.recommended_interval_days, 3650)) errors.recommended_interval_days = ['Usa un valor entre 1 y 3650 días.']
  if (!hasValidInterval(form.recommended_interval_km, 1000000)) errors.recommended_interval_km = ['Usa un valor entre 1 y 1.000.000 km.']

  validationErrors.value = errors
  if (Object.keys(errors).length) formError.value = 'Revisa los campos señalados antes de continuar.'
  return !Object.keys(errors).length
}

const buildPayload = (): MaintenancePlanPayload => ({
  code: form.code.trim().toUpperCase(),
  name: form.name.trim(),
  description: nullableText(form.description),
  recommended_interval_days: nullablePositiveInteger(form.recommended_interval_days, 3650),
  recommended_interval_km: nullablePositiveInteger(form.recommended_interval_km, 1000000),
  task_ids: form.task_ids.map(Number),
  is_active: form.is_active,
})

const updateTaskIds = (taskIds: number[]) => {
  form.task_ids = taskIds
  if (validationErrors.value.task_ids && taskIds.length) delete validationErrors.value.task_ids
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

watch(() => route.fullPath, () => void loadPlan(), { immediate: true })
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
          <template #append><v-btn v-if="loadError && !saving" size="small" variant="text" @click="loadPlan"><v-icon :icon="mdiRefresh" class="mr-1" size="15" />Reintentar</v-btn></template>
        </v-alert>

        <section v-if="loading" class="vehicle-form-loading"><v-skeleton-loader type="article, article" /></section>
        <section v-else-if="!loadError || !isEditing" class="vehicle-form-layout">
          <form class="vehicle-form-card maintenance-plan-form-card" @submit.prevent="submitForm">
            <div class="vehicle-form-card__heading"><span class="vehicle-form-card__icon"><v-icon :icon="mdiCalendarClockOutline" size="20" /></span><div><h2>Configuración del plan</h2><p>Define la identidad, frecuencia y disponibilidad de la rutina.</p></div></div>
            <div class="vehicle-form-fields">
              <v-text-field v-model="form.name" :error-messages="fieldError('name')" label="Nombre del plan" maxlength="255" placeholder="Ej. Mantenimiento preventivo 10.000 km" required variant="outlined" />
              <v-text-field v-model="form.code" :error-messages="fieldError('code')" label="Código" maxlength="100" placeholder="Ej. PM-10000" required variant="outlined" @update:model-value="form.code = form.code.toUpperCase()" />
              <v-text-field v-model="form.recommended_interval_days" :error-messages="fieldError('recommended_interval_days')" label="Intervalo recomendado (días)" min="1" max="3650" type="number" placeholder="Ej. 180" variant="outlined" />
              <v-text-field v-model="form.recommended_interval_km" :error-messages="fieldError('recommended_interval_km')" label="Intervalo recomendado (km)" min="1" max="1000000" type="number" placeholder="Ej. 10000" variant="outlined" />
            </div>
            <v-textarea v-model="form.description" auto-grow hide-details label="Descripción" maxlength="2000" placeholder="Describe el objetivo de esta rutina preventiva." rows="3" variant="outlined" />

            <div class="maintenance-plan-form-section-heading"><div><h3>Actividades reutilizables</h3><p>Selecciona tareas activas del catálogo y conserva el orden en que se ejecutarán.</p></div><v-chip color="primary" label size="small" variant="tonal">{{ selectedTaskCount }} seleccionadas</v-chip></div>
            <MaintenanceTaskMultiSelect :model-value="form.task_ids" :selected-items="selectedTaskItems" :error-messages="fieldError('task_ids')" @update:model-value="updateTaskIds" />
            <p class="maintenance-plan-task-helper"><v-icon :icon="mdiWrenchOutline" size="14" /> Solo se muestran tareas reutilizables activas. Puedes buscar por código, nombre o sistema.</p>

            <div class="maintenance-plan-status-row"><div><strong>Disponibilidad del plan</strong><small>Los planes inactivos no aparecerán al crear nuevas órdenes.</small></div><v-switch v-model="form.is_active" color="success" hide-details inset label="Plan activo" /></div>
            <div class="vehicle-form-actions"><v-btn :to="backRoute" variant="text">Cancelar</v-btn><v-btn color="primary" :loading="saving" type="submit"><v-icon :icon="submitIcon" class="mr-2" size="17" /> {{ submitLabel }}</v-btn></div>
          </form>

          <aside class="vehicle-form-aside"><span class="vehicle-form-aside__icon"><v-icon :icon="mdiCheckCircleOutline" size="21" /></span><h2>Planes consistentes</h2><p>Los planes reutilizan actividades del catálogo para mantener la operación estandarizada.</p><ul><li>El código se normaliza en mayúsculas.</li><li>Los intervalos aceptan días, kilómetros o ambos.</li><li>Las tareas permanecen administradas desde su catálogo.</li></ul><span class="vehicle-form-aside__footer"><v-icon :icon="mdiWrenchOutline" size="15" /> {{ selectedTaskCount }} actividades incluidas en esta rutina.</span></aside>
        </section>
        <section v-else class="vehicle-form-loading"><v-icon :icon="mdiAlertOutline" color="error" size="28" /><p>No fue posible cargar el plan seleccionado.</p></section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/maintenance-plan-form.scss" lang="scss"></style>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountGroupOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarClockOutline,
  mdiCheckCircleOutline,
  mdiContentSaveOutline,
  mdiEmailOutline,
  mdiGarageVariant,
  mdiMapMarkerOutline,
  mdiPhoneOutline,
  mdiPlus,
  mdiRefresh,
  mdiWrenchCogOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError, type ApiError } from '@/api/errors'
import usersApi from '@/modules/users/services/usersService'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import { useAuthStore } from '@/stores/auth'
import type { MaintenanceOrderPerson } from '@/types/maintenanceOrder'
import type { VehicleSystem } from '@/types/vehicleSystem'
import type { Workshop, WorkshopPayload, WorkshopScheduleEntry } from '@/types/workshop'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loading = ref(false)
const loadingOptions = ref(false)
const optionsError = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const managers = ref<MaintenanceOrderPerson[]>([])
const technicians = ref<MaintenanceOrderPerson[]>([])
const vehicleSystems = ref<VehicleSystem[]>([])

const dayOptions = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

const defaultSchedule = (): Record<string, WorkshopScheduleEntry> =>
  Object.fromEntries(
    dayOptions.map(({ key }) => [key, { opens_at: '08:00', closes_at: '17:00' }]),
  )

const form = reactive({
  manager_user_id: null as number | null,
  name: '',
  code: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  weekly_schedule: defaultSchedule(),
  vehicle_system_ids: [] as number[],
  technician_user_ids: [] as number[],
  is_active: true,
})

const isEditing = computed(() => route.name === 'workshops-edit')
const workshopId = computed(() => String(route.params.id ?? ''))
const pageTitle = computed(() => (isEditing.value ? 'Editar taller' : 'Nuevo taller'))
const pageSubtitle = computed(() =>
  isEditing.value
    ? 'Actualiza la configuración operativa y el equipo asignado al taller.'
    : 'Registra un centro de servicio para atender órdenes de mantenimiento.',
)
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Registrar taller'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && workshopId.value
    ? { name: 'workshops-detail', params: { id: workshopId.value } }
    : { name: 'workshops' },
)
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
const managerOptions = computed(() =>
  managers.value.map((user) => ({
    ...user,
    title: user.name || `Usuario ${user.id}`,
    subtitle: user.email || 'Sin correo registrado',
  })),
)
const technicianOptions = computed(() =>
  technicians.value.map((user) => ({
    ...user,
    title: user.name || `Usuario ${user.id}`,
    subtitle: user.email || 'Sin correo registrado',
  })),
)
const systemOptions = computed(() =>
  vehicleSystems.value.map((system) => ({
    ...system,
    title: system.name,
    subtitle: system.code,
  })),
)

const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''

const resetForm = () => {
  form.manager_user_id = null
  form.name = ''
  form.code = ''
  form.address = ''
  form.city = ''
  form.phone = ''
  form.email = ''
  form.weekly_schedule = defaultSchedule()
  form.vehicle_system_ids = []
  form.technician_user_ids = []
  form.is_active = true
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  optionsError.value = false
  validationErrors.value = {}
}

const fillForm = (workshop: Workshop) => {
  form.manager_user_id = workshop.manager_user_id
  form.name = workshop.name || ''
  form.code = workshop.code || ''
  form.address = workshop.address || ''
  form.city = workshop.city || ''
  form.phone = workshop.phone || ''
  form.email = workshop.email || ''
  form.weekly_schedule = { ...defaultSchedule(), ...(workshop.weekly_schedule || {}) }
  form.vehicle_system_ids = [...(workshop.vehicle_system_ids || [])]
  form.technician_user_ids = [...(workshop.technician_user_ids || [])]
  form.is_active = workshop.is_active
}

const loadOptions = async () => {
  loadingOptions.value = true
  optionsError.value = false

  try {
    const [managerPage, technicianPage, systemPage] = await Promise.all([
      usersApi.workshopManagers(),
      usersApi.technicians(),
      vehicleSystemsApi.index(),
    ])

    managers.value = managerPage.items
    technicians.value = technicianPage.items
    vehicleSystems.value = systemPage.items
  } catch (error) {
    optionsError.value = true
    formError.value = normalizeApiError(error).message
  } finally {
    loadingOptions.value = false
  }
}

const loadWorkshop = async () => {
  if (!workshopId.value) {
    loadError.value = 'No se encontró el identificador del taller.'
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    fillForm(await workshopsApi.show(workshopId.value))
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const validateSchedule = () =>
  dayOptions.every(({ key }) => {
    const schedule = form.weekly_schedule[key]
    return Boolean(schedule?.opens_at && schedule?.closes_at && schedule.opens_at < schedule.closes_at)
  })

const validateForm = () => {
  const errors: Record<string, string[]> = {}

  if (!form.manager_user_id) {
    errors.manager_user_id = ['Selecciona el responsable del taller.']
  }

  if (!form.name.trim()) {
    errors.name = ['El nombre del taller es obligatorio.']
  }

  if (!form.code.trim()) {
    errors.code = ['El código del taller es obligatorio.']
  }

  if (form.vehicle_system_ids.length === 0) {
    errors.vehicle_system_ids = ['Selecciona al menos un sistema atendido.']
  }

  if (!validateSchedule()) {
    errors.weekly_schedule = ['Cada día debe tener un horario válido de apertura y cierre.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Revisa los campos marcados antes de continuar.'
    return false
  }

  return true
}

const nullableText = (value: string) => value.trim() || null

const buildPayload = (): WorkshopPayload => ({
  manager_user_id: Number(form.manager_user_id),
  name: form.name.trim(),
  code: form.code.trim().toUpperCase(),
  address: nullableText(form.address),
  city: nullableText(form.city),
  phone: nullableText(form.phone),
  email: nullableText(form.email)?.toLowerCase() || null,
  weekly_schedule: form.weekly_schedule,
  vehicle_system_ids: form.vehicle_system_ids,
  technician_user_ids: form.technician_user_ids,
  is_active: form.is_active,
})

const submitForm = async () => {
  resetErrors()

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const workshop = isEditing.value
      ? await workshopsApi.update(workshopId.value, buildPayload())
      : await workshopsApi.create(buildPayload())

    await router.push({ name: 'workshops-detail', params: { id: workshop.id } })
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

watch(
  () => route.fullPath,
  () => {
    resetForm()
    resetErrors()

    if (isEditing.value) {
      void loadWorkshop()
    }
  },
  { immediate: true },
)

void loadOptions()
</script>

<template>
  <div class="workshops-shell workshop-form-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      :context="pageTitle"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="workshops-main">
      <div class="workshops-content vehicle-form-content">
        <div class="workshop-breadcrumbs">
          <router-link :to="{ name: 'workshops' }">Talleres</router-link>
          <v-icon :icon="mdiArrowLeft" class="workshop-breadcrumbs__arrow" size="14" />
          <span>{{ pageTitle }}</span>
        </div>

        <header class="vehicle-form-header">
          <div>
            <span class="page-date">Gestión de talleres</span>
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageSubtitle }}</p>
          </div>
          <v-btn :to="backRoute" class="workshops-refresh" height="42" variant="outlined">
            <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
            Cancelar
          </v-btn>
        </header>

        <v-alert v-if="formError || loadError" class="vehicle-form-alert" type="error" variant="tonal">
          <span>{{ formError || loadError }}</span>
          <template #append>
            <v-btn
              v-if="loadError && !saving"
              size="small"
              variant="text"
              @click="loadWorkshop"
            >
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
            <v-btn
              v-else-if="optionsError && !saving"
              size="small"
              variant="text"
              @click="loadOptions"
            >
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar catálogos
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="vehicle-form-loading">
          <v-skeleton-loader type="article, article" />
        </section>

        <section v-else-if="!loadError || !isEditing" class="vehicle-form-layout">
          <form class="vehicle-form-card workshop-form-card" @submit.prevent="submitForm">
            <div class="vehicle-form-card__heading">
              <span class="vehicle-form-card__icon">
                <v-icon :icon="mdiGarageVariant" size="20" />
              </span>
              <div>
                <h2>Configuración del taller</h2>
                <p>Define los datos principales y las capacidades del centro de servicio.</p>
              </div>
            </div>

            <v-autocomplete
              v-model="form.manager_user_id"
              :error-messages="fieldError('manager_user_id')"
              item-title="title"
              item-value="id"
              label="Responsable del taller"
              :items="managerOptions"
              :loading="loadingOptions"
              placeholder="Selecciona un administrador de taller"
              :prepend-inner-icon="mdiAccountGroupOutline"
              clearable
              variant="outlined"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
              </template>
            </v-autocomplete>

            <div class="vehicle-form-fields">
              <v-text-field
                v-model="form.name"
                :error-messages="fieldError('name')"
                label="Nombre comercial"
                maxlength="255"
                placeholder="Ej. Taller Norte"
                required
                variant="outlined"
              />
              <v-text-field
                v-model="form.code"
                :error-messages="fieldError('code')"
                label="Código"
                maxlength="100"
                placeholder="Ej. TALLER-NORTE"
                required
                variant="outlined"
              />
              <v-text-field v-model="form.city" label="Ciudad" maxlength="255" :prepend-inner-icon="mdiMapMarkerOutline" variant="outlined" />
              <v-text-field v-model="form.address" label="Dirección" maxlength="500" variant="outlined" />
              <v-text-field v-model="form.phone" label="Teléfono" maxlength="50" :prepend-inner-icon="mdiPhoneOutline" variant="outlined" />
              <v-text-field v-model="form.email" label="Correo operativo" maxlength="255" type="email" :prepend-inner-icon="mdiEmailOutline" variant="outlined" />
            </div>

            <v-autocomplete
              v-model="form.vehicle_system_ids"
              :error-messages="fieldError('vehicle_system_ids')"
              item-title="title"
              item-value="id"
              label="Sistemas atendidos"
              :items="systemOptions"
              :loading="loadingOptions"
              multiple
              chips
              closable-chips
              placeholder="Selecciona las especialidades del taller"
              :prepend-inner-icon="mdiWrenchCogOutline"
              variant="outlined"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
              </template>
            </v-autocomplete>

            <div class="workshop-form-section-heading">
              <div>
                <h3>Horario operativo</h3>
                <p>Define el horario de atención para cada día de la semana.</p>
              </div>
              <v-icon :icon="mdiCalendarClockOutline" color="#3158e7" size="20" />
            </div>

            <div class="workshop-schedule-fields">
              <div v-for="day in dayOptions" :key="day.key" class="workshop-schedule-field">
                <strong>{{ day.label }}</strong>
                <div>
                  <v-text-field v-model="form.weekly_schedule[day.key]!.opens_at" hide-details label="Abre" type="time" variant="outlined" />
                  <v-text-field v-model="form.weekly_schedule[day.key]!.closes_at" hide-details label="Cierra" type="time" variant="outlined" />
                </div>
              </div>
            </div>
            <p v-if="fieldError('weekly_schedule')" class="workshop-form-field-error">{{ fieldError('weekly_schedule') }}</p>

            <v-autocomplete
              v-model="form.technician_user_ids"
              item-title="title"
              item-value="id"
              label="Técnicos asignados"
              :items="technicianOptions"
              :loading="loadingOptions"
              multiple
              chips
              closable-chips
              placeholder="Selecciona técnicos disponibles"
              :prepend-inner-icon="mdiAccountGroupOutline"
              variant="outlined"
            />

            <v-switch
              v-model="form.is_active"
              color="primary"
              hide-details
              inset
              label="Taller activo para nuevas operaciones"
            />

            <div class="vehicle-form-actions">
              <v-btn :to="backRoute" variant="text">Cancelar</v-btn>
              <v-btn color="primary" :loading="saving" type="submit">
                <v-icon :icon="submitIcon" class="mr-2" size="17" />
                {{ submitLabel }}
              </v-btn>
            </div>
          </form>

          <aside class="vehicle-form-aside">
            <span class="vehicle-form-aside__icon">
              <v-icon :icon="mdiCheckCircleOutline" size="21" />
            </span>
            <h2>Operación preparada</h2>
            <p>Una configuración completa permite asignar órdenes al taller con mayor precisión.</p>
            <ul>
              <li>El código se normaliza en mayúsculas.</li>
              <li>Debe existir al menos un sistema atendido.</li>
              <li>Los técnicos se asignan únicamente desde usuarios activos.</li>
            </ul>
            <span class="vehicle-form-aside__footer">
              <v-icon :icon="mdiAlertOutline" size="15" /> Los campos marcados son necesarios para guardar.
            </span>
          </aside>
        </section>

        <section v-else class="vehicle-form-loading">
          <v-icon :icon="mdiAlertOutline" color="error" size="28" />
          <p>No fue posible cargar el taller seleccionado.</p>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/workshop-form.scss" lang="scss"></style>

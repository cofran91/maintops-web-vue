<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountCircleOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCarMultiple,
  mdiCheckCircleOutline,
  mdiContentSaveOutline,
  mdiPlus,
  mdiRefresh,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError, type ApiError } from '@/api/errors'
import ownersApi from '@/modules/owners/services/ownersService'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
import { useAuthStore } from '@/stores/auth'
import type { Owner } from '@/types/owner'
import type { Vehicle, VehiclePayload } from '@/types/vehicle'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loading = ref(false)
const loadingOwners = ref(false)
const optionsError = ref(false)
const saving = ref(false)
const formError = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const owners = ref<Owner[]>([])

const form = reactive({
  owner_id: null as number | null,
  license_plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  odometer_km: '',
})

const isEditing = computed(() => route.name === 'vehicles-edit')
const vehicleId = computed(() => String(route.params.id ?? ''))
const pageTitle = computed(() => (isEditing.value ? 'Editar vehículo' : 'Nuevo vehículo'))
const pageSubtitle = computed(() =>
  isEditing.value
    ? 'Actualiza la información operativa de esta unidad.'
    : 'Registra una unidad para incorporarla a la flota de mantenimiento.',
)
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Registrar vehículo'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && vehicleId.value
    ? { name: 'vehicles-detail', params: { id: vehicleId.value } }
    : { name: 'vehicles' },
)
const maxYear = computed(() => new Date().getFullYear() + 1)
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
const ownerOptions = computed(() =>
  owners.value.map((owner) => ({
    ...owner,
    title: owner.name,
    subtitle: owner.email,
  })),
)

const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''

const resetForm = () => {
  form.owner_id = null
  form.license_plate = ''
  form.brand = ''
  form.model = ''
  form.year = ''
  form.color = ''
  form.odometer_km = ''
}

const resetErrors = () => {
  formError.value = ''
  validationErrors.value = {}
  optionsError.value = false
}

const fillForm = (vehicle: Vehicle) => {
  form.owner_id = vehicle.owner_id
  form.license_plate = vehicle.license_plate || ''
  form.brand = vehicle.brand || ''
  form.model = vehicle.model || ''
  form.year = vehicle.year ? String(vehicle.year) : ''
  form.color = vehicle.color || ''
  form.odometer_km = String(vehicle.odometer_km ?? '')
}

const loadOwners = async () => {
  loadingOwners.value = true
  optionsError.value = false

  try {
    owners.value = (await ownersApi.index({ is_active: true, page: 1, per_page: 100 })).items
  } catch (error) {
    optionsError.value = true
    formError.value = normalizeApiError(error).message
  } finally {
    loadingOwners.value = false
  }
}

const loadVehicle = async () => {
  if (!vehicleId.value) {
    formError.value = 'No se encontró el identificador del vehículo.'
    return
  }

  loading.value = true
  formError.value = ''

  try {
    fillForm(await vehiclesApi.show(vehicleId.value))
  } catch (error) {
    formError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const isIntegerInRange = (value: string, minimum: number, maximum?: number) => {
  if (value.trim() === '') {
    return true
  }

  const number = Number(value)

  return Number.isInteger(number) && number >= minimum && (maximum === undefined || number <= maximum)
}

const validateForm = () => {
  const errors: Record<string, string[]> = {}

  if (!form.owner_id) {
    errors.owner_id = ['Selecciona un propietario activo.']
  }

  if (!form.license_plate.trim()) {
    errors.license_plate = ['La placa es obligatoria.']
  }

  if (!isIntegerInRange(form.year, 1900, maxYear.value)) {
    errors.year = [`El año debe estar entre 1900 y ${maxYear.value}.`]
  }

  if (!isIntegerInRange(form.odometer_km, 0)) {
    errors.odometer_km = ['El kilometraje debe ser un número entero mayor o igual a cero.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Revisa los campos marcados antes de continuar.'
    return false
  }

  return true
}

const nullableText = (value: string) => value.trim() || null

const buildPayload = (): VehiclePayload => ({
  owner_id: Number(form.owner_id),
  license_plate: form.license_plate.trim(),
  brand: nullableText(form.brand),
  model: nullableText(form.model),
  year: form.year.trim() ? Number(form.year) : null,
  color: nullableText(form.color),
  odometer_km: Number(form.odometer_km),
})

const submitForm = async () => {
  resetErrors()

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const vehicle = isEditing.value
      ? await vehiclesApi.update(vehicleId.value, buildPayload())
      : await vehiclesApi.create(buildPayload())

    await router.push({ name: 'vehicles-detail', params: { id: vehicle.id } })
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
      void loadVehicle()
    }
  },
  { immediate: true },
)

onMounted(() => {
  void loadOwners()
})
</script>

<template>
  <div class="vehicles-shell vehicle-form-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      :context="pageTitle"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="vehicles-main">
      <div class="vehicles-content vehicle-form-content">
        <div class="vehicle-breadcrumbs">
          <router-link :to="{ name: 'vehicles' }">Vehículos</router-link>
          <v-icon :icon="mdiArrowLeft" class="vehicle-breadcrumbs__arrow" size="14" />
          <span>{{ pageTitle }}</span>
        </div>

        <header class="vehicle-form-header">
          <div>
            <span class="page-date">Gestión de flota</span>
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageSubtitle }}</p>
          </div>
          <v-btn :to="backRoute" class="vehicles-refresh" height="42" variant="outlined">
            <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
            Cancelar
          </v-btn>
        </header>

        <v-alert v-if="formError" class="vehicle-form-alert" type="error" variant="tonal">
          <span>{{ formError }}</span>
          <template #append>
            <v-btn
              v-if="optionsError && !saving"
              size="small"
              variant="text"
              @click="loadOwners"
            >
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="vehicle-form-loading">
          <v-skeleton-loader type="article, article" />
        </section>

        <section v-else class="vehicle-form-layout">
          <form class="vehicle-form-card" @submit.prevent="submitForm">
            <div class="vehicle-form-card__heading">
              <span class="vehicle-form-card__icon">
                <v-icon :icon="mdiCarMultiple" size="20" />
              </span>
              <div>
                <h2>Información de la unidad</h2>
                <p>Completa los datos que identifican y describen el vehículo.</p>
              </div>
            </div>

            <v-autocomplete
              v-model="form.owner_id"
              :error-messages="fieldError('owner_id')"
              item-title="title"
              item-value="id"
              label="Propietario"
              :items="ownerOptions"
              :loading="loadingOwners"
              placeholder="Selecciona un propietario activo"
              :prepend-inner-icon="mdiAccountCircleOutline"
              clearable
              variant="outlined"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
              </template>
            </v-autocomplete>

            <div class="vehicle-form-fields">
              <v-text-field
                v-model="form.license_plate"
                :error-messages="fieldError('license_plate')"
                label="Placa"
                maxlength="30"
                placeholder="Ej. ABC123"
                required
                variant="outlined"
              />
              <v-text-field v-model="form.brand" label="Marca" maxlength="100" variant="outlined" />
              <v-text-field v-model="form.model" label="Modelo" maxlength="100" variant="outlined" />
              <v-text-field
                v-model="form.year"
                :error-messages="fieldError('year')"
                label="Año"
                min="1900"
                :max="maxYear"
                type="number"
                variant="outlined"
              />
              <v-text-field v-model="form.color" label="Color" maxlength="80" variant="outlined" />
              <v-text-field
                v-model="form.odometer_km"
                :error-messages="fieldError('odometer_km')"
                label="Kilometraje actual"
                min="0"
                type="number"
                variant="outlined"
              />
            </div>

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
            <h2>Datos confiables de la flota</h2>
            <p>Una ficha completa facilita la programación y el seguimiento del mantenimiento.</p>
            <ul>
              <li>La placa se guarda en mayúsculas.</li>
              <li>Solo se pueden asociar propietarios activos.</li>
              <li>El kilometraje debe reflejar el último registro disponible.</li>
            </ul>
            <span class="vehicle-form-aside__footer">
              <v-icon :icon="mdiAlertOutline" size="15" /> Los campos marcados son necesarios para guardar.
            </span>
          </aside>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/vehicle-form.scss" lang="scss"></style>

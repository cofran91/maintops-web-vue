<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAccountGroupOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCarMultiple,
  mdiCheckCircleOutline,
  mdiPlus,
  mdiRefresh,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError, type ApiError } from '@/api/errors'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
import usersApi from '@/modules/users/services/usersService'
import { useAuthStore } from '@/stores/auth'
import type {
  MaintenanceOrderPerson,
  MaintenanceOrderVehicle,
} from '@/types/maintenanceOrder'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loadingOptions = ref(false)
const optionsError = ref(false)
const saving = ref(false)
const formError = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const vehicles = ref<MaintenanceOrderVehicle[]>([])
const advisors = ref<MaintenanceOrderPerson[]>([])

const form = reactive<{ vehicle_id: number | null; advisor_id: number | null }>({
  vehicle_id: null,
  advisor_id: null,
})

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const isSystemAdmin = computed(() =>
  (authStore.user?.roles ?? []).some((role) => ['super_admin', 'admin'].includes(role)),
)

const vehicleOptions = computed(() =>
  vehicles.value.map((vehicle) => ({
    ...vehicle,
    title: [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' '),
    subtitle: 'Disponible para crear una nueva orden',
  })),
)

const advisorOptions = computed(() =>
  advisors.value.map((advisor) => ({
    ...advisor,
    title: advisor.name || 'Asesor sin nombre',
    subtitle: advisor.email || 'Sin correo registrado',
  })),
)

const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''

const loadOptions = async () => {
  loadingOptions.value = true
  optionsError.value = false
  formError.value = ''

  try {
    const vehicleRequest = vehiclesApi.index()
    const advisorRequest = isSystemAdmin.value ? usersApi.advisors() : Promise.resolve(null)
    const [vehiclePage, advisorPage] = await Promise.all([vehicleRequest, advisorRequest])

    vehicles.value = vehiclePage.items
    advisors.value = advisorPage?.items ?? []
  } catch (error) {
    optionsError.value = true
    formError.value = normalizeApiError(error).message
  } finally {
    loadingOptions.value = false
  }
}

const validateForm = () => {
  const errors: Record<string, string[]> = {}

  if (!form.vehicle_id) {
    errors.vehicle_id = ['Selecciona un vehículo para continuar.']
  }

  if (isSystemAdmin.value && !form.advisor_id) {
    errors.advisor_id = ['Selecciona el asesor responsable de la orden.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Revisa los campos marcados antes de continuar.'
    return false
  }

  return true
}

const submitForm = async () => {
  formError.value = ''
  validationErrors.value = {}

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const payload = {
      vehicle_id: Number(form.vehicle_id),
      ...(isSystemAdmin.value ? { advisor_id: Number(form.advisor_id) } : {}),
    }
    const savedOrder = await maintenanceOrdersApi.create(payload)

    await router.push({ name: 'orders-detail', params: { id: savedOrder.id } })
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

onMounted(() => {
  void loadOptions()
})
</script>

<template>
  <div class="orders-shell order-form-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Nueva orden"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="orders-main">
      <div class="orders-content order-form-content">
        <div class="detail-breadcrumbs">
          <router-link :to="{ name: 'orders' }">Órdenes de mantenimiento</router-link>
          <v-icon :icon="mdiArrowLeft" class="detail-breadcrumbs__arrow" size="14" />
          <span>Nueva orden</span>
        </div>

        <header class="order-form-header">
          <div>
            <span class="page-date">Nueva orden de trabajo</span>
            <h1>Crear una orden</h1>
            <p>Registra un vehículo para iniciar su proceso de mantenimiento.</p>
          </div>
          <v-btn :to="{ name: 'orders' }" class="orders-refresh" height="42" variant="outlined">
            <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
            Cancelar
          </v-btn>
        </header>

        <v-alert v-if="formError" class="form-alert" type="error" variant="tonal">
          <span>{{ formError }}</span>
          <template #append>
            <v-btn
              v-if="optionsError && !saving"
              size="small"
              variant="text"
              @click="loadOptions"
            >
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section class="order-form-layout">
          <form class="order-form-card" @submit.prevent="submitForm">
            <div class="order-form-card__heading">
              <span class="order-form-card__icon order-form-card__icon--blue">
                <v-icon :icon="mdiCarMultiple" size="20" />
              </span>
              <div>
                <h2>Información inicial</h2>
                <p>Completa los datos mínimos para crear la orden.</p>
              </div>
            </div>

            <v-autocomplete
              v-model="form.vehicle_id"
              :error-messages="fieldError('vehicle_id')"
              item-title="title"
              item-value="id"
              label="Vehículo"
              :items="vehicleOptions"
              :loading="loadingOptions"
              placeholder="Busca por placa, marca o modelo"
              :prepend-inner-icon="mdiCarMultiple"
              clearable
              variant="outlined"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
              </template>
            </v-autocomplete>

            <v-autocomplete
              v-if="isSystemAdmin"
              v-model="form.advisor_id"
              :error-messages="fieldError('advisor_id')"
              item-title="title"
              item-value="id"
              label="Asesor responsable"
              :items="advisorOptions"
              :loading="loadingOptions"
              placeholder="Selecciona un asesor"
              :prepend-inner-icon="mdiAccountGroupOutline"
              clearable
              variant="outlined"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
              </template>
            </v-autocomplete>

            <v-alert class="form-info" type="info" variant="tonal">
              La orden se creará en estado <strong>Creada</strong>. Los trabajos se agregarán en el siguiente paso operativo.
            </v-alert>

            <div class="order-form-actions">
              <v-btn :to="{ name: 'orders' }" variant="text">Cancelar</v-btn>
              <v-btn
                color="primary"
                :disabled="loadingOptions"
                :loading="saving"
                type="submit"
              >
                <v-icon :icon="mdiPlus" class="mr-2" size="17" />
                Crear orden
              </v-btn>
            </div>
          </form>

          <aside class="order-form-aside">
            <div class="order-form-aside__icon">
              <v-icon :icon="mdiCheckCircleOutline" size="21" />
            </div>
            <h2>Antes de comenzar</h2>
            <p>Verifica que el vehículo no tenga otra orden de mantenimiento abierta.</p>
            <ul>
              <li>El vehículo debe estar activo.</li>
              <li>La orden se asignará a tu usuario si no eres administrador.</li>
              <li>Podrás revisar el detalle después de crearla.</li>
            </ul>
            <div class="order-form-aside__footer">
              <v-icon :icon="mdiAlertOutline" size="15" />
              Los permisos se validan en el servidor.
            </div>
          </aside>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/order-form.scss" lang="scss"></style>

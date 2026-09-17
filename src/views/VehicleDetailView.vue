<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountCircleOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarOutline,
  mdiCarMultiple,
  mdiClockOutline,
  mdiEmailOutline,
  mdiMapMarkerOutline,
  mdiPencilOutline,
  mdiPhoneOutline,
  mdiRefresh,
  mdiSpeedometer,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useVehicleDetail } from '@/modules/vehicles/composables/useVehicleDetail'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const vehicleId = computed(() => String(route.params.id ?? ''))

const { errorMessage, fetchVehicle, loading, vehicle } = useVehicleDetail(vehicleId)

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const vehicleTitle = computed(() => vehicle.value?.license_plate || 'Detalle de vehículo')
const vehicleDescription = computed(() =>
  vehicle.value
    ? [vehicle.value.brand, vehicle.value.model].filter(Boolean).join(' ') || 'Sin descripción'
    : 'Información general de la unidad',
)

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Sin registrar'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const formatKilometers = (value?: number | null) =>
  value === null || value === undefined
    ? 'Sin registrar'
    : `${new Intl.NumberFormat('es-CO').format(value)} km`

const ownerName = computed(() => vehicle.value?.owner?.name || `Propietario ${vehicle.value?.owner_id ?? ''}`)

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="vehicles-shell vehicle-detail-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Detalle de vehículo"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="vehicles-main">
      <div class="vehicles-content vehicle-detail-content">
        <div class="vehicle-breadcrumbs">
          <router-link :to="{ name: 'vehicles' }">Vehículos</router-link>
          <v-icon :icon="mdiArrowLeft" class="vehicle-breadcrumbs__arrow" size="14" />
          <span>{{ vehicleTitle }}</span>
        </div>

        <header class="vehicle-detail-header">
          <div>
            <span class="page-date">Unidad de la flota</span>
            <h1>{{ vehicleTitle }}</h1>
            <p>Consulta la información registrada y los datos del propietario.</p>
          </div>
          <v-btn
            :to="{ name: 'vehicles' }"
            class="vehicles-refresh"
            height="42"
            variant="outlined"
          >
            <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
            Volver al listado
          </v-btn>
          <v-btn
            v-if="vehicle"
            color="primary"
            height="42"
            :to="{ name: 'vehicles-edit', params: { id: vehicle.id } }"
          >
            <v-icon :icon="mdiPencilOutline" class="mr-2" size="17" />
            Editar vehículo
          </v-btn>
        </header>

        <v-alert v-if="errorMessage" class="vehicles-alert vehicle-detail-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append>
            <v-btn :loading="loading" size="small" variant="text" @click="fetchVehicle">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="vehicle-detail-loading">
          <v-skeleton-loader type="article, table-tbody" />
        </section>

        <section v-else-if="!vehicle" class="vehicle-detail-empty">
          <v-icon :icon="mdiAlertOutline" color="error" size="34" />
          <strong>No fue posible encontrar este vehículo</strong>
          <span>Regresa al listado para seleccionar otra unidad de la flota.</span>
          <v-btn color="primary" :to="{ name: 'vehicles' }">Ver vehículos</v-btn>
        </section>

        <template v-else>
          <section class="vehicle-detail-hero">
            <div class="vehicle-detail-hero__identity">
              <span class="vehicle-detail-hero__icon">
                <v-icon :icon="mdiCarMultiple" size="28" />
              </span>
              <div>
                <span class="vehicle-detail-overline">Vehículo registrado</span>
                <h2>{{ vehicle.license_plate }}</h2>
                <p>{{ vehicleDescription }}</p>
              </div>
            </div>
            <div class="vehicle-detail-hero__stat">
              <span class="vehicle-detail-overline">Propietario</span>
              <strong>{{ ownerName }}</strong>
              <span>{{ vehicle.owner?.email || 'Sin correo registrado' }}</span>
            </div>
            <div class="vehicle-detail-hero__stat">
              <span class="vehicle-detail-overline">Kilometraje actual</span>
              <strong>{{ formatKilometers(vehicle.odometer_km) }}</strong>
              <span>Último registro disponible</span>
            </div>
          </section>

          <section class="vehicle-detail-grid">
            <article class="vehicle-detail-card">
              <div class="vehicle-detail-card__heading">
                <span class="vehicle-detail-card__icon vehicle-detail-card__icon--blue">
                  <v-icon :icon="mdiCarMultiple" size="18" />
                </span>
                <div><h2>Información del vehículo</h2><p>Características de la unidad</p></div>
              </div>
              <dl class="vehicle-definition-list">
                <div><dt>Placa</dt><dd>{{ vehicle.license_plate }}</dd></div>
                <div><dt>Marca</dt><dd>{{ vehicle.brand || 'Sin registrar' }}</dd></div>
                <div><dt>Modelo</dt><dd>{{ vehicle.model || 'Sin registrar' }}</dd></div>
                <div><dt>Año</dt><dd>{{ vehicle.year || 'Sin registrar' }}</dd></div>
                <div><dt>Color</dt><dd>{{ vehicle.color || 'Sin registrar' }}</dd></div>
                <div><dt>Kilometraje</dt><dd>{{ formatKilometers(vehicle.odometer_km) }}</dd></div>
              </dl>
            </article>

            <article class="vehicle-detail-card">
              <div class="vehicle-detail-card__heading">
                <span class="vehicle-detail-card__icon vehicle-detail-card__icon--teal">
                  <v-icon :icon="mdiAccountCircleOutline" size="18" />
                </span>
                <div><h2>Información del propietario</h2><p>Datos de contacto asociados</p></div>
              </div>
              <dl class="vehicle-definition-list">
                <div><dt>Nombre</dt><dd>{{ ownerName }}</dd></div>
                <div><dt>Correo</dt><dd>{{ vehicle.owner?.email || 'Sin registrar' }}</dd></div>
                <div><dt>Teléfono</dt><dd>{{ vehicle.owner?.phone || 'Sin registrar' }}</dd></div>
              </dl>
              <div class="vehicle-owner-contact">
                <span><v-icon :icon="mdiEmailOutline" size="15" /> Contacto asociado a la unidad</span>
                <span v-if="vehicle.owner?.phone"><v-icon :icon="mdiPhoneOutline" size="15" /> {{ vehicle.owner.phone }}</span>
                <span v-else><v-icon :icon="mdiMapMarkerOutline" size="15" /> Información de contacto pendiente</span>
              </div>
            </article>
          </section>

          <section class="vehicle-detail-meta">
            <span><v-icon :icon="mdiCalendarOutline" size="15" /> Creado {{ formatDateTime(vehicle.created_at) }}</span>
            <span><v-icon :icon="mdiClockOutline" size="15" /> Última actualización {{ formatDateTime(vehicle.updated_at) }}</span>
            <span><v-icon :icon="mdiSpeedometer" size="15" /> Registro de flota activo</span>
          </section>
        </template>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/vehicle-detail.scss" lang="scss"></style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountGroupOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarClockOutline,
  mdiCalendarOutline,
  mdiClockOutline,
  mdiEmailOutline,
  mdiGarageVariant,
  mdiMapMarkerOutline,
  mdiPencilOutline,
  mdiPhoneOutline,
  mdiRefresh,
  mdiWrenchCogOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkshopDetail } from '@/modules/workshops/composables/useWorkshopDetail'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const workshopId = computed(() => String(route.params.id ?? ''))

const { errorMessage, fetchWorkshop, loading, workshop } = useWorkshopDetail(workshopId)

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const workshopTitle = computed(() => workshop.value?.name || 'Detalle de taller')
const statusLabel = computed(() => (workshop.value?.is_active ? 'Activo' : 'Inactivo'))
const statusColor = computed(() => (workshop.value?.is_active ? '#239878' : '#7c8ba6'))
const managerName = computed(() => workshop.value?.manager?.name || `Usuario ${workshop.value?.manager_user_id ?? ''}`)

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Sin registrar'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const scheduleDays: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

const scheduleEntries = computed(() =>
  Object.entries(workshop.value?.weekly_schedule || {}).map(([day, schedule]) => ({
    day: scheduleDays[day] || day,
    opensAt: schedule.opens_at,
    closesAt: schedule.closes_at,
  })),
)

const systemName = (system: { id: number; code?: string | null; name?: string | null }) =>
  system.name || system.code || `Sistema ${system.id}`

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="workshops-shell workshop-detail-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Detalle de taller"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="workshops-main">
      <div class="workshops-content workshop-detail-content">
        <div class="workshop-breadcrumbs">
          <router-link :to="{ name: 'workshops' }">Talleres</router-link>
          <v-icon :icon="mdiArrowLeft" class="workshop-breadcrumbs__arrow" size="14" />
          <span>{{ workshopTitle }}</span>
        </div>

        <header class="workshop-detail-header">
          <div>
            <span class="page-date">Centro de servicio</span>
            <h1>{{ workshopTitle }}</h1>
            <p>Consulta la capacidad operativa, contacto y horario de este taller.</p>
          </div>
          <div class="workshop-detail-header__actions">
            <v-btn :to="{ name: 'workshops' }" class="workshops-refresh" height="42" variant="outlined">
              <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
              Volver al listado
            </v-btn>
            <v-btn
              v-if="workshop"
              color="primary"
              height="42"
              :to="{ name: 'workshops-edit', params: { id: workshop.id } }"
            >
              <v-icon :icon="mdiPencilOutline" class="mr-2" size="17" />
              Editar taller
            </v-btn>
          </div>
        </header>

        <v-alert v-if="errorMessage" class="workshops-alert workshop-detail-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append>
            <v-btn :loading="loading" size="small" variant="text" @click="fetchWorkshop">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="workshop-detail-loading">
          <v-skeleton-loader type="article, table-tbody" />
        </section>

        <section v-else-if="!workshop" class="workshop-detail-empty">
          <v-icon :icon="mdiAlertOutline" color="error" size="34" />
          <strong>No fue posible encontrar este taller</strong>
          <span>Regresa al listado para seleccionar otro centro de servicio.</span>
          <v-btn color="primary" :to="{ name: 'workshops' }">Ver talleres</v-btn>
        </section>

        <template v-else>
          <section class="workshop-detail-hero">
            <div class="workshop-detail-hero__identity">
              <span class="workshop-detail-hero__icon"><v-icon :icon="mdiGarageVariant" size="28" /></span>
              <div>
                <span class="workshop-detail-overline">Taller registrado</span>
                <h2>{{ workshop.name }}</h2>
                <p>{{ workshop.code }} · {{ workshop.city || 'Ciudad pendiente' }}</p>
              </div>
            </div>
            <div class="workshop-detail-hero__stat">
              <span class="workshop-detail-overline">Estado operativo</span>
              <v-chip label size="small" :color="statusColor" variant="tonal">{{ statusLabel }}</v-chip>
            </div>
            <div class="workshop-detail-hero__stat">
              <span class="workshop-detail-overline">Responsable</span>
              <strong>{{ managerName }}</strong>
              <span>{{ workshop.manager?.email || 'Sin correo registrado' }}</span>
            </div>
          </section>

          <section class="workshop-detail-grid">
            <article class="workshop-detail-card">
              <div class="workshop-detail-card__heading">
                <span class="workshop-detail-card__icon workshop-detail-card__icon--blue"><v-icon :icon="mdiMapMarkerOutline" size="18" /></span>
                <div><h2>Ubicación y contacto</h2><p>Datos principales del centro de servicio</p></div>
              </div>
              <dl class="workshop-definition-list">
                <div><dt>Ciudad</dt><dd>{{ workshop.city || 'Sin registrar' }}</dd></div>
                <div><dt>Dirección</dt><dd>{{ workshop.address || 'Sin registrar' }}</dd></div>
                <div><dt>Teléfono</dt><dd>{{ workshop.phone || 'Sin registrar' }}</dd></div>
                <div><dt>Correo</dt><dd>{{ workshop.email || 'Sin registrar' }}</dd></div>
              </dl>
              <div class="workshop-contact-footer">
                <span><v-icon :icon="mdiPhoneOutline" size="15" /> {{ workshop.phone || 'Teléfono pendiente' }}</span>
                <span><v-icon :icon="mdiEmailOutline" size="15" /> {{ workshop.email || 'Correo pendiente' }}</span>
              </div>
            </article>

            <article class="workshop-detail-card">
              <div class="workshop-detail-card__heading">
                <span class="workshop-detail-card__icon workshop-detail-card__icon--teal"><v-icon :icon="mdiWrenchCogOutline" size="18" /></span>
                <div><h2>Sistemas atendidos</h2><p>Especialidades disponibles en el taller</p></div>
              </div>
              <div v-if="workshop.vehicle_systems?.length" class="workshop-system-list">
                <v-chip v-for="system in workshop.vehicle_systems" :key="system.id" label size="small" variant="tonal">
                  {{ systemName(system) }}
                </v-chip>
              </div>
              <div v-else class="workshop-card-empty">No hay sistemas asignados.</div>
              <div class="workshop-technicians-summary">
                <v-icon :icon="mdiAccountGroupOutline" size="17" />
                <span><strong>{{ workshop.technicians?.length ?? 0 }}</strong> técnicos asignados</span>
              </div>
            </article>

            <article class="workshop-detail-card workshop-schedule-card">
              <div class="workshop-detail-card__heading">
                <span class="workshop-detail-card__icon workshop-detail-card__icon--amber"><v-icon :icon="mdiCalendarClockOutline" size="18" /></span>
                <div><h2>Horario operativo</h2><p>Disponibilidad semanal registrada</p></div>
              </div>
              <div v-if="scheduleEntries.length" class="workshop-schedule-list">
                <div v-for="entry in scheduleEntries" :key="entry.day"><strong>{{ entry.day }}</strong><span>{{ entry.opensAt }} — {{ entry.closesAt }}</span></div>
              </div>
              <div v-else class="workshop-card-empty">Horario pendiente de configurar.</div>
            </article>

            <article class="workshop-detail-card">
              <div class="workshop-detail-card__heading">
                <span class="workshop-detail-card__icon workshop-detail-card__icon--slate"><v-icon :icon="mdiAccountGroupOutline" size="18" /></span>
                <div><h2>Equipo asignado</h2><p>Técnicos disponibles para la atención</p></div>
              </div>
              <div v-if="workshop.technicians?.length" class="workshop-technician-list">
                <div v-for="technician in workshop.technicians" :key="technician.id"><strong>{{ technician.name || `Usuario ${technician.id}` }}</strong><span>{{ technician.email || 'Sin correo registrado' }}</span></div>
              </div>
              <div v-else class="workshop-card-empty">No hay técnicos asignados.</div>
            </article>
          </section>

          <section class="workshop-detail-meta">
            <span><v-icon :icon="mdiCalendarOutline" size="15" /> Creado {{ formatDateTime(workshop.created_at) }}</span>
            <span><v-icon :icon="mdiClockOutline" size="15" /> Última actualización {{ formatDateTime(workshop.updated_at) }}</span>
          </section>
        </template>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/workshop-detail.scss" lang="scss"></style>

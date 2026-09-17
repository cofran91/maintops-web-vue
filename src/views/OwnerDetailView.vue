<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountCircleOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCalendarOutline,
  mdiClockOutline,
  mdiEmailOutline,
  mdiMapMarkerOutline,
  mdiPencilOutline,
  mdiPhoneOutline,
  mdiRefresh,
  mdiTrashCanOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useOwnerDetail } from '@/modules/owners/composables/useOwnerDetail'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const ownerId = computed(() => String(route.params.id ?? ''))
const canUpdateOwner = computed(() => authStore.canUseResource('owners', 'update'))
const canDeleteOwner = computed(() => authStore.canUseResource('owners', 'delete'))

const {
  deleteDialogOpen,
  deleteOwner,
  deleting,
  errorMessage,
  fetchOwner,
  loading,
  owner,
} = useOwnerDetail(ownerId)

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const ownerTitle = computed(() => owner.value?.name || 'Detalle de propietario')
const statusLabel = computed(() => (owner.value?.is_active ? 'Activo' : 'Inactivo'))
const statusColor = computed(() => (owner.value?.is_active ? '#239878' : '#7c8ba6'))

const confirmDelete = async () => {
  const deleted = await deleteOwner()

  if (deleted) {
    await router.replace({ name: 'owners' })
  }
}

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Sin registrar'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="owners-shell owner-detail-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Detalle de propietario"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="owners-main">
      <div class="owners-content owner-detail-content">
        <div class="owner-breadcrumbs">
          <router-link :to="{ name: 'owners' }">Propietarios</router-link>
          <v-icon :icon="mdiArrowLeft" class="owner-breadcrumbs__arrow" size="14" />
          <span>{{ ownerTitle }}</span>
        </div>

        <header class="owner-detail-header">
          <div>
            <span class="page-date">Contacto de flota</span>
            <h1>{{ ownerTitle }}</h1>
            <p>Consulta los datos de contacto y disponibilidad del propietario.</p>
          </div>
          <div class="owner-detail-header__actions">
            <v-btn :to="{ name: 'owners' }" class="owners-refresh" height="42" variant="outlined">
              <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
              Volver al listado
            </v-btn>
            <v-btn
              v-if="owner && canUpdateOwner"
              color="primary"
              height="42"
              :to="{ name: 'owners-edit', params: { id: owner.id } }"
            >
              <v-icon :icon="mdiPencilOutline" class="mr-2" size="17" />
              Editar propietario
            </v-btn>
            <v-btn
              v-if="owner && canDeleteOwner"
              color="error"
              height="42"
              variant="tonal"
              @click="deleteDialogOpen = true"
            >
              <v-icon :icon="mdiTrashCanOutline" class="mr-2" size="17" />
              Eliminar
            </v-btn>
          </div>
        </header>

        <v-alert v-if="errorMessage" class="owners-alert owner-detail-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append>
            <v-btn :loading="loading" size="small" variant="text" @click="fetchOwner">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="owner-detail-loading">
          <v-skeleton-loader type="article, table-tbody" />
        </section>

        <section v-else-if="!owner" class="owner-detail-empty">
          <v-icon :icon="mdiAlertOutline" color="error" size="34" />
          <strong>No fue posible encontrar este propietario</strong>
          <span>Regresa al listado para seleccionar otro contacto de la flota.</span>
          <v-btn color="primary" :to="{ name: 'owners' }">Ver propietarios</v-btn>
        </section>

        <template v-else>
          <section class="owner-detail-hero">
            <div class="owner-detail-hero__identity">
              <span class="owner-detail-hero__avatar">{{ owner.name.slice(0, 2).toUpperCase() }}</span>
              <div>
                <span class="owner-detail-overline">Propietario registrado</span>
                <h2>{{ owner.name }}</h2>
                <p>Propietario #{{ owner.id }}</p>
              </div>
            </div>
            <div class="owner-detail-hero__stat">
              <span class="owner-detail-overline">Estado del contacto</span>
              <v-chip label size="small" :color="statusColor" variant="tonal">{{ statusLabel }}</v-chip>
            </div>
            <div class="owner-detail-hero__stat">
              <span class="owner-detail-overline">Correo principal</span>
              <strong>{{ owner.email }}</strong>
              <span>Canal de contacto registrado</span>
            </div>
          </section>

          <section class="owner-detail-grid">
            <article class="owner-detail-card">
              <div class="owner-detail-card__heading">
                <span class="owner-detail-card__icon owner-detail-card__icon--blue">
                  <v-icon :icon="mdiAccountCircleOutline" size="18" />
                </span>
                <div><h2>Datos personales</h2><p>Identificación del propietario</p></div>
              </div>
              <dl class="owner-definition-list">
                <div><dt>Nombre completo</dt><dd>{{ owner.name }}</dd></div>
                <div><dt>Documento</dt><dd>{{ owner.document_number || 'Sin registrar' }}</dd></div>
                <div><dt>Estado</dt><dd>{{ statusLabel }}</dd></div>
              </dl>
            </article>

            <article class="owner-detail-card">
              <div class="owner-detail-card__heading">
                <span class="owner-detail-card__icon owner-detail-card__icon--teal">
                  <v-icon :icon="mdiEmailOutline" size="18" />
                </span>
                <div><h2>Información de contacto</h2><p>Canales disponibles para comunicación</p></div>
              </div>
              <dl class="owner-definition-list">
                <div><dt>Correo electrónico</dt><dd>{{ owner.email }}</dd></div>
                <div><dt>Teléfono</dt><dd>{{ owner.phone || 'Sin registrar' }}</dd></div>
                <div><dt>Dirección</dt><dd>{{ owner.address || 'Sin registrar' }}</dd></div>
              </dl>
              <div class="owner-contact-footer">
                <span><v-icon :icon="mdiPhoneOutline" size="15" /> {{ owner.phone || 'Teléfono pendiente' }}</span>
                <span><v-icon :icon="mdiMapMarkerOutline" size="15" /> {{ owner.address || 'Dirección pendiente' }}</span>
              </div>
            </article>
          </section>

          <section class="owner-detail-meta">
            <span><v-icon :icon="mdiCalendarOutline" size="15" /> Creado {{ formatDateTime(owner.created_at) }}</span>
            <span><v-icon :icon="mdiClockOutline" size="15" /> Última actualización {{ formatDateTime(owner.updated_at) }}</span>
          </section>
        </template>
      </div>
    </v-main>

    <v-dialog v-model="deleteDialogOpen" max-width="430">
      <v-card class="owner-delete-dialog">
        <v-card-title>¿Eliminar este propietario?</v-card-title>
        <v-card-text>
          {{ owner?.name }} dejará de estar disponible para nuevas asignaciones. Esta acción no se puede deshacer desde la plataforma.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="deleting" @click="deleteDialogOpen = false">Cancelar</v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">Eliminar propietario</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style src="@/styles/views/owner-detail.scss" lang="scss"></style>

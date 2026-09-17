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
  mdiPencilOutline,
  mdiPhoneOutline,
  mdiRefresh,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useUserDetail } from '@/modules/users/composables/useUserDetail'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const userId = computed(() => String(route.params.id ?? ''))

const { errorMessage, fetchUser, loading, user } = useUserDetail(userId)

const currentUserName = computed(() => authStore.user?.name || 'Juan Martínez')
const currentUserInitials = computed(() =>
  currentUserName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const roleLabels: Record<string, string> = {
  system_admin: 'Administrador',
  admin: 'Administrador',
  advisor: 'Asesor',
  workshop_manager: 'Responsable de taller',
  technician: 'Técnico',
}

const userTitle = computed(() => user.value?.name || 'Detalle de usuario')
const roleLabel = computed(() => {
  const role = user.value?.role || user.value?.roles?.[0] || ''
  return roleLabels[role] || role || 'Sin rol asignado'
})
const statusLabel = computed(() => (user.value?.is_active ? 'Activo' : 'Inactivo'))
const statusColor = computed(() => (user.value?.is_active ? '#239878' : '#7c8ba6'))
const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
  <div class="user-detail-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="currentUserInitials"
      :user-name="currentUserName"
      context="Detalle de usuario"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="user-detail-main">
      <div class="user-detail-content">
        <div class="user-breadcrumbs">
          <router-link :to="{ name: 'users' }">Usuarios</router-link>
          <v-icon :icon="mdiArrowLeft" class="user-breadcrumbs__arrow" size="14" />
          <span>{{ userTitle }}</span>
        </div>

        <header class="user-detail-header">
          <div>
            <span class="page-date">Equipo operativo</span>
            <h1>{{ userTitle }}</h1>
            <p>Consulta la información del perfil y su disponibilidad en la plataforma.</p>
          </div>
          <div class="user-detail-header__actions">
            <v-btn class="user-detail-refresh" height="42" variant="outlined" :to="{ name: 'users' }">
              <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
              Volver al listado
            </v-btn>
            <v-btn v-if="user" color="primary" height="42" :to="{ name: 'users-edit', params: { id: user.id } }">
              <v-icon :icon="mdiPencilOutline" class="mr-2" size="17" />
              Editar usuario
            </v-btn>
          </div>
        </header>

        <v-alert v-if="errorMessage" class="user-detail-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append>
            <v-btn :loading="loading" size="small" variant="text" @click="fetchUser">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="user-detail-loading">
          <v-skeleton-loader type="article, table-tbody" />
        </section>

        <section v-else-if="!user" class="user-detail-empty">
          <v-icon :icon="mdiAlertOutline" color="error" size="34" />
          <strong>No fue posible encontrar este usuario</strong>
          <span>Regresa al listado para seleccionar otro perfil del equipo.</span>
          <v-btn color="primary" :to="{ name: 'users' }">Ver usuarios</v-btn>
        </section>

        <template v-else>
          <section class="user-detail-hero">
            <div class="user-detail-hero__identity">
              <span class="user-detail-hero__avatar">{{ initials(user.name) }}</span>
              <div>
                <span class="user-detail-overline">Perfil registrado</span>
                <h2>{{ user.name }}</h2>
                <p>Usuario #{{ user.id }}</p>
              </div>
            </div>
            <div class="user-detail-hero__stat">
              <span class="user-detail-overline">Rol operativo</span>
              <strong>{{ roleLabel }}</strong>
              <span>Permisos definidos por el perfil</span>
            </div>
            <div class="user-detail-hero__stat">
              <span class="user-detail-overline">Estado de acceso</span>
              <v-chip label size="small" :color="statusColor" variant="tonal">{{ statusLabel }}</v-chip>
              <span>{{ user.email }}</span>
            </div>
          </section>

          <section class="user-detail-grid">
            <article class="user-detail-card">
              <div class="user-detail-card__heading">
                <span class="user-detail-card__icon user-detail-card__icon--blue">
                  <v-icon :icon="mdiAccountCircleOutline" size="18" />
                </span>
                <div><h2>Datos del perfil</h2><p>Identificación y rol asignado</p></div>
              </div>
              <dl class="user-definition-list">
                <div><dt>Nombre completo</dt><dd>{{ user.name }}</dd></div>
                <div><dt>Rol operativo</dt><dd>{{ roleLabel }}</dd></div>
                <div><dt>Estado</dt><dd>{{ statusLabel }}</dd></div>
              </dl>
            </article>

            <article class="user-detail-card">
              <div class="user-detail-card__heading">
                <span class="user-detail-card__icon user-detail-card__icon--teal">
                  <v-icon :icon="mdiEmailOutline" size="18" />
                </span>
                <div><h2>Información de contacto</h2><p>Canales disponibles para comunicación</p></div>
              </div>
              <dl class="user-definition-list">
                <div><dt>Correo electrónico</dt><dd>{{ user.email }}</dd></div>
                <div><dt>Teléfono</dt><dd>{{ user.phone || 'Sin registrar' }}</dd></div>
                <div><dt>Acceso</dt><dd>{{ user.is_active ? 'Habilitado' : 'Deshabilitado' }}</dd></div>
              </dl>
              <div class="user-contact-footer">
                <span><v-icon :icon="mdiPhoneOutline" size="15" /> {{ user.phone || 'Teléfono pendiente' }}</span>
                <span><v-icon :icon="mdiEmailOutline" size="15" /> {{ user.email }}</span>
              </div>
            </article>
          </section>

          <section class="user-detail-meta">
            <span><v-icon :icon="mdiCalendarOutline" size="15" /> Creado {{ formatDateTime(user.created_at) }}</span>
            <span><v-icon :icon="mdiClockOutline" size="15" /> Última actualización {{ formatDateTime(user.updated_at) }}</span>
          </section>
        </template>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/user-detail.scss" lang="scss"></style>

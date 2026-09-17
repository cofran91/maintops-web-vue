<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAccountGroupOutline,
  mdiAlertOutline,
  mdiMagnify,
  mdiPlus,
  mdiRefresh,
  mdiTuneVariant,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import RealtimePresenceDot from '@/components/layout/RealtimePresenceDot.vue'
import { useUsers } from '@/modules/users/composables/useUsers'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const canCreateUser = computed(() => authStore.canUseResource('users', 'create'))

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchUsers,
  filters,
  loading,
  pagination,
  perPage,
  updatePage,
  updatePerPage,
  users,
} = useUsers()

const roleOptions = [
  { title: 'Todos los roles', value: '' },
  { title: 'Administrador', value: 'system_admin' },
  { title: 'Asesor', value: 'advisor' },
  { title: 'Responsable de taller', value: 'workshop_manager' },
  { title: 'Técnico', value: 'technician' },
]
const statusOptions = [
  { title: 'Todos los estados', value: '' },
  { title: 'Activos', value: 'active' },
  { title: 'Inactivos', value: 'inactive' },
]
const pageSizeOptions = [10, 15, 25, 50].map((value) => ({
  title: String(value),
  value,
}))

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const todayLabel = computed(() => {
  const label = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const pageSummary = computed(() => {
  if (pagination.value.total === 0) {
    return 'No hay usuarios que coincidan con la búsqueda'
  }

  return `${pagination.value.total} ${pagination.value.total === 1 ? 'usuario registrado' : 'usuarios registrados'}`
})

const roleLabels: Record<string, string> = {
  system_admin: 'Administrador',
  admin: 'Administrador',
  advisor: 'Asesor',
  workshop_manager: 'Responsable de taller',
  technician: 'Técnico',
}

const roleLabel = (user: User) => {
  const role = user.role || user.roles?.[0] || ''
  return roleLabels[role] || role || 'Sin rol asignado'
}

const statusLabel = (user: User) => (user.is_active ? 'Activo' : 'Inactivo')
const statusColor = (user: User) => (user.is_active ? '#239878' : '#7c8ba6')
const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
const phoneLabel = (user: User) => user.phone || 'Sin teléfono registrado'

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="users-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Usuarios"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="users-main">
      <div class="users-content">
        <header class="users-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Usuarios</h1>
            <p>Administra los perfiles que participan en la operación de mantenimiento.</p>
          </div>

          <div class="users-header__actions">
            <v-btn v-if="canCreateUser" color="primary" height="42" :to="{ name: 'users-new' }">
              <v-icon :icon="mdiPlus" class="mr-2" size="18" />
              Nuevo usuario
            </v-btn>
            <v-btn
              :loading="loading"
              class="users-refresh"
              height="42"
              variant="outlined"
              @click="fetchUsers"
            >
              <v-icon :icon="mdiRefresh" class="mr-2" size="18" />
              Actualizar
            </v-btn>
          </div>
        </header>

        <section class="users-summary" aria-label="Resumen de usuarios">
          <div class="users-summary__icon">
            <v-icon :icon="mdiAccountGroupOutline" size="21" />
          </div>
          <div>
            <strong>{{ pageSummary }}</strong>
            <span>Ordenados desde el registro más reciente</span>
          </div>
          <v-spacer />
          <span class="users-summary__scope">Equipo operativo</span>
        </section>

        <section class="users-panel">
          <div class="users-panel__heading">
            <div>
              <h2>Directorio de usuarios</h2>
              <p>Consulta roles y disponibilidad del equipo operativo.</p>
            </div>
            <v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" />
          </div>

          <form class="users-filters" @submit.prevent="applyFilters">
            <v-text-field
              v-model="filters.search"
              clearable
              hide-details
              label="Buscar"
              placeholder="Nombre, correo o teléfono"
              :prepend-inner-icon="mdiMagnify"
            />
            <v-select
              v-model="filters.role"
              hide-details
              item-title="title"
              item-value="value"
              label="Rol"
              :items="roleOptions"
            />
            <v-select
              v-model="filters.status"
              hide-details
              item-title="title"
              item-value="value"
              label="Estado"
              :items="statusOptions"
            />
            <div class="users-filters__actions">
              <v-btn color="primary" type="submit">Aplicar filtros</v-btn>
              <v-btn variant="text" type="button" @click="clearFilters">Limpiar</v-btn>
            </div>
          </form>

          <v-progress-linear v-if="loading" color="primary" indeterminate />

          <v-alert v-if="errorMessage" class="users-alert" type="error" variant="tonal">
            <span>{{ errorMessage }}</span>
            <template #append>
              <v-btn size="small" variant="text" @click="fetchUsers">Reintentar</v-btn>
            </template>
          </v-alert>

          <div class="users-table-wrap">
            <table class="users-list-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="loading && users.length === 0">
                  <tr v-for="row in 6" :key="row" class="users-skeleton-row">
                    <td v-for="cell in 4" :key="cell"><v-skeleton-loader type="text" /></td>
                  </tr>
                </template>

                <template v-else>
                  <tr v-for="user in users" :key="user.id">
                    <td>
                      <div class="user-identity">
                        <span class="user-identity__avatar-wrap"><span class="user-identity__avatar">{{ initials(user.name) }}</span><RealtimePresenceDot :user-id="user.id" /></span>
                        <span>
                          <router-link
                            class="user-number"
                            :to="{ name: 'users-detail', params: { id: user.id } }"
                            @click.stop
                          >
                            {{ user.name }}
                          </router-link>
                          <small>Usuario #{{ user.id }}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong class="user-contact-email">{{ user.email }}</strong>
                      <small class="user-secondary">{{ phoneLabel(user) }}</small>
                    </td>
                    <td><span class="user-muted">{{ roleLabel(user) }}</span></td>
                    <td>
                      <v-chip label size="small" :color="statusColor(user)" variant="tonal">
                        {{ statusLabel(user) }}
                      </v-chip>
                    </td>
                  </tr>
                </template>

                <tr v-if="!loading && users.length === 0">
                  <td class="users-empty" colspan="4">
                    <v-icon :icon="mdiAlertOutline" size="28" />
                    <strong>No encontramos usuarios</strong>
                    <span>Prueba con otros filtros o limpia la búsqueda para ver todo el equipo.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="users-pagination">
            <span>Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}</span>
            <div class="users-pagination__controls">
              <v-select
                hide-details
                density="compact"
                item-title="title"
                item-value="value"
                label="Por página"
                :items="pageSizeOptions"
                :model-value="perPage"
                variant="outlined"
                @update:model-value="updatePerPage"
              />
              <v-pagination
                density="comfortable"
                :length="pagination.last_page"
                :model-value="pagination.current_page"
                :total-visible="5"
                @update:model-value="updatePage"
              />
            </div>
          </footer>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/users.scss" lang="scss"></style>

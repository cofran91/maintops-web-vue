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
import { useOwners } from '@/modules/owners/composables/useOwners'
import { useAuthStore } from '@/stores/auth'
import type { Owner } from '@/types/owner'

const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const canCreateOwner = computed(() => authStore.canUseResource('owners', 'create'))

const {
  applyFilters,
  clearFilters,
  errorMessage,
  fetchOwners,
  filters,
  loading,
  owners,
  pagination,
  perPage,
  updatePage,
  updatePerPage,
} = useOwners()

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
    return 'No hay propietarios que coincidan con la búsqueda'
  }

  return `${pagination.value.total} ${pagination.value.total === 1 ? 'propietario registrado' : 'propietarios registrados'}`
})

const statusLabel = (owner: Owner) => (owner.is_active ? 'Activo' : 'Inactivo')
const statusColor = (owner: Owner) => (owner.is_active ? '#239878' : '#7c8ba6')
const ownerPhone = (owner: Owner) => owner.phone || 'Sin teléfono registrado'

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="owners-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Propietarios"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="owners-main">
      <div class="owners-content">
        <header class="owners-header">
          <div>
            <span class="page-date">{{ todayLabel }}</span>
            <h1>Propietarios</h1>
            <p>Administra los contactos asociados a los vehículos de la flota.</p>
          </div>

          <div class="owners-header__actions">
            <v-btn v-if="canCreateOwner" color="primary" height="42" :to="{ name: 'owners-new' }">
              <v-icon :icon="mdiPlus" class="mr-2" size="18" />
              Nuevo propietario
            </v-btn>
            <v-btn
              :loading="loading"
              class="owners-refresh"
              height="42"
              variant="outlined"
              @click="fetchOwners"
            >
              <v-icon :icon="mdiRefresh" class="mr-2" size="18" />
              Actualizar
            </v-btn>
          </div>
        </header>

        <section class="owners-summary" aria-label="Resumen de propietarios">
          <div class="owners-summary__icon">
            <v-icon :icon="mdiAccountGroupOutline" size="21" />
          </div>
          <div>
            <strong>{{ pageSummary }}</strong>
            <span>Ordenados desde el registro más reciente</span>
          </div>
          <v-spacer />
          <span class="owners-summary__scope">Contactos de flota</span>
        </section>

        <section class="owners-panel">
          <div class="owners-panel__heading">
            <div>
              <h2>Listado de propietarios</h2>
              <p>Consulta los contactos disponibles para asignar vehículos.</p>
            </div>
            <v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" />
          </div>

          <form class="owners-filters" @submit.prevent="applyFilters">
            <v-text-field
              v-model="filters.search"
              clearable
              hide-details
              label="Buscar"
              placeholder="Nombre, correo, teléfono o documento"
              :prepend-inner-icon="mdiMagnify"
            />
            <v-select
              v-model="filters.status"
              hide-details
              item-title="title"
              item-value="value"
              label="Estado"
              :items="statusOptions"
            />
            <div class="owners-filters__actions">
              <v-btn color="primary" type="submit">Aplicar filtros</v-btn>
              <v-btn variant="text" type="button" @click="clearFilters">Limpiar</v-btn>
            </div>
          </form>

          <v-progress-linear v-if="loading" color="primary" indeterminate />

          <v-alert v-if="errorMessage" class="owners-alert" type="error" variant="tonal">
            <span>{{ errorMessage }}</span>
            <template #append>
              <v-btn size="small" variant="text" @click="fetchOwners">Reintentar</v-btn>
            </template>
          </v-alert>

          <div class="owners-table-wrap">
            <table class="owners-list-table">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Contacto</th>
                  <th>Documento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="loading && owners.length === 0">
                  <tr v-for="row in 6" :key="row" class="owners-skeleton-row">
                    <td v-for="cell in 4" :key="cell"><v-skeleton-loader type="text" /></td>
                  </tr>
                </template>

                <template v-else>
                  <tr v-for="owner in owners" :key="owner.id">
                    <td>
                      <div class="owner-identity">
                        <span class="owner-identity__avatar">{{ owner.name.slice(0, 2).toUpperCase() }}</span>
                        <span>
                          <router-link
                            class="owner-number"
                            :to="{ name: 'owners-detail', params: { id: owner.id } }"
                            @click.stop
                          >
                            {{ owner.name }}
                          </router-link>
                          <small>Propietario #{{ owner.id }}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong class="owner-contact-email">{{ owner.email }}</strong>
                      <small class="owner-secondary">{{ ownerPhone(owner) }}</small>
                    </td>
                    <td><span class="owner-muted">{{ owner.document_number || 'Sin documento' }}</span></td>
                    <td>
                      <v-chip label size="small" :color="statusColor(owner)" variant="tonal">
                        {{ statusLabel(owner) }}
                      </v-chip>
                    </td>
                  </tr>
                </template>

                <tr v-if="!loading && owners.length === 0">
                  <td class="owners-empty" colspan="4">
                    <v-icon :icon="mdiAlertOutline" size="28" />
                    <strong>No encontramos propietarios</strong>
                    <span>Prueba con otros filtros o limpia la búsqueda para ver todos los contactos.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="owners-pagination">
            <span>
              Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}
            </span>
            <div class="owners-pagination__controls">
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

<style src="@/styles/views/owners.scss" lang="scss"></style>

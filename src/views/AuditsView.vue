<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { mdiChevronDown, mdiChevronUp, mdiClose, mdiHistory, mdiMagnify, mdiRefresh, mdiTableSearch } from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AuditDetailPanel from '@/components/audits/AuditDetailPanel.vue'
import { useAudits } from '@/modules/audits/composables/useAudits'
import { actorLabel, auditableLabel, displayUrl, eventColor, eventLabel } from '@/modules/audits/utils/auditLabels'
import { useAuthStore } from '@/stores/auth'
import type { AuditLog } from '@/types/audit'

const router = useRouter()
const { locale } = useI18n()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const filtersExpanded = ref(false)
const selectedAudit = ref<AuditLog | null>(null)
const eventOptions = [{ title: 'Todos los eventos', value: '' }, ...['created', 'updated', 'deleted', 'restored'].map((value) => ({ title: eventLabel(value), value }))]
const pageSizeOptions = [10, 15, 25, 50]

const { audits, filters, pagination, perPage, loading, errorMessage, fetchAudits, applyFilters, clearFilters, updatePage, updatePerPage } = useAudits()
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())
const hasActiveFilters = computed(() => Object.values(filters).some(Boolean))
const todayLabel = computed(() => {
  const value = new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  return value.charAt(0).toUpperCase() + value.slice(1)
})
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
const changesCount = (audit: AuditLog) => {
  const oldValues = audit.old_values && !Array.isArray(audit.old_values) ? Object.keys(audit.old_values) : []
  const newValues = audit.new_values && !Array.isArray(audit.new_values) ? Object.keys(audit.new_values) : []
  return new Set([...oldValues, ...newValues]).size
}
const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="audits-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar :user-initials="userInitials" :user-name="userName" context="Auditoría del sistema" @open-menu="mobileDrawer = true" />
    <v-main class="audits-main">
      <div class="audits-content">
        <header class="audits-header">
          <div><span class="page-date">{{ todayLabel }}</span><h1>Auditoría del sistema</h1><p>Consulta quién cambió cada recurso y revisa los valores afectados.</p></div>
          <v-btn :loading="loading" height="42" variant="outlined" @click="fetchAudits"><v-icon :icon="mdiRefresh" class="mr-2" size="17" />Actualizar registros</v-btn>
        </header>

        <section class="audits-summary"><span class="audits-summary__icon"><v-icon :icon="mdiHistory" size="22" /></span><div><strong>{{ pagination.total }}</strong><span>registros disponibles en el historial de cambios</span></div><v-spacer /><v-chip label variant="tonal">Solo lectura</v-chip></section>

        <section class="audits-panel">
          <div class="audits-panel__heading"><div><span class="audits-eyebrow">Trazabilidad</span><h2>Historial de actividad</h2><p>Filtra eventos para encontrar rápidamente una modificación.</p></div><v-icon :icon="mdiTableSearch" color="#8290aa" size="22" /></div>
          <form class="audits-filters" @submit.prevent="applyFilters">
            <v-text-field v-model="filters.search" clearable hide-details label="Buscar" placeholder="Evento, URL, etiqueta o recurso" :prepend-inner-icon="mdiMagnify" />
            <v-select v-model="filters.event" hide-details item-title="title" item-value="value" label="Evento" :items="eventOptions" />
            <v-text-field v-model="filters.user_id" hide-details label="ID del actor" min="1" placeholder="Todos" type="number" />
            <div class="audits-filters__actions"><v-btn color="primary" type="submit">Aplicar</v-btn><v-btn :disabled="!hasActiveFilters" variant="text" type="button" @click="clearFilters">Limpiar</v-btn><v-btn :aria-label="filtersExpanded ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'" icon variant="tonal" @click="filtersExpanded = !filtersExpanded"><v-icon :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown" /></v-btn></div>
            <div v-if="filtersExpanded" class="audits-filters__advanced"><v-text-field v-model="filters.url" hide-details label="URL" placeholder="/api/v1/users" /><v-text-field v-model="filters.tags" hide-details label="Etiquetas" placeholder="users" /><v-text-field v-model="filters.created_from" hide-details label="Desde" type="date" /><v-text-field v-model="filters.created_to" hide-details label="Hasta" type="date" /></div>
          </form>
          <v-progress-linear v-if="loading" color="primary" indeterminate />
          <v-alert v-if="errorMessage" class="audits-alert" type="error" variant="tonal"><span>{{ errorMessage }}</span><template #append><v-btn size="small" variant="text" @click="fetchAudits">Reintentar</v-btn></template></v-alert>

          <div class="audits-table-wrap">
            <table class="audits-table">
              <thead><tr><th>Fecha</th><th>Evento</th><th>Actor</th><th>Recurso afectado</th><th>URL</th><th>Cambios</th><th aria-label="Acciones" /></tr></thead>
              <tbody>
                <template v-if="loading && !audits.length"><tr v-for="row in 6" :key="row"><td v-for="cell in 7" :key="cell"><v-skeleton-loader type="text" /></td></tr></template>
                <template v-else><tr v-for="audit in audits" :key="audit.id"><td><span class="audit-date">{{ formatDate(audit.created_at) }}</span></td><td><v-chip :color="eventColor(audit.event)" label size="small" variant="tonal">{{ eventLabel(audit.event) }}</v-chip></td><td><strong>{{ actorLabel(audit) }}</strong><small>{{ audit.actor?.type ? audit.actor.type.split('\\').at(-1) : 'Proceso del sistema' }}</small></td><td><strong>{{ auditableLabel(audit) }}</strong><small>{{ audit.auditable?.type?.split('\\').at(-1) || 'Recurso' }} #{{ audit.auditable?.id }}</small></td><td><span class="audit-url" :title="audit.url || undefined">{{ displayUrl(audit.url) }}</span></td><td><span class="audit-change-count">{{ changesCount(audit) }}</span><small>campos</small></td><td><v-btn color="primary" icon variant="tonal" @click="selectedAudit = audit"><v-icon :icon="mdiHistory" size="18" /></v-btn></td></tr></template>
                <tr v-if="!loading && !audits.length"><td class="audits-empty" colspan="7"><v-icon :icon="mdiHistory" size="30" /><strong>No se encontraron registros</strong><span>Ajusta los filtros o espera a que existan nuevas actividades.</span></td></tr>
              </tbody>
            </table>
          </div>
          <footer class="audits-pagination"><span>Mostrando {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} de {{ pagination.total }}</span><div><v-select :model-value="perPage" density="compact" hide-details item-title="title" item-value="value" label="Por página" :items="pageSizeOptions.map((value) => ({ title: String(value), value }))" variant="outlined" @update:model-value="updatePerPage" /><v-pagination :length="pagination.last_page" :model-value="pagination.current_page" :total-visible="5" @update:model-value="updatePage" /></div></footer>
        </section>
      </div>
    </v-main>
    <v-dialog :model-value="Boolean(selectedAudit)" max-width="1080" scrollable @update:model-value="!$event && (selectedAudit = null)"><AuditDetailPanel v-if="selectedAudit" :audit="selectedAudit" @close="selectedAudit = null" /></v-dialog>
  </div>
</template>

<style src="@/styles/views/audits.scss" lang="scss"></style>

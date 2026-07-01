<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiAccountMultiple,
  mdiPlus,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { ROLES } from '@/types/auth.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import usersApi from '@/modules/users/services/usersService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import DeleteResourceModal from '@/modules/shared/components/DeleteResourceModal.vue'
import ResourceListStatus from '@/modules/shared/components/ResourceListStatus.vue'
import ResourcePagination from '@/modules/shared/components/ResourcePagination.vue'
import ResourceRowActions from '@/modules/shared/components/ResourceRowActions.vue'
import BaseButton from '@/components/BaseButton.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { useAuthStore } from '@/stores/auth.js'
import UserFilters from '@/modules/users/components/UserFilters.vue'

const authStore = useAuthStore()
const { locale, t, te } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  role: '',
  is_active: '',
  workshop_id: '',
  without_workshop: false,
})

const columns = computed(() => [
  { key: 'identity', label: t('users.columns.user') },
  { key: 'role', label: t('users.columns.role') },
  { key: 'workshop', label: t('users.columns.workshop') },
  { key: 'is_active', label: t('users.columns.status') },
  { key: 'updated_at', label: t('users.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const deleting = ref(false)
const deleteModalOpen = ref(false)
const userToDelete = ref(null)

const roles = computed(() => authStore.roles)
const isSystemAdmin = computed(() =>
  roles.value.some((role) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role)),
)
const isWorkshopManager = computed(() => roles.value.includes(ROLES.WORKSHOP_MANAGER))
const roleFilterOptions = computed(() => {
  if (isSystemAdmin.value) {
    return Object.values(ROLES).filter((role) => role !== ROLES.SUPER_ADMIN)
  }

  if (isWorkshopManager.value) {
    return [ROLES.TECHNICIAN]
  }

  return []
})
const showWorkshopFilters = computed(() => isSystemAdmin.value)
const currentApiFilters = (nextFilters) => {
  const apiFilters = {}

  if (roleFilterOptions.value.includes(nextFilters.role)) {
    apiFilters.role = nextFilters.role
  }

  if (nextFilters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (nextFilters.is_active === 'false') {
    apiFilters.is_active = false
  }

  if (showWorkshopFilters.value && nextFilters.without_workshop) {
    apiFilters.without_workshop = true
  }

  if (
    showWorkshopFilters.value &&
    !nextFilters.without_workshop &&
    nextFilters.workshop_id !== ''
  ) {
    apiFilters.workshop_id = nextFilters.workshop_id
  }

  return apiFilters
}
const sanitizeFilters = (nextFilters) => {
  if (!roleFilterOptions.value.includes(nextFilters.role)) {
    nextFilters.role = ''
  }

  if (!['', 'true', 'false'].includes(nextFilters.is_active)) {
    nextFilters.is_active = ''
  }

  if (!showWorkshopFilters.value) {
    nextFilters.workshop_id = ''
    nextFilters.without_workshop = false
  }

  if (nextFilters.without_workshop) {
    nextFilters.workshop_id = ''
  }
}
const {
  items: users,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchUsers,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'operations-users',
  emptyFilters: EMPTY_FILTERS,
  fetcher: usersApi.index,
  toApiFilters: currentApiFilters,
  sanitizeFilters,
})
const canCreateUser = computed(() => canCreateForAnyRole(roles.value, RESOURCES.USERS))
const canUpdateUser = computed(() => canUpdateForAnyRole(roles.value, RESOURCES.USERS))
const canDeleteUser = computed(() => canDeleteForAnyRole(roles.value, RESOURCES.USERS))
const deleteMessage = computed(() => {
  if (!userToDelete.value) {
    return ''
  }

  return t('users.delete.confirmMessage', { name: userToDelete.value.name })
})

const setFilter = (key, value) => {
  filters[key] = value
}

const handleWithoutWorkshopChange = () => {
  if (filters.without_workshop) {
    filters.workshop_id = ''
  }
}

const askDelete = (user) => {
  userToDelete.value = user
  deleteModalOpen.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await usersApi.remove(userToDelete.value.id)
    deleteModalOpen.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const primaryRole = (user) => user.roles?.[0] ?? null
const humanizeRole = (role) => String(role ?? '').replace(/_/g, ' ')
const roleLabel = (role) => {
  if (!role) {
    return '-'
  }

  const key = `users.roles.${role}`

  return te(key) ? t(key) : humanizeRole(role)
}
const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) =>
  isActive ? t('users.status.active') : t('users.status.inactive')
const workshopLabel = (user) => user.workshop?.name ?? user.workshop?.code ?? '-'

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('users.list.title')"
      :subtitle="t('users.list.subtitle')"
      :eyebrow="t('users.page.eyebrow')"
      :icon="mdiAccountMultiple"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateUser"
          :to="{ name: 'operations-users-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('users.actions.newUser')"
          :aria-label="t('users.actions.newUser')"
        />
      </template>

      <UserFilters
        :filters="filters"
        :role-filter-options="roleFilterOptions"
        :has-active-filters="hasActiveFilters"
        :input-class="inputClass"
        :role-label="roleLabel"
        :show-workshop-filters="showWorkshopFilters"
        @apply="applyFilters"
        @clear="clearFilters"
        @focusout="applyFiltersOnFocusOut"
        @update-filter="setFilter"
        @without-workshop-change="handleWithoutWorkshopChange"
      />

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('users.list.loading')"
        :retry-label="t('users.actions.retry')"
        @retry="fetchUsers"
      />

      <template v-if="!loading && !errorMessage">
        <AppDataTable
          v-if="users.length"
          :columns="columns"
          :rows="users"
          :empty-title="t('users.list.emptyTitle')"
          :empty-description="t('users.list.emptyDescription')"
        >
          <template #cell-identity="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">{{ row.name }}</p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">{{ row.email }}</p>
            </div>
          </template>
          <template #cell-role="{ row }">
            {{ roleLabel(primaryRole(row)) }}
          </template>
          <template #cell-workshop="{ row }">
            {{ workshopLabel(row) }}
          </template>
          <template #cell-is_active="{ value }">
            <AppBadge :label="statusLabel(value)" :color="statusColor(value)" />
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <ResourceRowActions
              :detail-to="{ name: 'operations-users-detail', params: { id: row.id } }"
              :edit-to="{ name: 'operations-users-edit', params: { id: row.id } }"
              :can-update="canUpdateUser"
              :can-delete="canDeleteUser"
              :open-label="t('users.actions.openUser')"
              :edit-label="t('users.actions.editUser')"
              :delete-label="t('users.actions.deleteUser')"
              @delete="askDelete(row)"
            />
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('users.list.emptyTitle')"
          :description="t('users.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateUser"
            :to="{ name: 'operations-users-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('users.actions.newUser')"
            :aria-label="t('users.actions.newUser')"
          />
        </AppEmptyState>

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('users.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('users.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('users.pagination.previousPage')"
          :next-label="t('users.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />
      </template>
    </AppPage>

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('users.delete.title')"
      :delete-label="t('users.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteUser"
    />
  </LayoutAuthenticated>
</template>

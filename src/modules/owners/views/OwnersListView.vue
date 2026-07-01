<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiAccountMultiple,
  mdiDownload,
  mdiPlus,
  mdiUpload,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
  normalizePermissionRoles,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { ROLES } from '@/types/auth.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import { emptyFallback, formatDate as formatDateValue } from '@/modules/shared/utils/formatters.js'
import ownersApi from '@/modules/owners/services/ownersService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import DeleteResourceModal from '@/modules/shared/components/DeleteResourceModal.vue'
import ResourceListStatus from '@/modules/shared/components/ResourceListStatus.vue'
import ResourcePagination from '@/modules/shared/components/ResourcePagination.vue'
import ResourceRowActions from '@/modules/shared/components/ResourceRowActions.vue'
import BaseButton from '@/components/BaseButton.vue'
import DataImportModal from '@/components/DataImportModal.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import OwnerFilters from '@/modules/owners/components/OwnerFilters.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { locale, t } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  is_active: '',
})

const columns = computed(() => [
  { key: 'owner', label: t('owners.columns.owner') },
  { key: 'phone', label: t('owners.columns.phone') },
  { key: 'document_number', label: t('owners.columns.document') },
  { key: 'address', label: t('owners.columns.address') },
  { key: 'is_active', label: t('owners.columns.status') },
  { key: 'updated_at', label: t('owners.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'
const ownerFileRoles = Object.freeze([ROLES.SUPER_ADMIN, ROLES.ADMIN])
const importAccept =
  '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

const exporting = ref(false)
const importing = ref(false)
const deleting = ref(false)
const deleteModalOpen = ref(false)
const importModalOpen = ref(false)
const ownerToDelete = ref(null)

const currentApiFilters = (nextFilters) => {
  const apiFilters = {}

  if (nextFilters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (nextFilters.is_active === 'false') {
    apiFilters.is_active = false
  }

  return apiFilters
}

const sanitizeFilters = (nextFilters) => {
  if (!['', 'true', 'false'].includes(nextFilters.is_active)) {
    nextFilters.is_active = ''
  }
}

const {
  items: owners,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchOwners,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'operations-owners',
  emptyFilters: EMPTY_FILTERS,
  fetcher: ownersApi.index,
  toApiFilters: currentApiFilters,
  sanitizeFilters,
})

const canCreateOwner = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canUpdateOwner = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canDeleteOwner = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canExportOwners = computed(() =>
  normalizePermissionRoles(authStore.roles).some((role) => ownerFileRoles.includes(role)),
)
const canImportOwners = computed(() =>
  normalizePermissionRoles(authStore.roles).some((role) => ownerFileRoles.includes(role)),
)
const deleteMessage = computed(() => {
  if (!ownerToDelete.value) {
    return ''
  }

  return t('owners.delete.confirmMessage', { name: ownerToDelete.value.name })
})
const importSummaryFields = computed(() => [
  { key: 'processed_rows', label: t('owners.import.processedRows') },
  { key: 'rows_with_errors', label: t('owners.import.rowsWithErrors') },
  { key: 'created_records', label: t('owners.import.createdRecords') },
  { key: 'updated_records', label: t('owners.import.updatedRecords') },
])

const askDelete = (owner) => {
  ownerToDelete.value = owner
  deleteModalOpen.value = true
}

const openImportModal = () => {
  importModalOpen.value = true
}

const deleteOwner = async () => {
  if (!ownerToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await ownersApi.remove(ownerToDelete.value.id)
    deleteModalOpen.value = false
    ownerToDelete.value = null
    await fetchOwners()

    if (owners.value.length === 0 && pagination.value.current_page > 1) {
      updatePage(pagination.value.current_page - 1)
    }
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const exportOwners = async () => {
  exporting.value = true
  errorMessage.value = ''

  try {
    await ownersApi.exportOwners()
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    exporting.value = false
  }
}

const importOwners = (file) => ownersApi.importOwners(file)

const refreshAfterImport = () => fetchOwners()

const setImporting = (value) => {
  importing.value = value
}

const setFilter = (key, value) => {
  filters[key] = value
}

const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) =>
  isActive ? t('owners.status.active') : t('owners.status.inactive')

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
  })
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('owners.list.title')"
      :subtitle="t('owners.list.subtitle')"
      :eyebrow="t('owners.page.eyebrow')"
      :icon="mdiAccountMultiple"
    >
      <template #actions>
        <BaseButton
          v-if="canImportOwners"
          color="whiteDark"
          :icon="mdiUpload"
          :title="importing ? t('owners.actions.importing') : t('owners.actions.importOwners')"
          :aria-label="importing ? t('owners.actions.importing') : t('owners.actions.importOwners')"
          :disabled="importing"
          @click="openImportModal"
        />
        <BaseButton
          v-if="canExportOwners"
          color="whiteDark"
          :icon="mdiDownload"
          :title="exporting ? t('owners.actions.exporting') : t('owners.actions.exportOwners')"
          :aria-label="exporting ? t('owners.actions.exporting') : t('owners.actions.exportOwners')"
          :disabled="exporting"
          @click="exportOwners"
        />
        <BaseButton
          v-if="canCreateOwner"
          :to="{ name: 'operations-owners-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('owners.actions.newOwner')"
          :aria-label="t('owners.actions.newOwner')"
        />
      </template>

      <OwnerFilters
        :filters="filters"
        :has-active-filters="hasActiveFilters"
        :input-class="inputClass"
        @apply="applyFilters"
        @clear="clearFilters"
        @focusout="applyFiltersOnFocusOut"
        @update-filter="setFilter"
      />

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('owners.list.loading')"
        :retry-label="t('owners.actions.retry')"
        @retry="fetchOwners"
      />

      <template v-if="!loading && !errorMessage">
        <AppDataTable
          v-if="owners.length"
          :columns="columns"
          :rows="owners"
          :empty-title="t('owners.list.emptyTitle')"
          :empty-description="t('owners.list.emptyDescription')"
        >
          <template #cell-owner="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">{{ row.name }}</p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">{{ row.email }}</p>
            </div>
          </template>
          <template #cell-phone="{ value }">
            {{ emptyFallback(value) }}
          </template>
          <template #cell-document_number="{ value }">
            {{ emptyFallback(value) }}
          </template>
          <template #cell-address="{ value }">
            <span class="line-clamp-2">{{ emptyFallback(value) }}</span>
          </template>
          <template #cell-is_active="{ value }">
            <AppBadge :label="statusLabel(value)" :color="statusColor(value)" />
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <ResourceRowActions
              :detail-to="{ name: 'operations-owners-detail', params: { id: row.id } }"
              :edit-to="{ name: 'operations-owners-edit', params: { id: row.id } }"
              :can-update="canUpdateOwner"
              :can-delete="canDeleteOwner"
              :open-label="t('owners.actions.openOwner')"
              :edit-label="t('owners.actions.editOwner')"
              :delete-label="t('owners.actions.deleteOwner')"
              @delete="askDelete(row)"
            />
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('owners.list.emptyTitle')"
          :description="t('owners.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateOwner"
            :to="{ name: 'operations-owners-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('owners.actions.newOwner')"
            :aria-label="t('owners.actions.newOwner')"
          />
        </AppEmptyState>

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('owners.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('owners.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('owners.pagination.previousPage')"
          :next-label="t('owners.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />
      </template>
    </AppPage>

    <DataImportModal
      v-model="importModalOpen"
      :title="t('owners.import.title')"
      :import-action="importOwners"
      :summary-fields="importSummaryFields"
      :accept="importAccept"
      :file-label="t('owners.import.fileLabel')"
      :file-hint="t('owners.import.fileHint')"
      :import-label="t('owners.actions.import')"
      :importing-label="t('owners.actions.importing')"
      :done-label="t('common.actions.done')"
      :select-file-message="t('owners.import.selectFile')"
      :waiting-message="t('owners.import.waiting')"
      :error-fallback="t('owners.errors.import')"
      :errors-title="t('owners.import.errorsTitle')"
      :row-label="t('owners.import.rowNumber', { row: '{row}' })"
      :no-row-errors-label="t('owners.import.noRowErrors')"
      @imported="refreshAfterImport"
      @processing="setImporting"
    />

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('owners.delete.title')"
      :delete-label="t('owners.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteOwner"
    />
  </LayoutAuthenticated>
</template>

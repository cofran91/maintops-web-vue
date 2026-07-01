<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiPlus,
  mdiWrenchOutline,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import { getPositiveNumberQuery } from '@/modules/shared/utils/queryParams.js'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService.js'
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
import MaintenancePlanFilters from '@/modules/maintenance-plans/components/MaintenancePlanFilters.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { locale, t } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  code: '',
  is_active: '',
  name: '',
  task_id: '',
  recommended_interval_days_from: '',
  recommended_interval_days_to: '',
  recommended_interval_km_from: '',
  recommended_interval_km_to: '',
  created_from: '',
  created_to: '',
})

const columns = computed(() => [
  { key: 'plan', label: t('maintenancePlans.columns.plan') },
  { key: 'tasks', label: t('maintenancePlans.columns.tasks') },
  { key: 'recommended_interval_days', label: t('maintenancePlans.columns.days') },
  { key: 'recommended_interval_km', label: t('maintenancePlans.columns.kilometers') },
  { key: 'is_active', label: t('maintenancePlans.columns.active') },
  { key: 'updated_at', label: t('maintenancePlans.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const deleting = ref(false)
const deleteModalOpen = ref(false)
const planToDelete = ref(null)
const filtersExpanded = ref(false)

const currentApiFilters = (nextFilters) => {
  const apiFilters = {}
  const taskId = getPositiveNumberQuery(nextFilters.task_id)
  const daysFrom = getPositiveNumberQuery(nextFilters.recommended_interval_days_from)
  const daysTo = getPositiveNumberQuery(nextFilters.recommended_interval_days_to)
  const kmFrom = getPositiveNumberQuery(nextFilters.recommended_interval_km_from)
  const kmTo = getPositiveNumberQuery(nextFilters.recommended_interval_km_to)

  if (nextFilters.code) {
    apiFilters.code = nextFilters.code
  }

  if (nextFilters.name) {
    apiFilters.name = nextFilters.name
  }

  if (nextFilters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (nextFilters.is_active === 'false') {
    apiFilters.is_active = false
  }

  if (taskId !== null) {
    apiFilters.task_id = taskId
  }

  if (daysFrom !== null) {
    apiFilters.recommended_interval_days_from = daysFrom
  }

  if (daysTo !== null) {
    apiFilters.recommended_interval_days_to = daysTo
  }

  if (kmFrom !== null) {
    apiFilters.recommended_interval_km_from = kmFrom
  }

  if (kmTo !== null) {
    apiFilters.recommended_interval_km_to = kmTo
  }

  if (nextFilters.created_from) {
    apiFilters.created_from = nextFilters.created_from
  }

  if (nextFilters.created_to) {
    apiFilters.created_to = nextFilters.created_to
  }

  return apiFilters
}

const sanitizeFilters = (nextFilters) => {
  if (!['', 'true', 'false'].includes(nextFilters.is_active)) {
    nextFilters.is_active = ''
  }
}

const {
  items: plans,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchPlans,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'maintenance-plans',
  emptyFilters: EMPTY_FILTERS,
  fetcher: maintenancePlansApi.index,
  toApiFilters: currentApiFilters,
  sanitizeFilters,
})

const canCreatePlan = computed(() =>
  canCreateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const canUpdatePlan = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const canDeletePlan = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const deleteMessage = computed(() => {
  if (!planToDelete.value) {
    return ''
  }

  return t('maintenancePlans.delete.confirmMessage', { name: planToDelete.value.name })
})

const askDelete = (plan) => {
  planToDelete.value = plan
  deleteModalOpen.value = true
}

const deletePlan = async () => {
  if (!planToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await maintenancePlansApi.remove(planToDelete.value.id)
    deleteModalOpen.value = false
    planToDelete.value = null
    await fetchPlans()

    if (plans.value.length === 0 && pagination.value.current_page > 1) {
      updatePage(pagination.value.current_page - 1)
    }
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const setFilter = (key, value) => {
  filters[key] = value
}

const taskSummary = (plan) => {
  const tasks = plan.tasks ?? []

  if (tasks.length === 0) {
    return '-'
  }

  if (tasks.length <= 2) {
    return tasks.map((task) => task.name).join(', ')
  }

  return `${tasks.slice(0, 2).map((task) => task.name).join(', ')} +${tasks.length - 2}`
}

const daysLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('maintenancePlans.units.days', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const kilometersLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('maintenancePlans.units.kilometers', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

const activeLabel = (isActive) =>
  isActive ? t('maintenancePlans.labels.active') : t('maintenancePlans.labels.inactive')
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('maintenancePlans.list.title')"
      :subtitle="t('maintenancePlans.list.subtitle')"
      :eyebrow="t('maintenancePlans.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          v-if="canCreatePlan"
          :to="{ name: 'maintenance-plans-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('maintenancePlans.actions.newPlan')"
          :aria-label="t('maintenancePlans.actions.newPlan')"
        />
      </template>

      <MaintenancePlanFilters
        :filters="filters"
        :expanded="filtersExpanded"
        :has-active-filters="hasActiveFilters"
        :input-class="inputClass"
        @apply="applyFilters"
        @clear="clearFilters"
        @focusout="applyFiltersOnFocusOut"
        @toggle-expanded="filtersExpanded = !filtersExpanded"
        @update-filter="setFilter"
      />

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('maintenancePlans.list.loading')"
        :retry-label="t('maintenancePlans.actions.retry')"
        @retry="fetchPlans"
      />

      <template v-if="!loading && !errorMessage">
        <AppDataTable
          v-if="plans.length"
          :columns="columns"
          :rows="plans"
          :empty-title="t('maintenancePlans.list.emptyTitle')"
          :empty-description="t('maintenancePlans.list.emptyDescription')"
        >
          <template #cell-plan="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ row.name }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ row.code }}
              </p>
            </div>
          </template>
          <template #cell-tasks="{ row }">
            {{ taskSummary(row) }}
          </template>
          <template #cell-recommended_interval_days="{ value }">
            {{ daysLabel(value) }}
          </template>
          <template #cell-recommended_interval_km="{ value }">
            {{ kilometersLabel(value) }}
          </template>
          <template #cell-is_active="{ value }">
            <AppBadge
              :label="activeLabel(value)"
              :color="value ? 'success' : 'danger'"
            />
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <ResourceRowActions
              :detail-to="{ name: 'maintenance-plans-detail', params: { id: row.id } }"
              :edit-to="{ name: 'maintenance-plans-edit', params: { id: row.id } }"
              :can-update="canUpdatePlan"
              :can-delete="canDeletePlan"
              :open-label="t('maintenancePlans.actions.openPlan')"
              :edit-label="t('maintenancePlans.actions.editPlan')"
              :delete-label="t('maintenancePlans.actions.deletePlan')"
              @delete="askDelete(row)"
            />
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('maintenancePlans.list.emptyTitle')"
          :description="t('maintenancePlans.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreatePlan"
            :to="{ name: 'maintenance-plans-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('maintenancePlans.actions.newPlan')"
            :aria-label="t('maintenancePlans.actions.newPlan')"
          />
        </AppEmptyState>

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('maintenancePlans.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('maintenancePlans.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('maintenancePlans.pagination.previousPage')"
          :next-label="t('maintenancePlans.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />
      </template>
    </AppPage>

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('maintenancePlans.delete.title')"
      :delete-label="t('maintenancePlans.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deletePlan"
    >
      <p class="text-sm text-gray-500 dark:text-slate-400">
        {{ t('maintenancePlans.delete.linkedOrderItemsNote') }}
      </p>
    </DeleteResourceModal>
  </LayoutAuthenticated>
</template>

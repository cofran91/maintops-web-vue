<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiCheck,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClose,
  mdiEyeOutline,
  mdiPencil,
  mdiPlus,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { DEFAULT_PAGINATION_META } from '@/types/api.js'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import MaintenanceTaskCombobox from '@/modules/maintenance-tasks/components/MaintenanceTaskCombobox.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
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

const plans = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)
const planToDelete = ref(null)
const filtersExpanded = ref(false)
const filters = reactive({ ...EMPTY_FILTERS })

const canCreatePlan = computed(() =>
  canCreateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const canUpdatePlan = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const canDeletePlan = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const hasActiveFilters = computed(() =>
  Object.values(filters).some((value) => value !== ''),
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
)
const deleteMessage = computed(() => {
  if (!planToDelete.value) {
    return ''
  }

  return t('maintenancePlans.delete.confirmMessage', { name: planToDelete.value.name })
})
const advancedFiltersLabel = computed(() =>
  filtersExpanded.value
    ? t('maintenancePlans.actions.hideAdvancedFilters')
    : t('maintenancePlans.actions.showAdvancedFilters'),
)

const getStringQuery = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return typeof value === 'string' ? value : ''
}

const getNumberQuery = (value, fallback) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : fallback
}

const getPositiveNumberQuery = (value) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : null
}

const buildQuery = (nextFilters, page, perPage) => {
  const query = {}

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (value !== '') {
      query[key] = String(value)
    }
  })

  if (page > 1) {
    query.page = String(page)
  }

  if (perPage !== DEFAULT_PAGINATION_META.per_page) {
    query.per_page = String(perPage)
  }

  return query
}

const syncFiltersFromQuery = () => {
  filters.search = getStringQuery(route.query.search)
  filters.code = getStringQuery(route.query.code)
  filters.is_active = getStringQuery(route.query.is_active)
  filters.name = getStringQuery(route.query.name)
  filters.task_id = getStringQuery(route.query.task_id)
  filters.recommended_interval_days_from =
    getStringQuery(route.query.recommended_interval_days_from)
  filters.recommended_interval_days_to =
    getStringQuery(route.query.recommended_interval_days_to)
  filters.recommended_interval_km_from =
    getStringQuery(route.query.recommended_interval_km_from)
  filters.recommended_interval_km_to =
    getStringQuery(route.query.recommended_interval_km_to)
  filters.created_from = getStringQuery(route.query.created_from)
  filters.created_to = getStringQuery(route.query.created_to)
}

const currentApiFilters = () => {
  const apiFilters = {}
  const taskId = getPositiveNumberQuery(filters.task_id)
  const daysFrom = getPositiveNumberQuery(filters.recommended_interval_days_from)
  const daysTo = getPositiveNumberQuery(filters.recommended_interval_days_to)
  const kmFrom = getPositiveNumberQuery(filters.recommended_interval_km_from)
  const kmTo = getPositiveNumberQuery(filters.recommended_interval_km_to)

  if (filters.code) {
    apiFilters.code = filters.code
  }

  if (filters.name) {
    apiFilters.name = filters.name
  }

  if (filters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (filters.is_active === 'false') {
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

  if (filters.created_from) {
    apiFilters.created_from = filters.created_from
  }

  if (filters.created_to) {
    apiFilters.created_to = filters.created_to
  }

  return apiFilters
}

const fetchPlans = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await maintenancePlansApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    plans.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void router.push({
    name: 'maintenance-plans',
    query: buildQuery(filters, 1, pagination.value.per_page),
  })
}

const applyFiltersOnFocusOut = (event) => {
  const currentTarget = event.currentTarget
  const relatedTarget = event.relatedTarget

  if (
    currentTarget instanceof HTMLElement &&
    relatedTarget instanceof Node &&
    currentTarget.contains(relatedTarget)
  ) {
    return
  }

  window.setTimeout(() => {
    applyFilters()
  })
}

const clearFilters = () => {
  Object.assign(filters, EMPTY_FILTERS)
  applyFilters()
}

const updatePage = (page) => {
  void router.push({
    name: 'maintenance-plans',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'maintenance-plans',
    query: buildQuery(filters, 1, perPage),
  })
}

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

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
    void fetchPlans()
  },
  { immediate: true },
)
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

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField :label="t('maintenancePlans.filters.search')">
            <FormControl
              v-model="filters.search"
              name="search"
              :placeholder="t('maintenancePlans.filters.searchPlaceholder')"
            />
          </FormField>
          <FormField :label="t('maintenancePlans.filters.code')">
            <FormControl
              v-model="filters.code"
              name="code"
              :placeholder="t('maintenancePlans.filters.codePlaceholder')"
            />
          </FormField>
          <FormField :label="t('maintenancePlans.filters.active')">
            <select v-model="filters.is_active" name="is_active" :class="inputClass">
              <option value="">{{ t('maintenancePlans.filters.all') }}</option>
              <option value="true">{{ t('maintenancePlans.labels.active') }}</option>
              <option value="false">{{ t('maintenancePlans.labels.inactive') }}</option>
            </select>
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('maintenancePlans.filters.name')">
            <FormControl v-model="filters.name" name="name" />
          </FormField>
          <FormField :label="t('maintenancePlans.filters.task')">
            <MaintenanceTaskCombobox
              v-model="filters.task_id"
              name="task_id"
              :placeholder="t('maintenancePlans.filters.taskPlaceholder')"
            />
          </FormField>
          <FormField :label="t('maintenancePlans.filters.daysFrom')">
            <input
              v-model="filters.recommended_interval_days_from"
              type="number"
              min="1"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>
          <FormField :label="t('maintenancePlans.filters.daysTo')">
            <input
              v-model="filters.recommended_interval_days_to"
              type="number"
              min="1"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>
          <FormField :label="t('maintenancePlans.filters.kilometersFrom')">
            <input
              v-model="filters.recommended_interval_km_from"
              type="number"
              min="1"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>
          <FormField :label="t('maintenancePlans.filters.kilometersTo')">
            <input
              v-model="filters.recommended_interval_km_to"
              type="number"
              min="1"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>
          <FormField :label="t('maintenancePlans.filters.createdFrom')">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField :label="t('maintenancePlans.filters.createdTo')">
            <FormControl v-model="filters.created_to" name="created_to" type="date" />
          </FormField>
        </div>

        <div class="mt-2 flex flex-wrap justify-end gap-2">
          <BaseButton
            color="whiteDark"
            :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown"
            :title="advancedFiltersLabel"
            :aria-label="advancedFiltersLabel"
            @click="filtersExpanded = !filtersExpanded"
          />
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            :title="t('maintenancePlans.actions.clearFilters')"
            :aria-label="t('maintenancePlans.actions.clearFilters')"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            :title="t('maintenancePlans.actions.applyFilters')"
            :aria-label="t('maintenancePlans.actions.applyFilters')"
            type="submit"
          />
        </div>
      </CardBox>

      <NotificationBar v-if="errorMessage" color="danger" :icon="mdiRefresh">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('maintenancePlans.actions.retry')"
            :aria-label="t('maintenancePlans.actions.retry')"
            small
            @click="fetchPlans"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('maintenancePlans.list.loading') }}
        </p>
      </CardBox>

      <template v-else-if="!errorMessage">
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
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                :to="{ name: 'maintenance-plans-detail', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiEyeOutline"
                :title="t('maintenancePlans.actions.openPlan')"
                :aria-label="t('maintenancePlans.actions.openPlan')"
                small
              />
              <BaseButton
                v-if="canUpdatePlan"
                :to="{ name: 'maintenance-plans-edit', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiPencil"
                :title="t('maintenancePlans.actions.editPlan')"
                :aria-label="t('maintenancePlans.actions.editPlan')"
                small
              />
              <BaseButton
                v-if="canDeletePlan"
                color="danger"
                :icon="mdiTrashCanOutline"
                :title="t('maintenancePlans.actions.deletePlan')"
                :aria-label="t('maintenancePlans.actions.deletePlan')"
                small
                @click="askDelete(row)"
              />
            </BaseButtons>
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

        <CardBox v-if="pagination.total > 0" class="mt-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-gray-500 dark:text-slate-400">
              {{ t('maintenancePlans.pagination.showing', {
                from: pagination.from ?? 0,
                to: pagination.to ?? 0,
                total: pagination.total,
              }) }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <select
                :value="pagination.per_page"
                :class="inputClass"
                class="max-w-28"
                @change="updatePerPage"
              >
                <option v-for="option in perPageOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronLeft"
                :title="t('maintenancePlans.pagination.previousPage')"
                :aria-label="t('maintenancePlans.pagination.previousPage')"
                small
                :disabled="!canGoPrevious"
                @click="canGoPrevious ? updatePage(pagination.current_page - 1) : null"
              />
              <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                {{ t('maintenancePlans.pagination.pageOf', {
                  page: pagination.current_page,
                  pages: pagination.last_page,
                }) }}
              </span>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronRight"
                :title="t('maintenancePlans.pagination.nextPage')"
                :aria-label="t('maintenancePlans.pagination.nextPage')"
                small
                :disabled="!canGoNext"
                @click="canGoNext ? updatePage(pagination.current_page + 1) : null"
              />
            </div>
          </div>
        </CardBox>
      </template>
    </AppPage>

    <CardBoxModal
      v-model="deleteModalOpen"
      :title="t('maintenancePlans.delete.title')"
      button="danger"
      :button-label="t('maintenancePlans.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deletePlan"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        {{ t('maintenancePlans.delete.linkedOrderItemsNote') }}
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

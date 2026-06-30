<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
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
import workshopsApi from '@/modules/workshops/services/workshopsService.js'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService.js'
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
import NotificationBar from '@/components/NotificationBar.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'
import { ROLES } from '@/types/auth.js'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  code: '',
  city: '',
  is_active: '',
  name: '',
  phone: '',
  email: '',
  manager_user_id: '',
  vehicle_system_id: '',
  created_from: '',
  created_to: '',
})

const columns = computed(() => [
  { key: 'workshop', label: t('workshops.columns.workshop') },
  { key: 'manager', label: t('workshops.columns.manager') },
  { key: 'city', label: t('workshops.columns.city') },
  { key: 'vehicle_systems', label: t('workshops.columns.systems') },
  { key: 'is_active', label: t('workshops.columns.status') },
  { key: 'updated_at', label: t('workshops.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const workshops = ref([])
const vehicleSystems = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const vehicleSystemsError = ref('')
const deleteModalOpen = ref(false)
const workshopToDelete = ref(null)
const filtersExpanded = ref(false)
const filters = reactive({ ...EMPTY_FILTERS })

const canCreateWorkshop = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const canUpdateWorkshop = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const canDeleteWorkshop = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const hasActiveFilters = computed(() =>
  Object.values(filters).some((value) => value !== ''),
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
)
const deleteMessage = computed(() => {
  if (!workshopToDelete.value) {
    return ''
  }

  return t('workshops.delete.confirmMessage', { name: workshopToDelete.value.name })
})

const getStringQuery = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
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
  filters.city = getStringQuery(route.query.city)
  filters.is_active = getStringQuery(route.query.is_active)
  filters.name = getStringQuery(route.query.name)
  filters.phone = getStringQuery(route.query.phone)
  filters.email = getStringQuery(route.query.email)
  filters.manager_user_id = getStringQuery(route.query.manager_user_id)
  filters.vehicle_system_id = getStringQuery(route.query.vehicle_system_id)
  filters.created_from = getStringQuery(route.query.created_from)
  filters.created_to = getStringQuery(route.query.created_to)

  if (!['', 'true', 'false'].includes(filters.is_active)) {
    filters.is_active = ''
  }
}

const currentApiFilters = () => {
  const apiFilters = {}
  const managerUserId = getPositiveNumberQuery(filters.manager_user_id)
  const vehicleSystemId = getPositiveNumberQuery(filters.vehicle_system_id)

  if (filters.name) {
    apiFilters.name = filters.name
  }

  if (filters.code) {
    apiFilters.code = filters.code
  }

  if (filters.city) {
    apiFilters.city = filters.city
  }

  if (filters.email) {
    apiFilters.email = filters.email
  }

  if (filters.phone) {
    apiFilters.phone = filters.phone
  }

  if (filters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (filters.is_active === 'false') {
    apiFilters.is_active = false
  }

  if (managerUserId !== null) {
    apiFilters.manager_user_id = managerUserId
  }

  if (vehicleSystemId !== null) {
    apiFilters.vehicle_system_id = vehicleSystemId
  }

  if (filters.created_from) {
    apiFilters.created_from = filters.created_from
  }

  if (filters.created_to) {
    apiFilters.created_to = filters.created_to
  }

  return apiFilters
}

const fetchVehicleSystems = async () => {
  if (vehicleSystems.value.length > 0) {
    return
  }

  vehicleSystemsError.value = ''

  try {
    const data = await vehicleSystemsApi.index({
      page: 1,
      per_page: 100,
    })

    vehicleSystems.value = data.items
  } catch (error) {
    vehicleSystemsError.value = normalizeApiError(error).message
  }
}

const fetchWorkshops = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await workshopsApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    workshops.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void router.push({
    name: 'operations-workshops',
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
    name: 'operations-workshops',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'operations-workshops',
    query: buildQuery(filters, 1, perPage),
  })
}

const askDelete = (workshop) => {
  workshopToDelete.value = workshop
  deleteModalOpen.value = true
}

const deleteWorkshop = async () => {
  if (!workshopToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await workshopsApi.remove(workshopToDelete.value.id)
    deleteModalOpen.value = false
    workshopToDelete.value = null
    await fetchWorkshops()

    if (workshops.value.length === 0 && pagination.value.current_page > 1) {
      updatePage(pagination.value.current_page - 1)
    }
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) =>
  isActive ? t('workshops.status.active') : t('workshops.status.inactive')

const systemSummary = (workshop) => {
  const systems = workshop.vehicle_systems ?? []

  if (systems.length === 0) {
    return '-'
  }

  if (systems.length <= 2) {
    return systems.map((system) => system.name).join(', ')
  }

  return `${systems.slice(0, 2).map((system) => system.name).join(', ')} +${systems.length - 2}`
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
    void fetchVehicleSystems()
    void fetchWorkshops()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('workshops.list.title')"
      :subtitle="t('workshops.list.subtitle')"
      :eyebrow="t('workshops.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateWorkshop"
          :to="{ name: 'operations-workshops-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('workshops.actions.newWorkshop')"
          :aria-label="t('workshops.actions.newWorkshop')"
        />
      </template>

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField :label="t('workshops.filters.search')">
            <FormControl
              v-model="filters.search"
              name="search"
              :placeholder="t('workshops.filters.searchPlaceholder')"
            />
          </FormField>
          <FormField :label="t('workshops.filters.code')">
            <FormControl
              v-model="filters.code"
              name="code"
              :placeholder="t('workshops.filters.codePlaceholder')"
            />
          </FormField>
          <FormField :label="t('workshops.filters.status')">
            <select v-model="filters.is_active" name="is_active" :class="inputClass">
              <option value="">{{ t('workshops.filters.allStatuses') }}</option>
              <option value="true">{{ t('workshops.status.active') }}</option>
              <option value="false">{{ t('workshops.status.inactive') }}</option>
            </select>
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('workshops.filters.name')">
            <FormControl v-model="filters.name" name="name" />
          </FormField>
          <FormField :label="t('workshops.filters.city')">
            <FormControl
              v-model="filters.city"
              name="city"
              :placeholder="t('workshops.filters.cityPlaceholder')"
            />
          </FormField>
          <FormField :label="t('workshops.filters.phone')">
            <FormControl v-model="filters.phone" name="phone" />
          </FormField>
          <FormField :label="t('workshops.filters.email')">
            <FormControl v-model="filters.email" name="email" type="email" />
          </FormField>
          <FormField :label="t('workshops.filters.manager')">
            <UserCombobox
              v-model="filters.manager_user_id"
              name="manager_user_id"
              :placeholder="t('workshops.filters.managerPlaceholder')"
              :role="ROLES.WORKSHOP_MANAGER"
            />
          </FormField>
          <FormField :label="t('workshops.filters.vehicleSystem')">
            <select
              v-model="filters.vehicle_system_id"
              name="vehicle_system_id"
              :class="inputClass"
            >
              <option value="">{{ t('workshops.filters.allSystems') }}</option>
              <option
                v-for="system in vehicleSystems"
                :key="system.id"
                :value="String(system.id)"
              >
                {{ system.name }}
              </option>
            </select>
            <p v-if="vehicleSystemsError" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ vehicleSystemsError }}
            </p>
          </FormField>
          <FormField :label="t('workshops.filters.createdFrom')">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField :label="t('workshops.filters.createdTo')">
            <FormControl v-model="filters.created_to" name="created_to" type="date" />
          </FormField>
        </div>

        <div class="mt-2 flex flex-wrap justify-end gap-2">
          <BaseButton
            color="whiteDark"
            :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown"
            :title="
              filtersExpanded
                ? t('workshops.actions.hideAdvancedFilters')
                : t('workshops.actions.showAdvancedFilters')
            "
            :aria-label="
              filtersExpanded
                ? t('workshops.actions.hideAdvancedFilters')
                : t('workshops.actions.showAdvancedFilters')
            "
            @click="filtersExpanded = !filtersExpanded"
          />
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            :title="t('workshops.actions.clearFilters')"
            :aria-label="t('workshops.actions.clearFilters')"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            :title="t('workshops.actions.applyFilters')"
            :aria-label="t('workshops.actions.applyFilters')"
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
            :title="t('workshops.actions.retry')"
            :aria-label="t('workshops.actions.retry')"
            small
            @click="fetchWorkshops"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('workshops.list.loading') }}
        </p>
      </CardBox>

      <template v-else-if="!errorMessage">
        <AppDataTable
          v-if="workshops.length"
          :columns="columns"
          :rows="workshops"
          :empty-title="t('workshops.list.emptyTitle')"
          :empty-description="t('workshops.list.emptyDescription')"
        >
          <template #cell-workshop="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">{{ row.name }}</p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">{{ row.code }}</p>
            </div>
          </template>
          <template #cell-manager="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ row.manager?.name ?? '-' }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ row.manager?.email ?? '-' }}
              </p>
            </div>
          </template>
          <template #cell-city="{ value }">
            {{ formatValue(value) }}
          </template>
          <template #cell-vehicle_systems="{ row }">
            {{ systemSummary(row) }}
          </template>
          <template #cell-is_active="{ value }">
            <AppBadge :label="statusLabel(value)" :color="statusColor(value)" />
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                :to="{ name: 'operations-workshops-detail', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiEyeOutline"
                :title="t('workshops.actions.openWorkshop')"
                :aria-label="t('workshops.actions.openWorkshop')"
                small
              />
              <BaseButton
                v-if="canUpdateWorkshop"
                :to="{ name: 'operations-workshops-edit', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiPencil"
                :title="t('workshops.actions.editWorkshop')"
                :aria-label="t('workshops.actions.editWorkshop')"
                small
              />
              <BaseButton
                v-if="canDeleteWorkshop"
                color="danger"
                :icon="mdiTrashCanOutline"
                :title="t('workshops.actions.deleteWorkshop')"
                :aria-label="t('workshops.actions.deleteWorkshop')"
                small
                @click="askDelete(row)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('workshops.list.emptyTitle')"
          :description="t('workshops.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateWorkshop"
            :to="{ name: 'operations-workshops-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('workshops.actions.newWorkshop')"
            :aria-label="t('workshops.actions.newWorkshop')"
          />
        </AppEmptyState>

        <CardBox v-if="pagination.total > 0" class="mt-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-gray-500 dark:text-slate-400">
              {{
                t('workshops.pagination.showing', {
                  from: pagination.from ?? 0,
                  to: pagination.to ?? 0,
                  total: pagination.total,
                })
              }}
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
                :title="t('workshops.pagination.previousPage')"
                :aria-label="t('workshops.pagination.previousPage')"
                small
                :disabled="!canGoPrevious"
                @click="canGoPrevious ? updatePage(pagination.current_page - 1) : null"
              />
              <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                {{
                  t('workshops.pagination.pageOf', {
                    page: pagination.current_page,
                    pages: pagination.last_page,
                  })
                }}
              </span>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronRight"
                :title="t('workshops.pagination.nextPage')"
                :aria-label="t('workshops.pagination.nextPage')"
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
      :title="t('workshops.delete.title')"
      button="danger"
      :button-label="t('workshops.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteWorkshop"
    >
      <p>{{ deleteMessage }}</p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiCar,
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
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canDeleteForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { DEFAULT_PAGINATION_META } from '@/types/api.js'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService.js'
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
import OwnerCombobox from '@/modules/owners/components/OwnerCombobox.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  license_plate: '',
  brand: '',
  owner_id: '',
  model: '',
  year: '',
  color: '',
  created_from: '',
  created_to: '',
})

const columns = computed(() => [
  { key: 'vehicle', label: t('vehicles.columns.vehicle') },
  { key: 'owner', label: t('vehicles.columns.owner') },
  { key: 'year', label: t('vehicles.columns.year') },
  { key: 'color', label: t('vehicles.columns.color') },
  { key: 'odometer_km', label: t('vehicles.columns.odometer') },
  { key: 'updated_at', label: t('vehicles.columns.updated') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const vehicles = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)
const vehicleToDelete = ref(null)
const filtersExpanded = ref(false)
const filters = reactive({ ...EMPTY_FILTERS })

const canCreateVehicle = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canUpdateVehicle = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canDeleteVehicle = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const hasActiveFilters = computed(() =>
  Object.values(filters).some((value) => value !== ''),
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
)
const deleteMessage = computed(() => {
  if (!vehicleToDelete.value) {
    return ''
  }

  return t('vehicles.delete.confirmMessage', { plate: vehicleToDelete.value.license_plate })
})
const advancedFiltersLabel = computed(() =>
  filtersExpanded.value
    ? t('vehicles.actions.hideAdvancedFilters')
    : t('vehicles.actions.showAdvancedFilters'),
)

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
  filters.license_plate = getStringQuery(route.query.license_plate)
  filters.brand = getStringQuery(route.query.brand)
  filters.owner_id = getStringQuery(route.query.owner_id)
  filters.model = getStringQuery(route.query.model)
  filters.year = getStringQuery(route.query.year)
  filters.color = getStringQuery(route.query.color)
  filters.created_from = getStringQuery(route.query.created_from)
  filters.created_to = getStringQuery(route.query.created_to)
}

const currentApiFilters = () => {
  const apiFilters = {}
  const ownerId = getPositiveNumberQuery(filters.owner_id)
  const year = getPositiveNumberQuery(filters.year)

  if (filters.license_plate) {
    apiFilters.license_plate = filters.license_plate
  }

  if (filters.brand) {
    apiFilters.brand = filters.brand
  }

  if (filters.model) {
    apiFilters.model = filters.model
  }

  if (year !== null) {
    apiFilters.year = year
  }

  if (filters.color) {
    apiFilters.color = filters.color
  }

  if (ownerId !== null) {
    apiFilters.owner_id = ownerId
  }

  if (filters.created_from) {
    apiFilters.created_from = filters.created_from
  }

  if (filters.created_to) {
    apiFilters.created_to = filters.created_to
  }

  return apiFilters
}

const fetchVehicles = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await vehiclesApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    vehicles.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void router.push({
    name: 'operations-vehicles',
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
    name: 'operations-vehicles',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'operations-vehicles',
    query: buildQuery(filters, 1, perPage),
  })
}

const askDelete = (vehicle) => {
  vehicleToDelete.value = vehicle
  deleteModalOpen.value = true
}

const deleteVehicle = async () => {
  if (!vehicleToDelete.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await vehiclesApi.remove(vehicleToDelete.value.id)
    deleteModalOpen.value = false
    vehicleToDelete.value = null
    await fetchVehicles()

    if (vehicles.value.length === 0 && pagination.value.current_page > 1) {
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

const ownerName = (vehicle) => vehicle.owner?.name ?? t('vehicles.labels.ownerNumber', {
  id: vehicle.owner_id,
})
const vehicleDescription = (vehicle) =>
  [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || '-'

const formatKilometers = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('vehicles.units.kilometers', {
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

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
    void fetchVehicles()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('vehicles.list.title')"
      :subtitle="t('vehicles.list.subtitle')"
      :eyebrow="t('vehicles.page.eyebrow')"
      :icon="mdiCar"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateVehicle"
          :to="{ name: 'operations-vehicles-new' }"
          color="info"
          :icon="mdiPlus"
          :title="t('vehicles.actions.newVehicle')"
          :aria-label="t('vehicles.actions.newVehicle')"
        />
      </template>

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('vehicles.filters.search')">
            <FormControl
              v-model="filters.search"
              name="search"
              :placeholder="t('vehicles.filters.searchPlaceholder')"
            />
          </FormField>
          <FormField :label="t('vehicles.filters.licensePlate')">
            <FormControl
              v-model="filters.license_plate"
              name="license_plate"
              :placeholder="t('vehicles.filters.licensePlatePlaceholder')"
            />
          </FormField>
          <FormField :label="t('vehicles.filters.brand')">
            <FormControl v-model="filters.brand" name="brand" />
          </FormField>
          <FormField :label="t('vehicles.filters.owner')">
            <OwnerCombobox
              v-model="filters.owner_id"
              name="owner_id"
              :placeholder="t('vehicles.filters.ownerPlaceholder')"
            />
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <FormField :label="t('vehicles.filters.model')">
            <FormControl v-model="filters.model" name="model" />
          </FormField>
          <FormField :label="t('vehicles.filters.year')">
            <input
              v-model="filters.year"
              type="number"
              min="1900"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>
          <FormField :label="t('vehicles.filters.color')">
            <FormControl v-model="filters.color" name="color" />
          </FormField>
          <FormField :label="t('vehicles.filters.createdFrom')">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField :label="t('vehicles.filters.createdTo')">
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
            :title="t('vehicles.actions.clearFilters')"
            :aria-label="t('vehicles.actions.clearFilters')"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            :title="t('vehicles.actions.applyFilters')"
            :aria-label="t('vehicles.actions.applyFilters')"
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
            :title="t('vehicles.actions.retry')"
            :aria-label="t('vehicles.actions.retry')"
            small
            @click="fetchVehicles"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('vehicles.list.loading') }}
        </p>
      </CardBox>

      <template v-else-if="!errorMessage">
        <AppDataTable
          v-if="vehicles.length"
          :columns="columns"
          :rows="vehicles"
          :empty-title="t('vehicles.list.emptyTitle')"
          :empty-description="t('vehicles.list.emptyDescription')"
        >
          <template #cell-vehicle="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ row.license_plate }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ vehicleDescription(row) }}
              </p>
            </div>
          </template>
          <template #cell-owner="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ ownerName(row) }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ row.owner?.email ?? '-' }}
              </p>
            </div>
          </template>
          <template #cell-year="{ value }">
            {{ formatValue(value) }}
          </template>
          <template #cell-color="{ value }">
            {{ formatValue(value) }}
          </template>
          <template #cell-odometer_km="{ value }">
            {{ formatKilometers(value) }}
          </template>
          <template #cell-updated_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                :to="{ name: 'operations-vehicles-detail', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiEyeOutline"
                :title="t('vehicles.actions.openVehicle')"
                :aria-label="t('vehicles.actions.openVehicle')"
                small
              />
              <BaseButton
                v-if="canUpdateVehicle"
                :to="{ name: 'operations-vehicles-edit', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiPencil"
                :title="t('vehicles.actions.editVehicle')"
                :aria-label="t('vehicles.actions.editVehicle')"
                small
              />
              <BaseButton
                v-if="canDeleteVehicle"
                color="danger"
                :icon="mdiTrashCanOutline"
                :title="t('vehicles.actions.deleteVehicle')"
                :aria-label="t('vehicles.actions.deleteVehicle')"
                small
                @click="askDelete(row)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('vehicles.list.emptyTitle')"
          :description="t('vehicles.list.emptyDescription')"
        >
          <BaseButton
            v-if="canCreateVehicle"
            :to="{ name: 'operations-vehicles-new' }"
            color="info"
            :icon="mdiPlus"
            :title="t('vehicles.actions.newVehicle')"
            :aria-label="t('vehicles.actions.newVehicle')"
          />
        </AppEmptyState>

        <CardBox v-if="pagination.total > 0" class="mt-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-gray-500 dark:text-slate-400">
              {{ t('vehicles.pagination.showing', {
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
                :title="t('vehicles.pagination.previousPage')"
                :aria-label="t('vehicles.pagination.previousPage')"
                small
                :disabled="!canGoPrevious"
                @click="canGoPrevious ? updatePage(pagination.current_page - 1) : null"
              />
              <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                {{ t('vehicles.pagination.pageOf', {
                  page: pagination.current_page,
                  pages: pagination.last_page,
                }) }}
              </span>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronRight"
                :title="t('vehicles.pagination.nextPage')"
                :aria-label="t('vehicles.pagination.nextPage')"
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
      :title="t('vehicles.delete.title')"
      button="danger"
      :button-label="t('vehicles.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteVehicle"
    >
      <p>{{ deleteMessage }}</p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

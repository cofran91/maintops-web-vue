<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountMultiple,
  mdiCheck,
  mdiChevronLeft,
  mdiChevronRight,
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
import ownersApi from '@/modules/owners/services/ownersService.js'
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
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  is_active: '',
})

const columns = [
  { key: 'owner', label: 'Owner' },
  { key: 'phone', label: 'Phone' },
  { key: 'document_number', label: 'Document' },
  { key: 'address', label: 'Address' },
  { key: 'is_active', label: 'Status' },
  { key: 'updated_at', label: 'Updated' },
  { key: 'actions', label: '' },
]

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const owners = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)
const ownerToDelete = ref(null)
const filters = reactive({ ...EMPTY_FILTERS })

const canCreateOwner = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canUpdateOwner = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canDeleteOwner = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.OWNERS))
const hasActiveFilters = computed(() =>
  Object.values(filters).some((value) => value !== ''),
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
)
const deleteMessage = computed(() => {
  if (!ownerToDelete.value) {
    return ''
  }

  return `This action will delete ${ownerToDelete.value.name}.`
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
  filters.is_active = getStringQuery(route.query.is_active)

  if (!['', 'true', 'false'].includes(filters.is_active)) {
    filters.is_active = ''
  }
}

const currentApiFilters = () => {
  const apiFilters = {}

  if (filters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (filters.is_active === 'false') {
    apiFilters.is_active = false
  }

  return apiFilters
}

const fetchOwners = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await ownersApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    owners.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void router.push({
    name: 'operations-owners',
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
    name: 'operations-owners',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'operations-owners',
    query: buildQuery(filters, 1, perPage),
  })
}

const askDelete = (owner) => {
  ownerToDelete.value = owner
  deleteModalOpen.value = true
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

const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) => (isActive ? 'Active' : 'Inactive')

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
    void fetchOwners()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      title="Owners"
      subtitle="Manage vehicle owner contacts used across fleet and service workflows."
      eyebrow="Operations"
      :icon="mdiAccountMultiple"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateOwner"
          :to="{ name: 'operations-owners-new' }"
          color="info"
          :icon="mdiPlus"
          title="New owner"
          aria-label="New owner"
        />
      </template>

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField label="Search">
            <FormControl
              v-model="filters.search"
              name="search"
              placeholder="Name, email, phone, or document"
            />
          </FormField>
          <FormField label="Status">
            <select v-model="filters.is_active" name="is_active" :class="inputClass">
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </FormField>
        </div>

        <div class="mt-2 flex flex-wrap justify-end gap-2">
          <BaseButton
            color="whiteDark"
            :icon="mdiClose"
            title="Clear filters"
            aria-label="Clear filters"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            title="Apply filters"
            aria-label="Apply filters"
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
            title="Retry"
            aria-label="Retry"
            small
            @click="fetchOwners"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading owners...</p>
      </CardBox>

      <template v-else-if="!errorMessage">
        <AppDataTable
          v-if="owners.length"
          :columns="columns"
          :rows="owners"
          empty-title="No owners found"
          empty-description="Adjust the filters or create a new owner."
        >
          <template #cell-owner="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">{{ row.name }}</p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">{{ row.email }}</p>
            </div>
          </template>
          <template #cell-phone="{ value }">
            {{ formatValue(value) }}
          </template>
          <template #cell-document_number="{ value }">
            {{ formatValue(value) }}
          </template>
          <template #cell-address="{ value }">
            <span class="line-clamp-2">{{ formatValue(value) }}</span>
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
                :to="{ name: 'operations-owners-detail', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiEyeOutline"
                title="Open owner"
                aria-label="Open owner"
                small
              />
              <BaseButton
                v-if="canUpdateOwner"
                :to="{ name: 'operations-owners-edit', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiPencil"
                title="Edit owner"
                aria-label="Edit owner"
                small
              />
              <BaseButton
                v-if="canDeleteOwner"
                color="danger"
                :icon="mdiTrashCanOutline"
                title="Delete owner"
                aria-label="Delete owner"
                small
                @click="askDelete(row)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          title="No owners found"
          description="Adjust the filters or create a new owner."
        >
          <BaseButton
            v-if="canCreateOwner"
            :to="{ name: 'operations-owners-new' }"
            color="info"
            :icon="mdiPlus"
            title="New owner"
            aria-label="New owner"
          />
        </AppEmptyState>

        <CardBox v-if="pagination.total > 0" class="mt-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-gray-500 dark:text-slate-400">
              Showing {{ pagination.from ?? 0 }}-{{ pagination.to ?? 0 }} of {{ pagination.total }}
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
                title="Previous page"
                aria-label="Previous page"
                small
                :disabled="!canGoPrevious"
                @click="canGoPrevious ? updatePage(pagination.current_page - 1) : null"
              />
              <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                Page {{ pagination.current_page }} of {{ pagination.last_page }}
              </span>
              <BaseButton
                color="whiteDark"
                :icon="mdiChevronRight"
                title="Next page"
                aria-label="Next page"
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
      title="Delete owner"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteOwner"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Owner deletion is limited to system administrators by backend policies.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

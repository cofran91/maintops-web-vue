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
import { ROLE_LABELS, ROLES } from '@/types/auth.js'
import usersApi from '@/modules/users/services/usersService.js'
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
import WorkshopCombobox from '@/modules/users/components/WorkshopCombobox.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  role: '',
  is_active: '',
  workshop_id: '',
  without_workshop: false,
})

const columns = [
  { key: 'identity', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'is_active', label: 'Status' },
  { key: 'updated_at', label: 'Updated' },
  { key: 'actions', label: '' },
]

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const users = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)
const userToDelete = ref(null)
const filters = reactive({ ...EMPTY_FILTERS })

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
const canCreateUser = computed(() => canCreateForAnyRole(roles.value, RESOURCES.USERS))
const canUpdateUser = computed(() => canUpdateForAnyRole(roles.value, RESOURCES.USERS))
const canDeleteUser = computed(() => canDeleteForAnyRole(roles.value, RESOURCES.USERS))
const hasActiveFilters = computed(() =>
  Object.entries(filters).some(([key, value]) => {
    if (key === 'without_workshop') {
      return value === true
    }

    return value !== ''
  }),
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
)
const deleteMessage = computed(() => {
  if (!userToDelete.value) {
    return ''
  }

  return `This action will delete ${userToDelete.value.name}.`
})

const getStringQuery = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

const getBooleanQuery = (value) => getStringQuery(value) === 'true'

const getNumberQuery = (value, fallback) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : fallback
}

const buildQuery = (nextFilters, page, perPage) => {
  const query = {}

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (key === 'without_workshop') {
      if (value === true) {
        query[key] = 'true'
      }

      return
    }

    if (key === 'workshop_id' && nextFilters.without_workshop) {
      return
    }

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
  filters.role = getStringQuery(route.query.role)
  filters.is_active = getStringQuery(route.query.is_active)
  filters.workshop_id = getStringQuery(route.query.workshop_id)
  filters.without_workshop = getBooleanQuery(route.query.without_workshop)

  if (!roleFilterOptions.value.includes(filters.role)) {
    filters.role = ''
  }

  if (!showWorkshopFilters.value) {
    filters.workshop_id = ''
    filters.without_workshop = false
  }
}

const currentApiFilters = () => {
  const apiFilters = {}

  if (roleFilterOptions.value.includes(filters.role)) {
    apiFilters.role = filters.role
  }

  if (filters.is_active === 'true') {
    apiFilters.is_active = true
  }

  if (filters.is_active === 'false') {
    apiFilters.is_active = false
  }

  if (showWorkshopFilters.value && filters.without_workshop) {
    apiFilters.without_workshop = true
  }

  if (showWorkshopFilters.value && !filters.without_workshop && filters.workshop_id !== '') {
    apiFilters.workshop_id = filters.workshop_id
  }

  return apiFilters
}

const fetchUsers = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await usersApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    users.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void router.push({
    name: 'operations-users',
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

const handleWithoutWorkshopChange = () => {
  if (filters.without_workshop) {
    filters.workshop_id = ''
  }
}

const updatePage = (page) => {
  void router.push({
    name: 'operations-users',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'operations-users',
    query: buildQuery(filters, 1, perPage),
  })
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
const roleLabel = (role) => (role ? ROLE_LABELS[role] ?? role : '-')
const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) => (isActive ? 'Active' : 'Inactive')
const workshopLabel = (user) => user.workshop?.name ?? user.workshop?.code ?? '-'

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
    void fetchUsers()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      title="Users"
      subtitle="Manage console access, operational roles, and technician workshop assignments."
      eyebrow="Operations"
      :icon="mdiAccountMultiple"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateUser"
          :to="{ name: 'operations-users-new' }"
          color="info"
          :icon="mdiPlus"
          title="New user"
          aria-label="New user"
        />
      </template>

      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField label="Search">
            <FormControl
              v-model="filters.search"
              name="search"
              placeholder="Name, email, phone, or document"
            />
          </FormField>
          <FormField label="Role">
            <select v-model="filters.role" name="role" :class="inputClass">
              <option value="">All roles</option>
              <option v-for="role in roleFilterOptions" :key="role" :value="role">
                {{ roleLabel(role) }}
              </option>
            </select>
          </FormField>
          <FormField label="Status">
            <select v-model="filters.is_active" name="is_active" :class="inputClass">
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </FormField>
          <FormField v-if="showWorkshopFilters" label="Workshop">
            <WorkshopCombobox
              v-model="filters.workshop_id"
              name="workshop_id"
              placeholder="Search by code, name, or city"
              :disabled="filters.without_workshop"
            />
          </FormField>
        </div>

        <div class="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label
            v-if="showWorkshopFilters"
            class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200"
          >
            <input
              v-model="filters.without_workshop"
              type="checkbox"
              class="rounded border-gray-700"
              @change="handleWithoutWorkshopChange"
            >
            Without assigned workshop
          </label>
          <div class="flex flex-wrap gap-2 md:ml-auto">
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
            @click="fetchUsers"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading users...</p>
      </CardBox>

      <template v-else-if="!errorMessage">
        <AppDataTable
          v-if="users.length"
          :columns="columns"
          :rows="users"
          empty-title="No users found"
          empty-description="Adjust the filters or create a new user."
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
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                :to="{ name: 'operations-users-detail', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiEyeOutline"
                title="Open user"
                aria-label="Open user"
                small
              />
              <BaseButton
                v-if="canUpdateUser"
                :to="{ name: 'operations-users-edit', params: { id: row.id } }"
                color="whiteDark"
                :icon="mdiPencil"
                title="Edit user"
                aria-label="Edit user"
                small
              />
              <BaseButton
                v-if="canDeleteUser"
                color="danger"
                :icon="mdiTrashCanOutline"
                title="Delete user"
                aria-label="Delete user"
                small
                @click="askDelete(row)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          title="No users found"
          description="Adjust the filters or create a new user."
        >
          <BaseButton
            v-if="canCreateUser"
            :to="{ name: 'operations-users-new' }"
            color="info"
            :icon="mdiPlus"
            title="New user"
            aria-label="New user"
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
      title="Delete user"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteUser"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        The backend keeps authorization as the source of truth for this operation.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

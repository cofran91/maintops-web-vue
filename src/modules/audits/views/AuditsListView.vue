<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiCheck,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClose,
  mdiEyeOutline,
  mdiRefresh,
  mdiTable,
} from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import { DEFAULT_PAGINATION_META } from '@/types/api.js'
import { AUDIT_EVENTS } from '@/types/audit.js'
import auditsApi from '@/modules/audits/services/auditsService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'

const route = useRoute()
const router = useRouter()

const EMPTY_FILTERS = Object.freeze({
  search: '',
  event: '',
  user_id: '',
  ip_address: '',
  url: '',
  tags: '',
  created_from: '',
  created_to: '',
})

const columns = [
  { key: 'created_at', label: 'Date' },
  { key: 'event', label: 'Event' },
  { key: 'actor', label: 'Actor' },
  { key: 'auditable', label: 'Resource' },
  { key: 'url', label: 'URL' },
  { key: 'ip_address', label: 'IP' },
  { key: 'changes', label: 'Changes' },
  { key: 'actions', label: '' },
]

const eventLabels = Object.freeze({
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  restored: 'Restored',
})

const modelTypeLabels = Object.freeze({
  'App\\Models\\MaintenanceOrder': 'Order',
  'App\\Models\\MaintenanceOrderItem': 'Order item',
  'App\\Models\\MaintenancePlan': 'Maintenance plan',
  'App\\Models\\MaintenanceTask': 'Maintenance task',
  'App\\Models\\Owner': 'Owner',
  'App\\Models\\User': 'User',
  'App\\Models\\Vehicle': 'Vehicle',
  'App\\Models\\VehicleSystem': 'Vehicle system',
  'App\\Models\\Workshop': 'Workshop',
})

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const audits = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION_META })
const loading = ref(false)
const errorMessage = ref('')
const filtersExpanded = ref(false)
const selectedAudit = ref(null)
const filters = reactive({ ...EMPTY_FILTERS })

const hasActiveFilters = computed(() =>
  Object.values(filters).some((value) => value !== ''),
)
const selectedAuditChanges = computed(() =>
  selectedAudit.value ? buildAuditChangeRows(selectedAudit.value) : [],
)
const canGoPrevious = computed(() => pagination.value.current_page > 1)
const canGoNext = computed(
  () => pagination.value.current_page < pagination.value.last_page,
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
  Object.keys(EMPTY_FILTERS).forEach((key) => {
    filters[key] = getStringQuery(route.query[key])
  })
}

const currentApiFilters = () => {
  const apiFilters = {}
  const integerFilters = ['user_id']
  const stringFilters = [
    'event',
    'ip_address',
    'url',
    'tags',
    'created_from',
    'created_to',
  ]

  integerFilters.forEach((key) => {
    const value = getPositiveNumberQuery(filters[key])

    if (value !== null) {
      apiFilters[key] = value
    }
  })

  stringFilters.forEach((key) => {
    if (filters[key]) {
      apiFilters[key] = filters[key]
    }
  })

  return apiFilters
}

const fetchAudits = async () => {
  loading.value = true
  errorMessage.value = ''
  selectedAudit.value = null

  try {
    const data = await auditsApi.index({
      search: filters.search || undefined,
      filters: currentApiFilters(),
      page: getNumberQuery(route.query.page, 1),
      per_page: getNumberQuery(route.query.per_page, DEFAULT_PAGINATION_META.per_page),
    })

    audits.value = data.items
    pagination.value = data.pagination
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  void router.push({
    name: 'access-audit',
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
    name: 'access-audit',
    query: buildQuery(filters, page, pagination.value.per_page),
  })
}

const updatePerPage = (event) => {
  const perPage = Number(event.target.value)

  void router.push({
    name: 'access-audit',
    query: buildQuery(filters, 1, perPage),
  })
}

const selectAudit = (audit) => {
  selectedAudit.value = audit
}

const closeAuditDetail = () => {
  selectedAudit.value = null
}

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const modelTypeLabel = (type) => {
  if (!type) {
    return 'System'
  }

  return modelTypeLabels[type] ?? type.split('\\').at(-1) ?? type
}

const eventLabel = (event) => {
  if (eventLabels[event]) {
    return eventLabels[event]
  }

  return String(event)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const eventColor = (event) => {
  if (String(event).includes('deleted')) {
    return 'danger'
  }

  if (String(event).includes('restored') || String(event).includes('created')) {
    return 'success'
  }

  return String(event).includes('updated') ? 'info' : 'neutral'
}

const extractResourceLabel = (resource) => {
  if (!isRecord(resource)) {
    return null
  }

  const stringKeys = ['name', 'email', 'code', 'license_plate', 'title']
  const value = stringKeys.map((key) => resource[key]).find((item) => typeof item === 'string')

  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }

  return Number.isInteger(resource.id) ? `#${resource.id}` : null
}

const actorLabel = (actor) => {
  if (!actor || (actor.type === null && actor.id === null)) {
    return {
      type: 'System',
      detail: '-',
    }
  }

  return {
    type: modelTypeLabel(actor.type),
    detail: extractResourceLabel(actor.resource) ?? `#${actor.id}`,
  }
}

const auditableLabel = (auditable) => ({
  type: modelTypeLabel(auditable?.type),
  detail: extractResourceLabel(auditable?.resource) ?? `#${auditable?.id ?? '-'}`,
})

const displayUrl = (url) => {
  if (!url) {
    return '-'
  }

  try {
    const parsedUrl = new URL(url)

    return `${parsedUrl.pathname}${parsedUrl.search}` || url
  } catch {
    return url
  }
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const auditValuesToRecord = (values) => (isRecord(values) ? values : {})

const normalizeAuditValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeAuditValue)
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeAuditValue(value[key])]),
    )
  }

  return value
}

const auditValuesAreEqual = (first, second) =>
  JSON.stringify(normalizeAuditValue(first)) === JSON.stringify(normalizeAuditValue(second))

const buildAuditChangeRows = (audit) => {
  const oldValues = auditValuesToRecord(audit.old_values)
  const newValues = auditValuesToRecord(audit.new_values)
  const fields = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])]

  return fields.reduce((changes, field) => {
    const oldValue = oldValues[field]
    const newValue = newValues[field]

    if (auditValuesAreEqual(oldValue, newValue)) {
      return changes
    }

    changes.push({
      field,
      oldValue,
      newValue,
    })

    return changes
  }, [])
}

const changesLabel = (audit) => {
  const changes = buildAuditChangeRows(audit).length

  if (changes === 0) {
    return '-'
  }

  return changes === 1 ? '1 field' : `${changes} fields`
}

const formatAuditValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return JSON.stringify(value, null, 2)
}

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
    void fetchAudits()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      title="Audit log"
      subtitle="Review traceable operational events restricted to super administrators."
      eyebrow="Access"
      :icon="mdiTable"
    >
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
              placeholder="Event, resource, URL, IP, or tags"
            />
          </FormField>
          <FormField label="Event">
            <select v-model="filters.event" name="event" :class="inputClass">
              <option value="">All events</option>
              <option v-for="event in AUDIT_EVENTS" :key="event" :value="event">
                {{ eventLabel(event) }}
              </option>
            </select>
          </FormField>
          <FormField label="Actor">
            <UserCombobox
              v-model="filters.user_id"
              name="user_id"
              placeholder="Search actor by name or email"
              :active-only="false"
            />
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField label="IP address">
            <FormControl
              v-model="filters.ip_address"
              name="ip_address"
              placeholder="127.0.0.1"
            />
          </FormField>
          <FormField label="URL">
            <FormControl v-model="filters.url" name="url" placeholder="/api/v1/users" />
          </FormField>
          <FormField label="Tags">
            <FormControl v-model="filters.tags" name="tags" placeholder="users" />
          </FormField>
          <FormField label="Created from">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField label="Created to">
            <FormControl v-model="filters.created_to" name="created_to" type="date" />
          </FormField>
        </div>

        <div class="mt-2 flex flex-wrap justify-end gap-2">
          <BaseButton
            color="whiteDark"
            :icon="filtersExpanded ? mdiChevronUp : mdiChevronDown"
            :title="filtersExpanded ? 'Hide advanced filters' : 'Show advanced filters'"
            :aria-label="filtersExpanded ? 'Hide advanced filters' : 'Show advanced filters'"
            @click="filtersExpanded = !filtersExpanded"
          />
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
            @click="fetchAudits"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading audit records...</p>
      </CardBox>

      <template v-else-if="!errorMessage">
        <AppDataTable
          v-if="audits.length"
          :columns="columns"
          :rows="audits"
          empty-title="No audit records found"
          empty-description="Adjust the filters to review operational traceability."
        >
          <template #cell-created_at="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-event="{ value }">
            <AppBadge :label="eventLabel(value)" :color="eventColor(value)" />
          </template>
          <template #cell-actor="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ actorLabel(row.actor).type }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ actorLabel(row.actor).detail }}
              </p>
            </div>
          </template>
          <template #cell-auditable="{ row }">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-slate-100">
                {{ auditableLabel(row.auditable).type }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                {{ auditableLabel(row.auditable).detail }}
              </p>
            </div>
          </template>
          <template #cell-url="{ value }">
            <span class="block max-w-xs truncate" :title="value ?? undefined">
              {{ displayUrl(value) }}
            </span>
          </template>
          <template #cell-ip_address="{ value }">
            {{ value ?? '-' }}
          </template>
          <template #cell-changes="{ row }">
            {{ changesLabel(row) }}
          </template>
          <template #cell-actions="{ row }">
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                color="whiteDark"
                :icon="mdiEyeOutline"
                title="View audit details"
                aria-label="View audit details"
                small
                @click="selectAudit(row)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          title="No audit records found"
          description="Adjust the filters to review operational traceability."
        />

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

        <CardBox v-if="selectedAudit" class="mt-6">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Audit #{{ selectedAudit.id }}
              </p>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {{ eventLabel(selectedAudit.event) }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-slate-400">
                {{ formatDate(selectedAudit.created_at) }}
              </p>
            </div>
            <BaseButton
              color="whiteDark"
              :icon="mdiClose"
              title="Close details"
              aria-label="Close details"
              small
              @click="closeAuditDetail"
            />
          </div>

          <dl class="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                Actor
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ actorLabel(selectedAudit.actor).type }} -
                {{ actorLabel(selectedAudit.actor).detail }}
              </dd>
            </div>
            <div>
              <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                Resource
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ auditableLabel(selectedAudit.auditable).type }} -
                {{ auditableLabel(selectedAudit.auditable).detail }}
              </dd>
            </div>
            <div>
              <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                IP address
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ selectedAudit.ip_address ?? '-' }}
              </dd>
            </div>
            <div>
              <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                Tags
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ selectedAudit.tags ?? '-' }}
              </dd>
            </div>
            <div class="md:col-span-2">
              <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                URL
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ displayUrl(selectedAudit.url) }}
              </dd>
            </div>
            <div class="md:col-span-2 xl:col-span-3">
              <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                User agent
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ selectedAudit.user_agent ?? '-' }}
              </dd>
            </div>
          </dl>

          <div v-if="selectedAuditChanges.length" class="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Previous</th>
                  <th>Current</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="change in selectedAuditChanges" :key="change.field">
                  <td data-label="Field">
                    <span class="font-semibold">{{ change.field }}</span>
                  </td>
                  <td data-label="Previous">
                    <pre class="whitespace-pre-wrap text-xs">{{ formatAuditValue(change.oldValue) }}</pre>
                  </td>
                  <td data-label="Current">
                    <pre class="whitespace-pre-wrap text-xs">{{ formatAuditValue(change.newValue) }}</pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="text-sm text-gray-500 dark:text-slate-400">
            This audit record does not include old or new value differences.
          </p>
        </CardBox>
      </template>
    </AppPage>
  </LayoutAuthenticated>
</template>

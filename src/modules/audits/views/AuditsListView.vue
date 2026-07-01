<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiCheck,
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiEyeOutline,
  mdiTable,
} from '@mdi/js'
import { AUDIT_EVENTS } from '@/types/audit.js'
import { useResourceList } from '@/modules/shared/composables/useResourceList.js'
import { getPositiveNumberQuery } from '@/modules/shared/utils/queryParams.js'
import { formatDate as formatDateValue } from '@/modules/shared/utils/formatters.js'
import {
  changesLabel,
  extractResourceLabel,
} from '@/modules/audits/utils/auditChanges.js'
import {
  displayUrl,
  eventColor,
  eventLabel as auditEventLabel,
  modelTypeLabel,
} from '@/modules/audits/utils/auditLabels.js'
import auditsApi from '@/modules/audits/services/auditsService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import AuditDetailPanel from '@/modules/audits/components/AuditDetailPanel.vue'
import ResourceListStatus from '@/modules/shared/components/ResourceListStatus.vue'
import ResourcePagination from '@/modules/shared/components/ResourcePagination.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'

const { locale, t } = useI18n()

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

const columns = computed(() => [
  { key: 'created_at', label: t('audits.columns.date') },
  { key: 'event', label: t('audits.columns.event') },
  { key: 'actor', label: t('audits.columns.actor') },
  { key: 'auditable', label: t('audits.columns.resource') },
  { key: 'url', label: t('audits.columns.url') },
  { key: 'ip_address', label: t('audits.columns.ip') },
  { key: 'changes', label: t('audits.columns.changes') },
  { key: 'actions', label: '' },
])

const perPageOptions = [10, 15, 25, 50]
const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const filtersExpanded = ref(false)
const selectedAudit = ref(null)

const currentApiFilters = (nextFilters) => {
  const apiFilters = {}
  const userId = getPositiveNumberQuery(nextFilters.user_id)
  const stringFilters = [
    'event',
    'ip_address',
    'url',
    'tags',
    'created_from',
    'created_to',
  ]

  if (userId !== null) {
    apiFilters.user_id = userId
  }

  stringFilters.forEach((key) => {
    if (nextFilters[key]) {
      apiFilters[key] = nextFilters[key]
    }
  })

  return apiFilters
}

const fetchAuditsList = (params) => {
  selectedAudit.value = null

  return auditsApi.index(params)
}

const {
  items: audits,
  pagination,
  loading,
  errorMessage,
  filters,
  hasActiveFilters,
  fetchItems: fetchAudits,
  applyFilters,
  applyFiltersOnFocusOut,
  clearFilters,
  updatePage,
  updatePerPage,
} = useResourceList({
  routeName: 'access-audit',
  emptyFilters: EMPTY_FILTERS,
  fetcher: fetchAuditsList,
  toApiFilters: currentApiFilters,
})

const advancedFiltersLabel = computed(() =>
  filtersExpanded.value
    ? t('audits.actions.hideAdvancedFilters')
    : t('audits.actions.showAdvancedFilters'),
)

const selectAudit = (audit) => {
  selectedAudit.value = audit
}

const closeAuditDetail = () => {
  selectedAudit.value = null
}

const eventLabel = (event) => auditEventLabel(event, t)

const actorLabel = (actor) => {
  if (!actor || (actor.type === null && actor.id === null)) {
    return {
      type: t('audits.modelTypes.system'),
      detail: '-',
    }
  }

  return {
    type: modelTypeLabel(actor.type, t),
    detail: extractResourceLabel(actor.resource) ?? `#${actor.id}`,
  }
}

const auditableLabel = (auditable) => ({
  type: modelTypeLabel(auditable?.type, t),
  detail: extractResourceLabel(auditable?.resource) ?? `#${auditable?.id ?? '-'}`,
})

const auditChangesLabel = (audit) => changesLabel(audit, t)

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="t('audits.list.title')"
      :subtitle="t('audits.list.subtitle')"
      :eyebrow="t('audits.page.eyebrow')"
      :icon="mdiTable"
    >
      <CardBox
        is-form
        class="mb-6"
        @submit.prevent="applyFilters"
        @focusout="applyFiltersOnFocusOut"
      >
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('audits.filters.search')">
            <FormControl
              v-model="filters.search"
              name="search"
              :placeholder="t('audits.filters.searchPlaceholder')"
            />
          </FormField>
          <FormField :label="t('audits.filters.event')">
            <select v-model="filters.event" name="event" :class="inputClass">
              <option value="">{{ t('audits.filters.allEvents') }}</option>
              <option v-for="event in AUDIT_EVENTS" :key="event" :value="event">
                {{ eventLabel(event) }}
              </option>
            </select>
          </FormField>
          <FormField :label="t('audits.filters.actor')">
            <UserCombobox
              v-model="filters.user_id"
              name="user_id"
              :placeholder="t('audits.filters.actorPlaceholder')"
              :active-only="false"
            />
          </FormField>
        </div>

        <div v-if="filtersExpanded" class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <FormField :label="t('audits.filters.ipAddress')">
            <FormControl
              v-model="filters.ip_address"
              name="ip_address"
              placeholder="127.0.0.1"
            />
          </FormField>
          <FormField :label="t('audits.filters.url')">
            <FormControl v-model="filters.url" name="url" placeholder="/api/v1/users" />
          </FormField>
          <FormField :label="t('audits.filters.tags')">
            <FormControl v-model="filters.tags" name="tags" placeholder="users" />
          </FormField>
          <FormField :label="t('audits.filters.createdFrom')">
            <FormControl v-model="filters.created_from" name="created_from" type="date" />
          </FormField>
          <FormField :label="t('audits.filters.createdTo')">
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
            :title="t('audits.actions.clearFilters')"
            :aria-label="t('audits.actions.clearFilters')"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          />
          <BaseButton
            color="info"
            :icon="mdiCheck"
            :title="t('audits.actions.applyFilters')"
            :aria-label="t('audits.actions.applyFilters')"
            type="submit"
          />
        </div>
      </CardBox>

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('audits.list.loading')"
        :retry-label="t('audits.actions.retry')"
        @retry="fetchAudits"
      />

      <template v-if="!loading && !errorMessage">
        <AppDataTable
          v-if="audits.length"
          :columns="columns"
          :rows="audits"
          :empty-title="t('audits.list.emptyTitle')"
          :empty-description="t('audits.list.emptyDescription')"
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
            {{ auditChangesLabel(row) }}
          </template>
          <template #cell-actions="{ row }">
            <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
              <BaseButton
                color="whiteDark"
                :icon="mdiEyeOutline"
                :title="t('audits.actions.viewDetails')"
                :aria-label="t('audits.actions.viewDetails')"
                small
                @click="selectAudit(row)"
              />
            </BaseButtons>
          </template>
        </AppDataTable>

        <AppEmptyState
          v-else
          :title="t('audits.list.emptyTitle')"
          :description="t('audits.list.emptyDescription')"
        />

        <ResourcePagination
          :pagination="pagination"
          :per-page-options="perPageOptions"
          :input-class="inputClass"
          :showing-label="
            t('audits.pagination.showing', {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })
          "
          :page-label="
            t('audits.pagination.pageOf', {
              page: pagination.current_page,
              pages: pagination.last_page,
            })
          "
          :previous-label="t('audits.pagination.previousPage')"
          :next-label="t('audits.pagination.nextPage')"
          @update-page="updatePage"
          @update-per-page="updatePerPage"
        />

        <AuditDetailPanel
          v-if="selectedAudit"
          :audit="selectedAudit"
          @close="closeAuditDetail"
        />
      </template>
    </AppPage>
  </LayoutAuthenticated>
</template>

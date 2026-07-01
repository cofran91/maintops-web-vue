<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiArrowLeft,
  mdiCalendar,
  mdiFileDocumentOutline,
  mdiPencil,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { useResourceDetail } from '@/modules/shared/composables/useResourceDetail.js'
import {
  emptyFallback,
  formatDate as formatDateValue,
  formatTranslatedUnit,
} from '@/modules/shared/utils/formatters.js'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import DeleteResourceModal from '@/modules/shared/components/DeleteResourceModal.vue'
import ResourceListStatus from '@/modules/shared/components/ResourceListStatus.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { locale, t } = useI18n()

const {
  resource: plan,
  loading,
  deleting,
  errorMessage,
  deleteModalOpen,
  fetchResource: fetchPlan,
  deleteResource: deletePlan,
} = useResourceDetail({
  fetcher: maintenancePlansApi.show,
  remover: maintenancePlansApi.remove,
  redirectTo: { name: 'maintenance-plans' },
})

const taskColumns = computed(() => [
  { key: 'task', label: t('maintenancePlans.taskColumns.task') },
  { key: 'vehicle_system', label: t('maintenancePlans.taskColumns.system') },
  { key: 'scope', label: t('maintenancePlans.taskColumns.scope') },
  { key: 'estimated_duration_minutes', label: t('maintenancePlans.taskColumns.duration') },
  { key: 'is_active', label: t('maintenancePlans.taskColumns.active') },
])

const tasks = computed(() => plan.value?.tasks ?? [])
const canUpdatePlan = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const canDeletePlan = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const title = computed(() => plan.value?.name ?? t('maintenancePlans.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!plan.value) {
    return ''
  }

  return t('maintenancePlans.delete.confirmMessage', { name: plan.value.name })
})

const daysLabel = (value) =>
  formatTranslatedUnit(value, locale.value, t, 'maintenancePlans.units.days')

const kilometersLabel = (value) =>
  formatTranslatedUnit(value, locale.value, t, 'maintenancePlans.units.kilometers')

const durationLabel = (value) =>
  formatTranslatedUnit(value, locale.value, t, 'maintenancePlans.units.minutes')

const scopeLabel = (task) => {
  if (!task.vehicle) {
    return t('maintenancePlans.labels.reusable')
  }

  return task.vehicle.license_plate ?? t('maintenancePlans.labels.vehicleNumber', {
    id: task.vehicle_id,
  })
}

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const activeLabel = (isActive) =>
  isActive ? t('maintenancePlans.labels.active') : t('maintenancePlans.labels.inactive')

const planItems = computed(() => {
  if (!plan.value) {
    return []
  }

  return [
    { icon: mdiFileDocumentOutline, label: t('maintenancePlans.fields.code'), value: plan.value.code },
    { icon: mdiWrenchOutline, label: t('maintenancePlans.fields.name'), value: plan.value.name },
    {
      icon: mdiCalendar,
      label: t('maintenancePlans.fields.recommendedDays'),
      value: daysLabel(plan.value.recommended_interval_days),
    },
    {
      icon: mdiCalendar,
      label: t('maintenancePlans.fields.recommendedKilometers'),
      value: kilometersLabel(plan.value.recommended_interval_km),
    },
    { icon: mdiCalendar, label: t('maintenancePlans.fields.created'), value: formatDate(plan.value.created_at) },
    { icon: mdiCalendar, label: t('maintenancePlans.fields.updated'), value: formatDate(plan.value.updated_at) },
  ]
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="t('maintenancePlans.detail.subtitle')"
      :eyebrow="t('maintenancePlans.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'maintenance-plans' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('maintenancePlans.actions.backToPlans')"
          :aria-label="t('maintenancePlans.actions.backToPlans')"
        />
        <BaseButton
          v-if="plan && canUpdatePlan"
          :to="{ name: 'maintenance-plans-edit', params: { id: plan.id } }"
          color="info"
          :icon="mdiPencil"
          :title="t('maintenancePlans.actions.editPlan')"
          :aria-label="t('maintenancePlans.actions.editPlan')"
        />
        <BaseButton
          v-if="plan && canDeletePlan"
          color="danger"
          :icon="mdiTrashCanOutline"
          :title="t('maintenancePlans.actions.deletePlan')"
          :aria-label="t('maintenancePlans.actions.deletePlan')"
          @click="deleteModalOpen = true"
        />
      </template>

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('maintenancePlans.detail.loading')"
        :retry-label="t('maintenancePlans.actions.retry')"
        @retry="fetchPlan"
      />

      <AppEmptyState
        v-if="!loading && !plan && !errorMessage"
        :title="t('maintenancePlans.detail.unavailableTitle')"
        :description="t('maintenancePlans.detail.unavailableDescription')"
      />

      <div v-if="!loading && plan" class="grid grid-cols-1 gap-6">
        <CardBox>
          <div class="mb-5 flex flex-wrap gap-2">
            <AppBadge
              :label="activeLabel(plan.is_active)"
              :color="plan.is_active ? 'success' : 'danger'"
            />
            <AppBadge
              :label="t('maintenancePlans.labels.tasksCount', { count: tasks.length })"
              color="info"
            />
          </div>

          <dl class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div v-for="item in planItems" :key="item.label">
              <dt
                class="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500
                  dark:text-slate-400"
              >
                <BaseIcon :path="item.icon" size="16" />
                {{ item.label }}
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ item.value }}
              </dd>
            </div>
          </dl>

          <div class="mt-6">
            <p class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
              {{ t('maintenancePlans.fields.description') }}
            </p>
            <p class="whitespace-pre-line text-sm text-gray-700 dark:text-slate-200">
              {{ emptyFallback(plan.description) }}
            </p>
          </div>
        </CardBox>

        <CardBox>
          <AppDataTable
            v-if="tasks.length"
            :columns="taskColumns"
            :rows="tasks"
            :empty-title="t('maintenancePlans.detail.noTasksAssignedTitle')"
            :empty-description="t('maintenancePlans.detail.noTasksAssignedDescription')"
          >
            <template #cell-task="{ row }">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ row.name }}
                </p>
                <p class="truncate text-sm text-gray-500 dark:text-slate-400">
                  {{ row.code }}
                </p>
              </div>
            </template>
            <template #cell-vehicle_system="{ row }">
              {{ row.vehicle_system?.name ?? '-' }}
            </template>
            <template #cell-scope="{ row }">
              {{ scopeLabel(row) }}
            </template>
            <template #cell-estimated_duration_minutes="{ value }">
              {{ durationLabel(value) }}
            </template>
            <template #cell-is_active="{ value }">
              <AppBadge
                :label="activeLabel(value)"
                :color="value ? 'success' : 'danger'"
              />
            </template>
          </AppDataTable>

          <AppEmptyState
            v-else
            :title="t('maintenancePlans.detail.noTasksAssignedTitle')"
            :description="t('maintenancePlans.detail.noTasksAssignedDescription')"
          />
        </CardBox>
      </div>
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

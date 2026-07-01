<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiArrowLeft,
  mdiCalendar,
  mdiCar,
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
import { MAINTENANCE_TASK_STATUS } from '@/types/maintenanceTask.js'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
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
  resource: task,
  loading,
  deleting,
  errorMessage,
  deleteModalOpen,
  fetchResource: fetchTask,
  deleteResource: deleteTask,
} = useResourceDetail({
  fetcher: maintenanceTasksApi.show,
  remover: maintenanceTasksApi.remove,
  redirectTo: { name: 'maintenance-tasks' },
})

const canUpdateTask = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const canDeleteTask = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const title = computed(() => task.value?.name ?? t('maintenanceTasks.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!task.value) {
    return ''
  }

  return t('maintenanceTasks.delete.confirmMessage', { name: task.value.name })
})

const statusColor = (status) => {
  const colors = {
    [MAINTENANCE_TASK_STATUS.CREATED]: 'neutral',
    [MAINTENANCE_TASK_STATUS.SCHEDULED]: 'info',
    [MAINTENANCE_TASK_STATUS.STARTED]: 'warning',
    [MAINTENANCE_TASK_STATUS.CANCELLED]: 'danger',
    [MAINTENANCE_TASK_STATUS.COMPLETED]: 'success',
    [MAINTENANCE_TASK_STATUS.REJECTED]: 'danger',
  }

  return colors[status] ?? 'neutral'
}

const durationLabel = (value) =>
  formatTranslatedUnit(value, locale.value, t, 'maintenanceTasks.units.minutes')

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const statusLabel = (status) => t(`maintenanceTasks.status.${status}`)
const activeLabel = (isActive) =>
  isActive ? t('maintenanceTasks.labels.active') : t('maintenanceTasks.labels.inactive')

const taskItems = computed(() => {
  if (!task.value) {
    return []
  }

  return [
    { icon: mdiFileDocumentOutline, label: t('maintenanceTasks.fields.code'), value: task.value.code },
    { icon: mdiWrenchOutline, label: t('maintenanceTasks.fields.name'), value: task.value.name },
    {
      icon: mdiWrenchOutline,
      label: t('maintenanceTasks.fields.vehicleSystem'),
      value: task.value.vehicle_system?.name ?? '-',
    },
    {
      icon: mdiCalendar,
      label: t('maintenanceTasks.fields.estimatedDuration'),
      value: durationLabel(task.value.estimated_duration_minutes),
    },
    { icon: mdiCalendar, label: t('maintenanceTasks.fields.created'), value: formatDate(task.value.created_at) },
    { icon: mdiCalendar, label: t('maintenanceTasks.fields.updated'), value: formatDate(task.value.updated_at) },
  ]
})

const vehicleItems = computed(() => {
  if (!task.value) {
    return []
  }

  const vehicle = task.value.vehicle

  return [
    {
      icon: mdiCar,
      label: t('maintenanceTasks.fields.scope'),
      value: vehicle
        ? t('maintenanceTasks.labels.vehicleSpecific')
        : t('maintenanceTasks.labels.reusable'),
    },
    {
      icon: mdiCar,
      label: t('maintenanceTasks.fields.licensePlate'),
      value: emptyFallback(vehicle?.license_plate),
    },
    { icon: mdiCar, label: t('maintenanceTasks.fields.brand'), value: emptyFallback(vehicle?.brand) },
    { icon: mdiCar, label: t('maintenanceTasks.fields.model'), value: emptyFallback(vehicle?.model) },
    { icon: mdiCar, label: t('maintenanceTasks.fields.year'), value: emptyFallback(vehicle?.year) },
    { icon: mdiCar, label: t('maintenanceTasks.fields.color'), value: emptyFallback(vehicle?.color) },
  ]
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="t('maintenanceTasks.detail.subtitle')"
      :eyebrow="t('maintenanceTasks.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'maintenance-tasks' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('maintenanceTasks.actions.backToTasks')"
          :aria-label="t('maintenanceTasks.actions.backToTasks')"
        />
        <BaseButton
          v-if="task && canUpdateTask"
          :to="{ name: 'maintenance-tasks-edit', params: { id: task.id } }"
          color="info"
          :icon="mdiPencil"
          :title="t('maintenanceTasks.actions.editTask')"
          :aria-label="t('maintenanceTasks.actions.editTask')"
        />
        <BaseButton
          v-if="task && canDeleteTask"
          color="danger"
          :icon="mdiTrashCanOutline"
          :title="t('maintenanceTasks.actions.deleteTask')"
          :aria-label="t('maintenanceTasks.actions.deleteTask')"
          @click="deleteModalOpen = true"
        />
      </template>

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('maintenanceTasks.detail.loading')"
        :retry-label="t('maintenanceTasks.actions.retry')"
        @retry="fetchTask"
      />

      <AppEmptyState
        v-if="!loading && !task && !errorMessage"
        :title="t('maintenanceTasks.detail.unavailableTitle')"
        :description="t('maintenanceTasks.detail.unavailableDescription')"
      />

      <div
        v-if="!loading && task"
        class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]"
      >
        <CardBox>
          <div class="mb-5 flex flex-wrap gap-2">
            <AppBadge
              :label="statusLabel(task.status)"
              :color="statusColor(task.status)"
            />
            <AppBadge
              :label="activeLabel(task.is_active)"
              :color="task.is_active ? 'success' : 'danger'"
            />
          </div>

          <dl class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div v-for="item in taskItems" :key="item.label">
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
              {{ t('maintenanceTasks.fields.description') }}
            </p>
            <p class="whitespace-pre-line text-sm text-gray-700 dark:text-slate-200">
              {{ emptyFallback(task.description) }}
            </p>
          </div>
        </CardBox>

        <CardBox>
          <div class="space-y-5">
            <div v-for="item in vehicleItems" :key="item.label">
              <p
                class="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500
                  dark:text-slate-400"
              >
                <BaseIcon :path="item.icon" size="16" />
                {{ item.label }}
              </p>
              <p class="break-words text-sm font-semibold text-gray-900 dark:text-slate-100">
                {{ item.value }}
              </p>
            </div>
          </div>
        </CardBox>
      </div>
    </AppPage>

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('maintenanceTasks.delete.title')"
      :delete-label="t('maintenanceTasks.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteTask"
    />
  </LayoutAuthenticated>
</template>

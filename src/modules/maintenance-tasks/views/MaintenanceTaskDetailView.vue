<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiArrowLeft,
  mdiCalendar,
  mdiCar,
  mdiClose,
  mdiFileDocumentOutline,
  mdiPencil,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import {
  MAINTENANCE_TASK_STATUS,
  MAINTENANCE_TASK_STATUS_LABELS,
} from '@/types/maintenanceTask.js'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const task = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const taskId = computed(() => String(route.params.id ?? ''))
const canUpdateTask = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const canDeleteTask = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const title = computed(() => task.value?.name ?? 'Maintenance task detail')
const deleteMessage = computed(() => {
  if (!task.value) {
    return ''
  }

  return `This action will delete task ${task.value.name}.`
})

const fetchTask = async () => {
  loading.value = true
  errorMessage.value = ''
  task.value = null

  try {
    task.value = await maintenanceTasksApi.show(taskId.value)
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const deleteTask = async () => {
  if (!task.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await maintenanceTasksApi.remove(task.value.id)
    deleteModalOpen.value = false
    await router.push({ name: 'maintenance-tasks' })
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

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

const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

const durationLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${new Intl.NumberFormat('en').format(value)} min`
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

const taskItems = computed(() => {
  if (!task.value) {
    return []
  }

  return [
    { icon: mdiFileDocumentOutline, label: 'Code', value: task.value.code },
    { icon: mdiWrenchOutline, label: 'Name', value: task.value.name },
    {
      icon: mdiWrenchOutline,
      label: 'Vehicle system',
      value: task.value.vehicle_system?.name ?? '-',
    },
    {
      icon: mdiCalendar,
      label: 'Estimated duration',
      value: durationLabel(task.value.estimated_duration_minutes),
    },
    { icon: mdiCalendar, label: 'Created', value: formatDate(task.value.created_at) },
    { icon: mdiCalendar, label: 'Updated', value: formatDate(task.value.updated_at) },
  ]
})

const vehicleItems = computed(() => {
  if (!task.value) {
    return []
  }

  const vehicle = task.value.vehicle

  return [
    { icon: mdiCar, label: 'Scope', value: vehicle ? 'Vehicle-specific' : 'Reusable' },
    { icon: mdiCar, label: 'License plate', value: formatValue(vehicle?.license_plate) },
    { icon: mdiCar, label: 'Brand', value: formatValue(vehicle?.brand) },
    { icon: mdiCar, label: 'Model', value: formatValue(vehicle?.model) },
    { icon: mdiCar, label: 'Year', value: formatValue(vehicle?.year) },
    { icon: mdiCar, label: 'Color', value: formatValue(vehicle?.color) },
  ]
})

watch(
  taskId,
  () => {
    void fetchTask()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      subtitle="Review task definition, operational scope, status, and vehicle context."
      eyebrow="Maintenance"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'maintenance-tasks' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back to tasks"
          aria-label="Back to tasks"
        />
        <BaseButton
          v-if="task && canUpdateTask"
          :to="{ name: 'maintenance-tasks-edit', params: { id: task.id } }"
          color="info"
          :icon="mdiPencil"
          title="Edit task"
          aria-label="Edit task"
        />
        <BaseButton
          v-if="task && canDeleteTask"
          color="danger"
          :icon="mdiTrashCanOutline"
          title="Delete task"
          aria-label="Delete task"
          @click="deleteModalOpen = true"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            title="Retry"
            aria-label="Retry"
            small
            @click="fetchTask"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading maintenance task...</p>
      </CardBox>

      <AppEmptyState
        v-else-if="!task && !errorMessage"
        title="Maintenance task unavailable"
        description="There is no task data to display."
      />

      <div v-else-if="task" class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <CardBox>
          <div class="mb-5 flex flex-wrap gap-2">
            <AppBadge
              :label="MAINTENANCE_TASK_STATUS_LABELS[task.status] ?? task.status"
              :color="statusColor(task.status)"
            />
            <AppBadge
              :label="task.is_active ? 'Active' : 'Inactive'"
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
              Description
            </p>
            <p class="whitespace-pre-line text-sm text-gray-700 dark:text-slate-200">
              {{ formatValue(task.description) }}
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

    <CardBoxModal
      v-model="deleteModalOpen"
      title="Delete maintenance task"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteTask"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Task deletion is limited to system administrators by backend policies.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

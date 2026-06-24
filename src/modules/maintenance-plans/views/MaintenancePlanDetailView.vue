<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiArrowLeft,
  mdiCalendar,
  mdiClose,
  mdiFileDocumentOutline,
  mdiPencil,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
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

const plan = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const taskColumns = [
  { key: 'task', label: 'Task' },
  { key: 'vehicle_system', label: 'System' },
  { key: 'scope', label: 'Scope' },
  { key: 'estimated_duration_minutes', label: 'Duration' },
  { key: 'is_active', label: 'Active' },
]

const planId = computed(() => String(route.params.id ?? ''))
const tasks = computed(() => plan.value?.tasks ?? [])
const canUpdatePlan = computed(() =>
  canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const canDeletePlan = computed(() =>
  canDeleteForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const title = computed(() => plan.value?.name ?? 'Maintenance plan detail')
const deleteMessage = computed(() => {
  if (!plan.value) {
    return ''
  }

  return `This action will delete plan ${plan.value.name}.`
})

const fetchPlan = async () => {
  loading.value = true
  errorMessage.value = ''
  plan.value = null

  try {
    plan.value = await maintenancePlansApi.show(planId.value)
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const deletePlan = async () => {
  if (!plan.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await maintenancePlansApi.remove(plan.value.id)
    deleteModalOpen.value = false
    await router.push({ name: 'maintenance-plans' })
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

const daysLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${new Intl.NumberFormat('en').format(value)} days`
}

const kilometersLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${new Intl.NumberFormat('en').format(value)} km`
}

const durationLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${new Intl.NumberFormat('en').format(value)} min`
}

const scopeLabel = (task) => {
  if (!task.vehicle) {
    return 'Reusable'
  }

  return task.vehicle.license_plate ?? `Vehicle #${task.vehicle_id}`
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

const planItems = computed(() => {
  if (!plan.value) {
    return []
  }

  return [
    { icon: mdiFileDocumentOutline, label: 'Code', value: plan.value.code },
    { icon: mdiWrenchOutline, label: 'Name', value: plan.value.name },
    {
      icon: mdiCalendar,
      label: 'Recommended days',
      value: daysLabel(plan.value.recommended_interval_days),
    },
    {
      icon: mdiCalendar,
      label: 'Recommended kilometers',
      value: kilometersLabel(plan.value.recommended_interval_km),
    },
    { icon: mdiCalendar, label: 'Created', value: formatDate(plan.value.created_at) },
    { icon: mdiCalendar, label: 'Updated', value: formatDate(plan.value.updated_at) },
  ]
})

watch(
  planId,
  () => {
    void fetchPlan()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      subtitle="Review grouped tasks, recommended intervals, and availability."
      eyebrow="Maintenance"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'maintenance-plans' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back to plans"
          aria-label="Back to plans"
        />
        <BaseButton
          v-if="plan && canUpdatePlan"
          :to="{ name: 'maintenance-plans-edit', params: { id: plan.id } }"
          color="info"
          :icon="mdiPencil"
          title="Edit plan"
          aria-label="Edit plan"
        />
        <BaseButton
          v-if="plan && canDeletePlan"
          color="danger"
          :icon="mdiTrashCanOutline"
          title="Delete plan"
          aria-label="Delete plan"
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
            @click="fetchPlan"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading maintenance plan...</p>
      </CardBox>

      <AppEmptyState
        v-else-if="!plan && !errorMessage"
        title="Maintenance plan unavailable"
        description="There is no plan data to display."
      />

      <div v-else-if="plan" class="grid grid-cols-1 gap-6">
        <CardBox>
          <div class="mb-5 flex flex-wrap gap-2">
            <AppBadge
              :label="plan.is_active ? 'Active' : 'Inactive'"
              :color="plan.is_active ? 'success' : 'danger'"
            />
            <AppBadge :label="`${tasks.length} tasks`" color="info" />
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
              Description
            </p>
            <p class="whitespace-pre-line text-sm text-gray-700 dark:text-slate-200">
              {{ formatValue(plan.description) }}
            </p>
          </div>
        </CardBox>

        <CardBox>
          <AppDataTable
            v-if="tasks.length"
            :columns="taskColumns"
            :rows="tasks"
            empty-title="No tasks assigned"
            empty-description="Edit the plan to associate maintenance tasks."
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
                :label="value ? 'Active' : 'Inactive'"
                :color="value ? 'success' : 'danger'"
              />
            </template>
          </AppDataTable>

          <AppEmptyState
            v-else
            title="No tasks assigned"
            description="Edit the plan to associate maintenance tasks."
          />
        </CardBox>
      </div>
    </AppPage>

    <CardBoxModal
      v-model="deleteModalOpen"
      title="Delete maintenance plan"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deletePlan"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Plans linked to order items cannot be deleted by backend policy.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

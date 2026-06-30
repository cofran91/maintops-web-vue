<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
const { locale, t } = useI18n()

const plan = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const taskColumns = computed(() => [
  { key: 'task', label: t('maintenancePlans.taskColumns.task') },
  { key: 'vehicle_system', label: t('maintenancePlans.taskColumns.system') },
  { key: 'scope', label: t('maintenancePlans.taskColumns.scope') },
  { key: 'estimated_duration_minutes', label: t('maintenancePlans.taskColumns.duration') },
  { key: 'is_active', label: t('maintenancePlans.taskColumns.active') },
])

const planId = computed(() => String(route.params.id ?? ''))
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

  return t('maintenancePlans.units.days', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const kilometersLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('maintenancePlans.units.kilometers', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const durationLabel = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('maintenancePlans.units.minutes', {
    value: new Intl.NumberFormat(locale.value).format(value),
  })
}

const scopeLabel = (task) => {
  if (!task.vehicle) {
    return t('maintenancePlans.labels.reusable')
  }

  return task.vehicle.license_plate ?? t('maintenancePlans.labels.vehicleNumber', {
    id: task.vehicle_id,
  })
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

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

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('maintenancePlans.actions.retry')"
            :aria-label="t('maintenancePlans.actions.retry')"
            small
            @click="fetchPlan"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('maintenancePlans.detail.loading') }}
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="!plan && !errorMessage"
        :title="t('maintenancePlans.detail.unavailableTitle')"
        :description="t('maintenancePlans.detail.unavailableDescription')"
      />

      <div v-else-if="plan" class="grid grid-cols-1 gap-6">
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
              {{ formatValue(plan.description) }}
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

    <CardBoxModal
      v-model="deleteModalOpen"
      :title="t('maintenancePlans.delete.title')"
      button="danger"
      :button-label="t('maintenancePlans.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deletePlan"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        {{ t('maintenancePlans.delete.linkedOrderItemsNote') }}
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

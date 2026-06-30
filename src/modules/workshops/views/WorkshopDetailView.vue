<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccount,
  mdiArrowLeft,
  mdiCalendar,
  mdiClose,
  mdiEmailOutline,
  mdiMapMarkerOutline,
  mdiPencil,
  mdiPhoneOutline,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { WORKSHOP_DAYS } from '@/types/workshop.js'
import workshopsApi from '@/modules/workshops/services/workshopsService.js'
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
const { locale, t } = useI18n()

const workshop = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const workshopId = computed(() => String(route.params.id ?? ''))
const canUpdateWorkshop = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const canDeleteWorkshop = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const title = computed(() => workshop.value?.name ?? t('workshops.detail.titleFallback'))
const systems = computed(() => workshop.value?.vehicle_systems ?? [])
const technicians = computed(() => workshop.value?.technicians ?? [])
const deleteMessage = computed(() => {
  if (!workshop.value) {
    return ''
  }

  return t('workshops.delete.confirmMessage', { name: workshop.value.name })
})

const fetchWorkshop = async () => {
  loading.value = true
  errorMessage.value = ''
  workshop.value = null

  try {
    workshop.value = await workshopsApi.show(workshopId.value)
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const deleteWorkshop = async () => {
  if (!workshop.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await workshopsApi.remove(workshop.value.id)
    deleteModalOpen.value = false
    await router.push({ name: 'operations-workshops' })
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const dayLabel = (day) => t(`workshops.days.${day}`)

const statusLabel = (isActive) =>
  isActive ? t('workshops.status.active') : t('workshops.status.inactive')

const scheduleLabel = (day) => {
  const hours = workshop.value?.weekly_schedule?.[day]

  if (!hours) {
    return t('workshops.schedule.closed')
  }

  return t('workshops.schedule.timeRange', {
    opens: hours.opens_at,
    closes: hours.closes_at,
  })
}

const detailItems = computed(() => {
  if (!workshop.value) {
    return []
  }

  return [
    { icon: mdiWrenchOutline, label: t('workshops.fields.code'), value: workshop.value.code },
    { icon: mdiWrenchOutline, label: t('workshops.fields.name'), value: workshop.value.name },
    {
      icon: mdiAccount,
      label: t('workshops.fields.manager'),
      value:
        workshop.value.manager?.name ??
        t('workshops.labels.userNumber', { id: workshop.value.manager_user_id }),
    },
    { icon: mdiMapMarkerOutline, label: t('workshops.fields.city'), value: formatValue(workshop.value.city) },
    {
      icon: mdiMapMarkerOutline,
      label: t('workshops.fields.address'),
      value: formatValue(workshop.value.address),
    },
    { icon: mdiPhoneOutline, label: t('workshops.fields.phone'), value: formatValue(workshop.value.phone) },
    { icon: mdiEmailOutline, label: t('workshops.fields.email'), value: formatValue(workshop.value.email) },
    { icon: mdiCalendar, label: t('workshops.fields.updated'), value: formatDate(workshop.value.updated_at) },
  ]
})

watch(
  workshopId,
  () => {
    void fetchWorkshop()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="t('workshops.detail.subtitle')"
      :eyebrow="t('workshops.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-workshops' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('workshops.actions.backToWorkshops')"
          :aria-label="t('workshops.actions.backToWorkshops')"
        />
        <BaseButton
          v-if="workshop && canUpdateWorkshop"
          :to="{ name: 'operations-workshops-edit', params: { id: workshop.id } }"
          color="info"
          :icon="mdiPencil"
          :title="t('workshops.actions.editWorkshop')"
          :aria-label="t('workshops.actions.editWorkshop')"
        />
        <BaseButton
          v-if="workshop && canDeleteWorkshop"
          color="danger"
          :icon="mdiTrashCanOutline"
          :title="t('workshops.actions.deleteWorkshop')"
          :aria-label="t('workshops.actions.deleteWorkshop')"
          @click="deleteModalOpen = true"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('workshops.actions.retry')"
            :aria-label="t('workshops.actions.retry')"
            small
            @click="fetchWorkshop"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('workshops.detail.loading') }}
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="!workshop && !errorMessage"
        :title="t('workshops.detail.unavailableTitle')"
        :description="t('workshops.detail.unavailableDescription')"
      />

      <div v-else-if="workshop" class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div class="space-y-6">
          <CardBox>
            <dl class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div v-for="item in detailItems" :key="item.label">
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
          </CardBox>

          <CardBox>
            <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              {{ t('workshops.sections.weeklySchedule') }}
            </h2>
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="day in WORKSHOP_DAYS"
                :key="day"
                class="flex items-center justify-between rounded-sm border border-gray-200 px-3 py-2
                  dark:border-slate-700"
              >
                <span class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ dayLabel(day) }}
                </span>
                <span class="text-sm text-gray-500 dark:text-slate-400">
                  {{ scheduleLabel(day) }}
                </span>
              </div>
            </div>
          </CardBox>
        </div>

        <div class="space-y-6">
          <CardBox>
            <div class="space-y-5">
              <div>
                <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                  {{ t('workshops.fields.status') }}
                </p>
                <AppBadge
                  :label="statusLabel(workshop.is_active)"
                  :color="workshop.is_active ? 'success' : 'danger'"
                />
              </div>
              <div>
                <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                  {{ t('workshops.fields.managerEmail') }}
                </p>
                <p class="break-words text-sm text-gray-700 dark:text-slate-200">
                  {{ workshop.manager?.email ?? '-' }}
                </p>
              </div>
              <div>
                <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                  {{ t('workshops.fields.created') }}
                </p>
                <p class="text-sm text-gray-700 dark:text-slate-200">
                  {{ formatDate(workshop.created_at) }}
                </p>
              </div>
            </div>
          </CardBox>

          <CardBox>
            <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              {{ t('workshops.sections.vehicleSystems') }}
            </h2>
            <div v-if="systems.length" class="flex flex-wrap gap-2">
              <AppBadge
                v-for="system in systems"
                :key="system.id"
                :label="system.name"
                color="info"
              />
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-slate-400">
              {{ t('workshops.detail.noSystemsAssigned') }}
            </p>
          </CardBox>

          <CardBox>
            <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              {{ t('workshops.sections.technicians') }}
            </h2>
            <div v-if="technicians.length" class="space-y-3">
              <div v-for="technician in technicians" :key="technician.id">
                <p class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ technician.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-slate-400">
                  {{ technician.email }}
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-slate-400">
              {{ t('workshops.detail.noTechniciansAssigned') }}
            </p>
          </CardBox>
        </div>
      </div>
    </AppPage>

    <CardBoxModal
      v-model="deleteModalOpen"
      :title="t('workshops.delete.title')"
      button="danger"
      :button-label="t('workshops.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteWorkshop"
    >
      <p>{{ deleteMessage }}</p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

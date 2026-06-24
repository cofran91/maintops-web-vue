<script setup>
import { computed, ref, watch } from 'vue'
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

const DAY_LABELS = Object.freeze({
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
})

const workshop = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const workshopId = computed(() => String(route.params.id ?? ''))
const canUpdateWorkshop = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const canDeleteWorkshop = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.WORKSHOPS))
const title = computed(() => workshop.value?.name ?? 'Workshop detail')
const systems = computed(() => workshop.value?.vehicle_systems ?? [])
const technicians = computed(() => workshop.value?.technicians ?? [])
const deleteMessage = computed(() => {
  if (!workshop.value) {
    return ''
  }

  return `This action will delete workshop ${workshop.value.name}.`
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

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const scheduleLabel = (day) => {
  const hours = workshop.value?.weekly_schedule?.[day]

  if (!hours) {
    return 'Closed'
  }

  return `${hours.opens_at} to ${hours.closes_at}`
}

const detailItems = computed(() => {
  if (!workshop.value) {
    return []
  }

  return [
    { icon: mdiWrenchOutline, label: 'Code', value: workshop.value.code },
    { icon: mdiWrenchOutline, label: 'Name', value: workshop.value.name },
    {
      icon: mdiAccount,
      label: 'Manager',
      value: workshop.value.manager?.name ?? `User #${workshop.value.manager_user_id}`,
    },
    { icon: mdiMapMarkerOutline, label: 'City', value: formatValue(workshop.value.city) },
    { icon: mdiMapMarkerOutline, label: 'Address', value: formatValue(workshop.value.address) },
    { icon: mdiPhoneOutline, label: 'Phone', value: formatValue(workshop.value.phone) },
    { icon: mdiEmailOutline, label: 'Email', value: formatValue(workshop.value.email) },
    { icon: mdiCalendar, label: 'Updated', value: formatDate(workshop.value.updated_at) },
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
      subtitle="Review workshop manager, served systems, technicians, and schedule."
      eyebrow="Operations"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-workshops' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back to workshops"
          aria-label="Back to workshops"
        />
        <BaseButton
          v-if="workshop && canUpdateWorkshop"
          :to="{ name: 'operations-workshops-edit', params: { id: workshop.id } }"
          color="info"
          :icon="mdiPencil"
          title="Edit workshop"
          aria-label="Edit workshop"
        />
        <BaseButton
          v-if="workshop && canDeleteWorkshop"
          color="danger"
          :icon="mdiTrashCanOutline"
          title="Delete workshop"
          aria-label="Delete workshop"
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
            @click="fetchWorkshop"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading workshop...</p>
      </CardBox>

      <AppEmptyState
        v-else-if="!workshop && !errorMessage"
        title="Workshop unavailable"
        description="There is no workshop data to display."
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
              Weekly schedule
            </h2>
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="day in WORKSHOP_DAYS"
                :key="day"
                class="flex items-center justify-between rounded-sm border border-gray-200 px-3 py-2
                  dark:border-slate-700"
              >
                <span class="font-semibold text-gray-900 dark:text-slate-100">
                  {{ DAY_LABELS[day] }}
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
                <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">Status</p>
                <AppBadge
                  :label="workshop.is_active ? 'Active' : 'Inactive'"
                  :color="workshop.is_active ? 'success' : 'danger'"
                />
              </div>
              <div>
                <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                  Manager email
                </p>
                <p class="break-words text-sm text-gray-700 dark:text-slate-200">
                  {{ workshop.manager?.email ?? '-' }}
                </p>
              </div>
              <div>
                <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                  Created
                </p>
                <p class="text-sm text-gray-700 dark:text-slate-200">
                  {{ formatDate(workshop.created_at) }}
                </p>
              </div>
            </div>
          </CardBox>

          <CardBox>
            <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Vehicle systems
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
              No systems assigned.
            </p>
          </CardBox>

          <CardBox>
            <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Technicians
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
              No technicians assigned.
            </p>
          </CardBox>
        </div>
      </div>
    </AppPage>

    <CardBoxModal
      v-model="deleteModalOpen"
      title="Delete workshop"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteWorkshop"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Workshop deletion is limited to system administrators by backend policies.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiAccount,
  mdiArrowLeft,
  mdiCar,
  mdiClose,
  mdiEmailOutline,
  mdiFileDocumentOutline,
  mdiMapMarkerOutline,
  mdiPencil,
  mdiPhoneOutline,
  mdiRefresh,
  mdiTrashCanOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService.js'
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

const vehicle = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const vehicleId = computed(() => String(route.params.id ?? ''))
const canUpdateVehicle = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canDeleteVehicle = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const title = computed(() => vehicle.value?.license_plate ?? t('vehicles.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!vehicle.value) {
    return ''
  }

  return t('vehicles.delete.confirmMessage', { plate: vehicle.value.license_plate })
})

const fetchVehicle = async () => {
  loading.value = true
  errorMessage.value = ''
  vehicle.value = null

  try {
    vehicle.value = await vehiclesApi.show(vehicleId.value)
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const deleteVehicle = async () => {
  if (!vehicle.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await vehiclesApi.remove(vehicle.value.id)
    deleteModalOpen.value = false
    await router.push({ name: 'operations-vehicles' })
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

const formatKilometers = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('vehicles.units.kilometers', {
    value: new Intl.NumberFormat(locale.value).format(value),
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

const vehicleItems = computed(() => {
  if (!vehicle.value) {
    return []
  }

  return [
    { icon: mdiCar, label: t('vehicles.fields.licensePlate'), value: vehicle.value.license_plate },
    { icon: mdiCar, label: t('vehicles.fields.brand'), value: formatValue(vehicle.value.brand) },
    { icon: mdiCar, label: t('vehicles.fields.model'), value: formatValue(vehicle.value.model) },
    { icon: mdiCar, label: t('vehicles.fields.year'), value: formatValue(vehicle.value.year) },
    { icon: mdiCar, label: t('vehicles.fields.color'), value: formatValue(vehicle.value.color) },
    {
      icon: mdiCar,
      label: t('vehicles.fields.odometer'),
      value: formatKilometers(vehicle.value.odometer_km),
    },
    { icon: mdiCar, label: t('vehicles.fields.updated'), value: formatDate(vehicle.value.updated_at) },
  ]
})

const ownerItems = computed(() => {
  if (!vehicle.value) {
    return []
  }

  const owner = vehicle.value.owner

  return [
    {
      icon: mdiAccount,
      label: t('vehicles.fields.name'),
      value: owner?.name ?? t('vehicles.labels.ownerNumber', { id: vehicle.value.owner_id }),
    },
    { icon: mdiEmailOutline, label: t('vehicles.fields.email'), value: formatValue(owner?.email) },
    { icon: mdiPhoneOutline, label: t('vehicles.fields.phone'), value: formatValue(owner?.phone) },
    {
      icon: mdiFileDocumentOutline,
      label: t('vehicles.fields.document'),
      value: formatValue(owner?.document_number),
    },
    {
      icon: mdiMapMarkerOutline,
      label: t('vehicles.fields.address'),
      value: formatValue(owner?.address),
    },
  ]
})

watch(
  vehicleId,
  () => {
    void fetchVehicle()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="t('vehicles.detail.subtitle')"
      :eyebrow="t('vehicles.page.eyebrow')"
      :icon="mdiCar"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-vehicles' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('vehicles.actions.backToVehicles')"
          :aria-label="t('vehicles.actions.backToVehicles')"
        />
        <BaseButton
          v-if="vehicle && canUpdateVehicle"
          :to="{ name: 'operations-vehicles-edit', params: { id: vehicle.id } }"
          color="info"
          :icon="mdiPencil"
          :title="t('vehicles.actions.editVehicle')"
          :aria-label="t('vehicles.actions.editVehicle')"
        />
        <BaseButton
          v-if="vehicle && canDeleteVehicle"
          color="danger"
          :icon="mdiTrashCanOutline"
          :title="t('vehicles.actions.deleteVehicle')"
          :aria-label="t('vehicles.actions.deleteVehicle')"
          @click="deleteModalOpen = true"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('vehicles.actions.retry')"
            :aria-label="t('vehicles.actions.retry')"
            small
            @click="fetchVehicle"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('vehicles.detail.loading') }}
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="!vehicle && !errorMessage"
        :title="t('vehicles.detail.unavailableTitle')"
        :description="t('vehicles.detail.unavailableDescription')"
      />

      <div v-else-if="vehicle" class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <CardBox>
          <dl class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div v-for="item in vehicleItems" :key="item.label">
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
          <div class="space-y-5">
            <div v-for="item in ownerItems" :key="item.label">
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
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('vehicles.fields.created') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-slate-200">
                {{ formatDate(vehicle.created_at) }}
              </p>
            </div>
          </div>
        </CardBox>
      </div>
    </AppPage>

    <CardBoxModal
      v-model="deleteModalOpen"
      :title="t('vehicles.delete.title')"
      button="danger"
      :button-label="t('vehicles.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteVehicle"
    >
      <p>{{ deleteMessage }}</p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiAccount,
  mdiArrowLeft,
  mdiCar,
  mdiEmailOutline,
  mdiFileDocumentOutline,
  mdiMapMarkerOutline,
  mdiPencil,
  mdiPhoneOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { useResourceDetail } from '@/modules/shared/composables/useResourceDetail.js'
import {
  emptyFallback,
  formatDate as formatDateValue,
  formatTranslatedUnit,
} from '@/modules/shared/utils/formatters.js'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService.js'
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
  resource: vehicle,
  loading,
  deleting,
  errorMessage,
  deleteModalOpen,
  fetchResource: fetchVehicle,
  deleteResource: deleteVehicle,
} = useResourceDetail({
  fetcher: vehiclesApi.show,
  remover: vehiclesApi.remove,
  redirectTo: { name: 'operations-vehicles' },
})

const canUpdateVehicle = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canDeleteVehicle = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const title = computed(() => vehicle.value?.license_plate ?? t('vehicles.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!vehicle.value) {
    return ''
  }

  return t('vehicles.delete.confirmMessage', { plate: vehicle.value.license_plate })
})

const formatKilometers = (value) =>
  formatTranslatedUnit(value, locale.value, t, 'vehicles.units.kilometers')

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const vehicleItems = computed(() => {
  if (!vehicle.value) {
    return []
  }

  return [
    { icon: mdiCar, label: t('vehicles.fields.licensePlate'), value: vehicle.value.license_plate },
    { icon: mdiCar, label: t('vehicles.fields.brand'), value: emptyFallback(vehicle.value.brand) },
    { icon: mdiCar, label: t('vehicles.fields.model'), value: emptyFallback(vehicle.value.model) },
    { icon: mdiCar, label: t('vehicles.fields.year'), value: emptyFallback(vehicle.value.year) },
    { icon: mdiCar, label: t('vehicles.fields.color'), value: emptyFallback(vehicle.value.color) },
    {
      icon: mdiCar,
      label: t('vehicles.fields.odometer'),
      value: formatKilometers(vehicle.value.odometer_km),
    },
    {
      icon: mdiCar,
      label: t('vehicles.fields.updated'),
      value: formatDate(vehicle.value.updated_at),
    },
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
    { icon: mdiEmailOutline, label: t('vehicles.fields.email'), value: emptyFallback(owner?.email) },
    { icon: mdiPhoneOutline, label: t('vehicles.fields.phone'), value: emptyFallback(owner?.phone) },
    {
      icon: mdiFileDocumentOutline,
      label: t('vehicles.fields.document'),
      value: emptyFallback(owner?.document_number),
    },
    {
      icon: mdiMapMarkerOutline,
      label: t('vehicles.fields.address'),
      value: emptyFallback(owner?.address),
    },
  ]
})
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

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('vehicles.detail.loading')"
        :retry-label="t('vehicles.actions.retry')"
        @retry="fetchVehicle"
      />

      <AppEmptyState
        v-if="!loading && !vehicle && !errorMessage"
        :title="t('vehicles.detail.unavailableTitle')"
        :description="t('vehicles.detail.unavailableDescription')"
      />

      <div
        v-if="!loading && vehicle"
        class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]"
      >
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

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('vehicles.delete.title')"
      :delete-label="t('vehicles.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteVehicle"
    />
  </LayoutAuthenticated>
</template>

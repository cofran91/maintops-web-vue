<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const vehicle = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const vehicleId = computed(() => String(route.params.id ?? ''))
const canUpdateVehicle = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const canDeleteVehicle = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.VEHICLES))
const title = computed(() => vehicle.value?.license_plate ?? 'Vehicle detail')
const deleteMessage = computed(() => {
  if (!vehicle.value) {
    return ''
  }

  return `This action will delete vehicle ${vehicle.value.license_plate}.`
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

  return `${new Intl.NumberFormat('en').format(value)} km`
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

const vehicleItems = computed(() => {
  if (!vehicle.value) {
    return []
  }

  return [
    { icon: mdiCar, label: 'License plate', value: vehicle.value.license_plate },
    { icon: mdiCar, label: 'Brand', value: formatValue(vehicle.value.brand) },
    { icon: mdiCar, label: 'Model', value: formatValue(vehicle.value.model) },
    { icon: mdiCar, label: 'Year', value: formatValue(vehicle.value.year) },
    { icon: mdiCar, label: 'Color', value: formatValue(vehicle.value.color) },
    { icon: mdiCar, label: 'Odometer', value: formatKilometers(vehicle.value.odometer_km) },
    { icon: mdiCar, label: 'Updated', value: formatDate(vehicle.value.updated_at) },
  ]
})

const ownerItems = computed(() => {
  if (!vehicle.value) {
    return []
  }

  const owner = vehicle.value.owner

  return [
    { icon: mdiAccount, label: 'Name', value: owner?.name ?? `Owner #${vehicle.value.owner_id}` },
    { icon: mdiEmailOutline, label: 'Email', value: formatValue(owner?.email) },
    { icon: mdiPhoneOutline, label: 'Phone', value: formatValue(owner?.phone) },
    {
      icon: mdiFileDocumentOutline,
      label: 'Document',
      value: formatValue(owner?.document_number),
    },
    { icon: mdiMapMarkerOutline, label: 'Address', value: formatValue(owner?.address) },
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
      subtitle="Review vehicle identity, owner contact data, and current mileage."
      eyebrow="Operations"
      :icon="mdiCar"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-vehicles' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back to vehicles"
          aria-label="Back to vehicles"
        />
        <BaseButton
          v-if="vehicle && canUpdateVehicle"
          :to="{ name: 'operations-vehicles-edit', params: { id: vehicle.id } }"
          color="info"
          :icon="mdiPencil"
          title="Edit vehicle"
          aria-label="Edit vehicle"
        />
        <BaseButton
          v-if="vehicle && canDeleteVehicle"
          color="danger"
          :icon="mdiTrashCanOutline"
          title="Delete vehicle"
          aria-label="Delete vehicle"
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
            @click="fetchVehicle"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading vehicle...</p>
      </CardBox>

      <AppEmptyState
        v-else-if="!vehicle && !errorMessage"
        title="Vehicle unavailable"
        description="There is no vehicle data to display."
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
                Created
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
      title="Delete vehicle"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteVehicle"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Vehicle deletion is limited to system administrators by backend policies.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>

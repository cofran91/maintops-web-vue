<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiArrowLeft,
  mdiCar,
  mdiClose,
  mdiContentSaveOutline,
  mdiPlus,
  mdiRefresh,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import {
  firstFieldError,
  hasPositiveInteger,
  nullableInteger,
  nullableText,
} from '@/modules/shared/utils/formValues.js'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService.js'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import OwnerCombobox from '@/modules/owners/components/OwnerCombobox.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const form = reactive({
  owner_id: '',
  license_plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  odometer_km: '',
})

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref({})

const isEditing = computed(() => route.name === 'operations-vehicles-edit')
const vehicleId = computed(() => String(route.params.id ?? ''))
const canSubmit = computed(() =>
  isEditing.value
    ? canUpdateForAnyRole(authStore.roles, RESOURCES.VEHICLES)
    : canCreateForAnyRole(authStore.roles, RESOURCES.VEHICLES),
)
const pageTitle = computed(() =>
  isEditing.value ? t('vehicles.form.editTitle') : t('vehicles.form.createTitle'),
)
const submitLabel = computed(() =>
  isEditing.value ? t('vehicles.actions.saveChanges') : t('vehicles.actions.createVehicle'),
)
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && vehicleId.value
    ? { name: 'operations-vehicles-detail', params: { id: vehicleId.value } }
    : { name: 'operations-vehicles' },
)
const maxYear = computed(() => new Date().getFullYear() + 1)

const fetchVehicle = async () => {
  loading.value = true
  loadError.value = ''

  try {
    fillForm(await vehiclesApi.show(vehicleId.value))
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  resetErrors()

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const vehicle = isEditing.value
      ? await vehiclesApi.update(vehicleId.value, buildPayload())
      : await vehiclesApi.create(buildPayload())

    await router.push({
      name: 'operations-vehicles-detail',
      params: { id: vehicle.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const fillForm = (vehicle) => {
  form.owner_id = vehicle.owner_id ? String(vehicle.owner_id) : ''
  form.license_plate = vehicle.license_plate ?? ''
  form.brand = vehicle.brand ?? ''
  form.model = vehicle.model ?? ''
  form.year = vehicle.year ? String(vehicle.year) : ''
  form.color = vehicle.color ?? ''
  form.odometer_km =
    vehicle.odometer_km === null || vehicle.odometer_km === undefined
      ? ''
      : String(vehicle.odometer_km)
}

const resetForm = () => {
  form.owner_id = ''
  form.license_plate = ''
  form.brand = ''
  form.model = ''
  form.year = ''
  form.color = ''
  form.odometer_km = ''
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const validateForm = () => {
  const errors = {}

  if (!hasPositiveInteger(form.owner_id)) {
    errors.owner_id = [t('vehicles.validation.selectOwner')]
  }

  if (form.license_plate.trim() === '') {
    errors.license_plate = [t('vehicles.validation.licensePlateRequired')]
  }

  if (!isNonNegativeInteger(form.odometer_km)) {
    errors.odometer_km = [t('vehicles.validation.odometerNonNegative')]
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = t('vehicles.validation.reviewHighlighted')
    return false
  }

  return true
}

const buildPayload = () => ({
  owner_id: Number(form.owner_id),
  license_plate: form.license_plate,
  brand: nullableText(form.brand),
  model: nullableText(form.model),
  year: nullableInteger(form.year),
  color: nullableText(form.color),
  odometer_km: Number(form.odometer_km),
})

const isNonNegativeInteger = (value) => {
  if (value === '' || value === null || value === undefined) {
    return false
  }

  const number = Number(value)

  return Number.isInteger(number) && number >= 0
}

const fieldError = (field) => firstFieldError(validationErrors.value, field)

watch(
  () => route.fullPath,
  () => {
    resetErrors()

    if (!canSubmit.value) {
      resetForm()
      return
    }

    if (isEditing.value) {
      void fetchVehicle()
      return
    }

    resetForm()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="pageTitle"
      :subtitle="t('vehicles.form.subtitle')"
      :eyebrow="t('vehicles.page.eyebrow')"
      :icon="mdiCar"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('vehicles.actions.back')"
          :aria-label="t('vehicles.actions.back')"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        {{ t('vehicles.form.forbidden') }}
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
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

      <CardBox
        v-else-if="canSubmit && !loadError"
        is-form
        @submit.prevent="submitForm"
      >
        <NotificationBar v-if="formError" color="danger">
          {{ formError }}
        </NotificationBar>

        <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
          <FormField
            :label="t('vehicles.fields.owner')"
            label-for="owner_id"
            :error="fieldError('owner_id')"
            :help="t('vehicles.form.ownerHelp')"
          >
            <OwnerCombobox
              v-model="form.owner_id"
              input-id="owner_id"
              name="owner_id"
              :placeholder="t('vehicles.filters.ownerPlaceholder')"
            />
          </FormField>

          <FormField
            :label="t('vehicles.fields.licensePlate')"
            label-for="license_plate"
            :error="fieldError('license_plate')"
          >
            <FormControl
              id="license_plate"
              v-model="form.license_plate"
              name="license_plate"
              required
              autocomplete="off"
              maxlength="30"
            />
          </FormField>

          <FormField :label="t('vehicles.fields.brand')" label-for="brand" :error="fieldError('brand')">
            <FormControl id="brand" v-model="form.brand" name="brand" maxlength="100" />
          </FormField>

          <FormField :label="t('vehicles.fields.model')" label-for="model" :error="fieldError('model')">
            <FormControl id="model" v-model="form.model" name="model" maxlength="100" />
          </FormField>

          <FormField :label="t('vehicles.fields.year')" label-for="year" :error="fieldError('year')">
            <input
              id="year"
              v-model="form.year"
              name="year"
              type="number"
              min="1900"
              :max="maxYear"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>

          <FormField :label="t('vehicles.fields.color')" label-for="color" :error="fieldError('color')">
            <FormControl id="color" v-model="form.color" name="color" maxlength="80" />
          </FormField>

          <FormField
            :label="t('vehicles.fields.odometer')"
            label-for="odometer_km"
            :error="fieldError('odometer_km')"
          >
            <input
              id="odometer_km"
              v-model="form.odometer_km"
              name="odometer_km"
              type="number"
              min="0"
              inputmode="numeric"
              required
              :class="inputClass"
            >
          </FormField>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              :title="t('vehicles.actions.cancel')"
              :aria-label="t('vehicles.actions.cancel')"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? t('vehicles.actions.saving') : submitLabel"
              :aria-label="saving ? t('vehicles.actions.saving') : submitLabel"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>

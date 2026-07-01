<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiArrowLeft,
  mdiClose,
  mdiContentSaveOutline,
  mdiPlus,
  mdiRefresh,
  mdiWrenchOutline,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { useWorkshopForm } from '@/modules/workshops/composables/useWorkshopForm.js'
import { useWorkshopTechnicians } from '@/modules/workshops/composables/useWorkshopTechnicians.js'
import workshopsApi from '@/modules/workshops/services/workshopsService.js'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService.js'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import WorkshopGeneralFields from '@/modules/workshops/components/WorkshopGeneralFields.vue'
import WorkshopScheduleField from '@/modules/workshops/components/WorkshopScheduleField.vue'
import WorkshopTechniciansField from '@/modules/workshops/components/WorkshopTechniciansField.vue'
import WorkshopVehicleSystemsField from '@/modules/workshops/components/WorkshopVehicleSystemsField.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const vehicleSystems = ref([])
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const {
  buildPayload,
  dayLabel,
  fieldError,
  fillForm,
  form,
  formError,
  resetErrors,
  resetForm,
  scheduleError,
  scheduleRows,
  setField,
  setScheduleField,
  setVehicleSystem,
  validateForm,
  validationErrors,
} = useWorkshopForm(t)
const {
  fetchTechnicians,
  handleTechnicianScroll,
  handleTechnicianSearchInput,
  openTechnicianOptions,
  removeTechnician,
  resetTechnicianState,
  selectTechnician,
  selectedTechnicians,
  setSelectedTechnicians,
  technicianError,
  technicianLoading,
  technicianOptions,
  technicianSearch,
  technicianSelectOpen,
  toggleTechnicianOptions,
} = useWorkshopTechnicians()

const isEditing = computed(() => route.name === 'operations-workshops-edit')
const workshopId = computed(() => String(route.params.id ?? ''))
const canSubmit = computed(() =>
  isEditing.value
    ? canUpdateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS)
    : canCreateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS),
)
const pageTitle = computed(() =>
  isEditing.value ? t('workshops.form.editTitle') : t('workshops.form.createTitle'),
)
const submitLabel = computed(() =>
  isEditing.value ? t('workshops.actions.saveChanges') : t('workshops.actions.createWorkshop'),
)
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && workshopId.value
    ? { name: 'operations-workshops-detail', params: { id: workshopId.value } }
    : { name: 'operations-workshops' },
)

const fetchVehicleSystems = async () => {
  const data = await vehicleSystemsApi.index({
    page: 1,
    per_page: 100,
  })

  vehicleSystems.value = data.items
}

const initializeForm = async () => {
  loading.value = true
  loadError.value = ''
  resetErrors()
  resetForm()
  resetTechnicianState()

  try {
    await fetchVehicleSystems()
    void fetchTechnicians({ reset: true })

    if (isEditing.value) {
      const workshop = await workshopsApi.show(workshopId.value)

      fillForm(workshop)
      setSelectedTechnicians(workshop.technicians ?? [])
    }
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
    const workshop = isEditing.value
      ? await workshopsApi.update(workshopId.value, buildPayload(selectedTechnicians.value))
      : await workshopsApi.create(buildPayload(selectedTechnicians.value))

    await router.push({
      name: 'operations-workshops-detail',
      params: { id: workshop.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    if (canSubmit.value) {
      void initializeForm()
      return
    }

    resetForm()
    resetErrors()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="pageTitle"
      :subtitle="t('workshops.form.subtitle')"
      :eyebrow="t('workshops.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('workshops.actions.back')"
          :aria-label="t('workshops.actions.back')"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        {{ t('workshops.form.forbidden') }}
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('workshops.actions.retry')"
            :aria-label="t('workshops.actions.retry')"
            small
            @click="initializeForm"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('workshops.detail.loading') }}
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

        <WorkshopGeneralFields
          :form="form"
          :field-error="fieldError"
          @update-field="setField"
        />

        <WorkshopVehicleSystemsField
          :selected-ids="form.vehicle_system_ids"
          :vehicle-systems="vehicleSystems"
          :error="fieldError('vehicle_system_ids')"
          @update-system="setVehicleSystem"
        />

        <WorkshopTechniciansField
          v-model:search="technicianSearch"
          :error="fieldError('technician_user_ids')"
          :selected-technicians="selectedTechnicians"
          :is-open="technicianSelectOpen"
          :options="technicianOptions"
          :loading="technicianLoading"
          :error-message="technicianError"
          @focus-search="openTechnicianOptions"
          @input-search="handleTechnicianSearchInput"
          @toggle-options="toggleTechnicianOptions"
          @scroll-options="handleTechnicianScroll"
          @select-technician="selectTechnician"
          @remove-technician="removeTechnician"
        />

        <WorkshopScheduleField
          :rows="scheduleRows"
          :field-error="fieldError('weekly_schedule')"
          :schedule-error="scheduleError"
          :day-label="dayLabel"
          @update-row="setScheduleField"
        />

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              :title="t('workshops.actions.cancel')"
              :aria-label="t('workshops.actions.cancel')"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? t('workshops.actions.saving') : submitLabel"
              :aria-label="saving ? t('workshops.actions.saving') : submitLabel"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>

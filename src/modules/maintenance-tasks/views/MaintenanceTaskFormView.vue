<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
import {
  firstFieldError,
  hasPositiveInteger,
  nullableText,
} from '@/modules/shared/utils/formValues.js'
import { ROLES } from '@/types/auth.js'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService.js'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import MaintenanceTaskGeneralFields from '@/modules/maintenance-tasks/components/MaintenanceTaskGeneralFields.vue'
import MaintenanceTaskScopeFields from '@/modules/maintenance-tasks/components/MaintenanceTaskScopeFields.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const form = reactive({
  vehicle_system_id: '',
  name: '',
  code: '',
  vehicle_id: '',
  description: '',
  estimated_duration_minutes: '',
  is_active: true,
})

const vehicleSystems = ref([])
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref({})
const generalTask = ref(true)

const isEditing = computed(() => route.name === 'maintenance-tasks-edit')
const taskId = computed(() => String(route.params.id ?? ''))
const isSystemAdmin = computed(() =>
  authStore.roles.some((role) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role)),
)
const advisorRequiresVehicle = computed(
  () => authStore.roles.includes(ROLES.ADVISOR) && !isSystemAdmin.value,
)
const canSubmit = computed(() =>
  isEditing.value
    ? canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS)
    : canCreateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_TASKS),
)
const pageTitle = computed(() =>
  isEditing.value
    ? t('maintenanceTasks.form.editTitle')
    : t('maintenanceTasks.form.createTitle'),
)
const submitLabel = computed(() =>
  isEditing.value
    ? t('maintenanceTasks.actions.saveChanges')
    : t('maintenanceTasks.actions.createTask'),
)
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && taskId.value
    ? { name: 'maintenance-tasks-detail', params: { id: taskId.value } }
    : { name: 'maintenance-tasks' },
)
const showVehicleField = computed(() => advisorRequiresVehicle.value || !generalTask.value)

const fetchVehicleSystems = async () => {
  const data = await vehicleSystemsApi.index({
    page: 1,
    per_page: 100,
  })

  vehicleSystems.value = data.items
}

const initializeForm = async () => {
  loading.value = true
  resetErrors()
  resetForm()

  try {
    await fetchVehicleSystems()

    if (isEditing.value) {
      fillForm(await maintenanceTasksApi.show(taskId.value))
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
    const task = isEditing.value
      ? await maintenanceTasksApi.update(taskId.value, buildPayload())
      : await maintenanceTasksApi.create(buildPayload())

    await router.push({
      name: 'maintenance-tasks-detail',
      params: { id: task.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const fillForm = (task) => {
  form.vehicle_system_id = task.vehicle_system_id ? String(task.vehicle_system_id) : ''
  form.name = task.name ?? ''
  form.code = task.code ?? ''
  form.vehicle_id = task.vehicle_id ? String(task.vehicle_id) : ''
  form.description = task.description ?? ''
  form.estimated_duration_minutes =
    task.estimated_duration_minutes === null ||
    task.estimated_duration_minutes === undefined
      ? ''
      : String(task.estimated_duration_minutes)
  form.is_active = Boolean(task.is_active)
  generalTask.value = advisorRequiresVehicle.value ? false : !task.vehicle_id
}

const resetForm = () => {
  form.vehicle_system_id = ''
  form.name = ''
  form.code = ''
  form.vehicle_id = ''
  form.description = ''
  form.estimated_duration_minutes = ''
  form.is_active = true
  generalTask.value = !advisorRequiresVehicle.value
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const validateForm = () => {
  const errors = {}
  const duration = Number(form.estimated_duration_minutes)

  if (!hasPositiveInteger(form.vehicle_system_id)) {
    errors.vehicle_system_id = [t('maintenanceTasks.validation.selectVehicleSystem')]
  }

  if (form.name.trim() === '') {
    errors.name = [t('maintenanceTasks.validation.nameRequired')]
  }

  if (form.code.trim() === '') {
    errors.code = [t('maintenanceTasks.validation.codeRequired')]
  }

  if (!Number.isInteger(duration) || duration < 1 || duration > 10080) {
    errors.estimated_duration_minutes = [t('maintenanceTasks.validation.durationRange')]
  }

  if (showVehicleField.value && !hasPositiveInteger(form.vehicle_id)) {
    errors.vehicle_id = [t('maintenanceTasks.validation.selectVehicle')]
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = t('maintenanceTasks.validation.reviewHighlighted')
    return false
  }

  return true
}

const buildPayload = () => ({
  vehicle_system_id: Number(form.vehicle_system_id),
  name: form.name,
  code: form.code,
  vehicle_id: showVehicleField.value ? Number(form.vehicle_id) : null,
  description: nullableText(form.description),
  estimated_duration_minutes: Number(form.estimated_duration_minutes),
  is_active: form.is_active,
})

const setField = (field, value) => {
  form[field] = value
}

const handleGeneralTaskChange = () => {
  if (generalTask.value) {
    form.vehicle_id = ''
  }
}

const setGeneralTask = (value) => {
  generalTask.value = value
  handleGeneralTaskChange()
}

const fieldError = (field) => firstFieldError(validationErrors.value, field)

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

watch(
  advisorRequiresVehicle,
  (requiresVehicle) => {
    if (requiresVehicle) {
      generalTask.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="pageTitle"
      :subtitle="t('maintenanceTasks.form.subtitle')"
      :eyebrow="t('maintenanceTasks.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('maintenanceTasks.actions.back')"
          :aria-label="t('maintenanceTasks.actions.back')"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        {{ t('maintenanceTasks.form.forbidden') }}
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('maintenanceTasks.actions.retry')"
            :aria-label="t('maintenanceTasks.actions.retry')"
            small
            @click="initializeForm"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('maintenanceTasks.detail.loading') }}
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

        <NotificationBar v-if="advisorRequiresVehicle" color="info">
          {{ t('maintenanceTasks.form.advisorVehicleRequired') }}
        </NotificationBar>

        <MaintenanceTaskGeneralFields
          :form="form"
          :field-error="fieldError"
          :input-class="inputClass"
          :vehicle-systems="vehicleSystems"
          @update-field="setField"
        />

        <MaintenanceTaskScopeFields
          :form="form"
          :general-task="generalTask"
          :advisor-requires-vehicle="advisorRequiresVehicle"
          :show-vehicle-field="showVehicleField"
          :field-error="fieldError"
          @update-field="setField"
          @update-general-task="setGeneralTask"
        />

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              :title="t('maintenanceTasks.actions.cancel')"
              :aria-label="t('maintenanceTasks.actions.cancel')"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? t('maintenanceTasks.actions.saving') : submitLabel"
              :aria-label="saving ? t('maintenanceTasks.actions.saving') : submitLabel"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>

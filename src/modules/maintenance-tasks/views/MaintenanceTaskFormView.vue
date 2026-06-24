<script setup>
import { computed, reactive, ref, watch } from 'vue'
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
import { ROLES } from '@/types/auth.js'
import maintenanceTasksApi from '@/modules/maintenance-tasks/services/maintenanceTasksService.js'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import VehicleCombobox from '@/modules/vehicles/components/VehicleCombobox.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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
  isEditing.value ? 'Edit maintenance task' : 'Create maintenance task',
)
const submitLabel = computed(() => (isEditing.value ? 'Save changes' : 'Create task'))
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
    errors.vehicle_system_id = ['Select a vehicle system.']
  }

  if (form.name.trim() === '') {
    errors.name = ['Name is required.']
  }

  if (form.code.trim() === '') {
    errors.code = ['Code is required.']
  }

  if (!Number.isInteger(duration) || duration < 1 || duration > 10080) {
    errors.estimated_duration_minutes = ['Enter a duration from 1 to 10,080 minutes.']
  }

  if (showVehicleField.value && !hasPositiveInteger(form.vehicle_id)) {
    errors.vehicle_id = ['Select a vehicle.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Review the highlighted fields before saving.'
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

const handleGeneralTaskChange = () => {
  if (generalTask.value) {
    form.vehicle_id = ''
  }
}

const hasPositiveInteger = (value) => {
  const number = Number(value)

  return Number.isInteger(number) && number > 0
}

const nullableText = (value) => {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue === '' ? null : trimmedValue
}

const fieldError = (field) => validationErrors.value[field]?.[0] ?? ''

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
      subtitle="Manage vehicle systems, reusable scope, vehicle assignment, and estimates."
      eyebrow="Maintenance"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back"
          aria-label="Back"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        Your role cannot perform this maintenance task action.
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            title="Retry"
            aria-label="Retry"
            small
            @click="initializeForm"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading maintenance task...</p>
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
          Advisor-created tasks must be linked to a vehicle.
        </NotificationBar>

        <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
          <FormField
            label="Vehicle system"
            label-for="vehicle_system_id"
            :error="fieldError('vehicle_system_id')"
          >
            <select
              id="vehicle_system_id"
              v-model="form.vehicle_system_id"
              name="vehicle_system_id"
              required
              :class="inputClass"
            >
              <option value="" disabled>Select a vehicle system</option>
              <option v-for="system in vehicleSystems" :key="system.id" :value="String(system.id)">
                {{ system.name }}
              </option>
            </select>
          </FormField>

          <FormField label="Name" label-for="name" :error="fieldError('name')">
            <FormControl id="name" v-model="form.name" name="name" required maxlength="255" />
          </FormField>

          <FormField label="Code" label-for="code" :error="fieldError('code')">
            <FormControl
              id="code"
              v-model="form.code"
              name="code"
              required
              maxlength="100"
              placeholder="OIL-CHANGE"
            />
          </FormField>

          <FormField
            label="Estimated duration"
            label-for="estimated_duration_minutes"
            :error="fieldError('estimated_duration_minutes')"
          >
            <input
              id="estimated_duration_minutes"
              v-model="form.estimated_duration_minutes"
              name="estimated_duration_minutes"
              type="number"
              min="1"
              max="10080"
              inputmode="numeric"
              required
              :class="inputClass"
            >
          </FormField>
        </div>

        <div v-if="!advisorRequiresVehicle" class="mb-6 flex items-center gap-3">
          <FormCheckRadio
            v-model="generalTask"
            name="general_task"
            type="switch"
            label="Reusable task"
            :input-value="true"
            @update:model-value="handleGeneralTaskChange"
          />
          <AppBadge
            :label="generalTask ? 'Reusable' : 'Vehicle-specific'"
            :color="generalTask ? 'info' : 'warning'"
          />
        </div>

        <FormField
          v-if="showVehicleField"
          label="Vehicle"
          label-for="vehicle_id"
          :error="fieldError('vehicle_id')"
        >
          <VehicleCombobox
            v-model="form.vehicle_id"
            input-id="vehicle_id"
            name="vehicle_id"
            placeholder="Search by plate, brand, or model"
          />
        </FormField>

        <FormField label="Description" label-for="description" :error="fieldError('description')">
          <FormControl
            id="description"
            v-model="form.description"
            name="description"
            type="textarea"
            maxlength="2000"
          />
        </FormField>

        <div class="mb-6 flex items-center gap-3">
          <FormCheckRadio
            v-model="form.is_active"
            name="is_active"
            type="switch"
            label="Active task"
            :input-value="true"
          />
          <AppBadge
            :label="form.is_active ? 'Active' : 'Inactive'"
            :color="form.is_active ? 'success' : 'danger'"
          />
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              title="Cancel"
              aria-label="Cancel"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? 'Saving...' : submitLabel"
              :aria-label="saving ? 'Saving...' : submitLabel"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>

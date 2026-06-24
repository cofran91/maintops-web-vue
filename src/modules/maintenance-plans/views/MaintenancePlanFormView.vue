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
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import MaintenanceTaskMultiSelect from '@/modules/maintenance-tasks/components/MaintenanceTaskMultiSelect.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const form = reactive({
  code: '',
  name: '',
  description: '',
  recommended_interval_days: '',
  recommended_interval_km: '',
  task_ids: [],
  is_active: true,
})

const selectedTaskItems = ref([])
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref({})

const isEditing = computed(() => route.name === 'maintenance-plans-edit')
const planId = computed(() => String(route.params.id ?? ''))
const canSubmit = computed(() =>
  isEditing.value
    ? canUpdateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS)
    : canCreateForAnyRole(authStore.roles, RESOURCES.MAINTENANCE_PLANS),
)
const pageTitle = computed(() =>
  isEditing.value ? 'Edit maintenance plan' : 'Create maintenance plan',
)
const submitLabel = computed(() => (isEditing.value ? 'Save changes' : 'Create plan'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && planId.value
    ? { name: 'maintenance-plans-detail', params: { id: planId.value } }
    : { name: 'maintenance-plans' },
)

const initializeForm = async () => {
  loading.value = true
  resetErrors()
  resetForm()

  try {
    if (isEditing.value) {
      fillForm(await maintenancePlansApi.show(planId.value))
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
    const plan = isEditing.value
      ? await maintenancePlansApi.update(planId.value, buildPayload())
      : await maintenancePlansApi.create(buildPayload())

    await router.push({
      name: 'maintenance-plans-detail',
      params: { id: plan.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const fillForm = (plan) => {
  form.code = plan.code ?? ''
  form.name = plan.name ?? ''
  form.description = plan.description ?? ''
  form.recommended_interval_days =
    plan.recommended_interval_days === null ||
    plan.recommended_interval_days === undefined
      ? ''
      : String(plan.recommended_interval_days)
  form.recommended_interval_km =
    plan.recommended_interval_km === null ||
    plan.recommended_interval_km === undefined
      ? ''
      : String(plan.recommended_interval_km)
  form.task_ids =
    plan.task_ids ??
    plan.tasks?.map((task) => Number(task.id)) ??
    []
  selectedTaskItems.value = plan.tasks ?? []
  form.is_active = Boolean(plan.is_active)
}

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.description = ''
  form.recommended_interval_days = ''
  form.recommended_interval_km = ''
  form.task_ids = []
  selectedTaskItems.value = []
  form.is_active = true
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const validateForm = () => {
  const errors = {}

  if (form.code.trim() === '') {
    errors.code = ['Code is required.']
  }

  if (form.name.trim() === '') {
    errors.name = ['Name is required.']
  }

  if (form.task_ids.length === 0) {
    errors.task_ids = ['Select at least one task.']
  }

  if (!hasValidInterval(form.recommended_interval_days, 3650)) {
    errors.recommended_interval_days = ['Enter a value from 1 to 3,650 days.']
  }

  if (!hasValidInterval(form.recommended_interval_km, 1000000)) {
    errors.recommended_interval_km = ['Enter a value from 1 to 1,000,000 km.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Review the highlighted fields before saving.'
    return false
  }

  return true
}

const buildPayload = () => ({
  code: form.code,
  name: form.name,
  description: nullableText(form.description),
  recommended_interval_days: nullableNumber(form.recommended_interval_days),
  recommended_interval_km: nullableNumber(form.recommended_interval_km),
  task_ids: form.task_ids.map(Number),
  is_active: form.is_active,
})

const handleTaskSelection = (tasks) => {
  selectedTaskItems.value = tasks
}

const hasValidInterval = (value, maxValue) => {
  if (value === '') {
    return true
  }

  const number = Number(value)

  return Number.isInteger(number) && number >= 1 && number <= maxValue
}

const nullableText = (value) => {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue === '' ? null : trimmedValue
}

const nullableNumber = (value) => {
  if (value === '' || Number.isNaN(Number(value))) {
    return null
  }

  return Number(value)
}

const fieldError = (field) => {
  if (validationErrors.value[field]?.[0]) {
    return validationErrors.value[field][0]
  }

  const nestedField = `${field}.`
  const nestedError = Object.entries(validationErrors.value)
    .find(([key]) => key.startsWith(nestedField))?.[1]?.[0]

  return nestedError ?? ''
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
      subtitle="Manage grouped tasks, recommended intervals, and operational availability."
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
        Your role cannot perform this maintenance plan action.
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
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading maintenance plan...</p>
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
          <FormField label="Code" label-for="code" :error="fieldError('code')">
            <FormControl
              id="code"
              v-model="form.code"
              name="code"
              required
              maxlength="100"
              placeholder="PREVENTIVE-10K"
            />
          </FormField>

          <FormField label="Name" label-for="name" :error="fieldError('name')">
            <FormControl id="name" v-model="form.name" name="name" required maxlength="255" />
          </FormField>

          <FormField
            label="Recommended days"
            label-for="recommended_interval_days"
            :error="fieldError('recommended_interval_days')"
          >
            <input
              id="recommended_interval_days"
              v-model="form.recommended_interval_days"
              name="recommended_interval_days"
              type="number"
              min="1"
              max="3650"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>

          <FormField
            label="Recommended kilometers"
            label-for="recommended_interval_km"
            :error="fieldError('recommended_interval_km')"
          >
            <input
              id="recommended_interval_km"
              v-model="form.recommended_interval_km"
              name="recommended_interval_km"
              type="number"
              min="1"
              max="1000000"
              inputmode="numeric"
              :class="inputClass"
            >
          </FormField>
        </div>

        <FormField label="Tasks" label-for="task_ids" :error="fieldError('task_ids')">
          <MaintenanceTaskMultiSelect
            v-model="form.task_ids"
            input-id="task_ids"
            name="task_ids"
            placeholder="Search by task code or name"
            :selected-items="selectedTaskItems"
            @select="handleTaskSelection"
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
            label="Active plan"
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

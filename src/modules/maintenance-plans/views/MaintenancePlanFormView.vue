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
  nullableNumber,
  nullableText,
} from '@/modules/shared/utils/formValues.js'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService.js'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import MaintenancePlanGeneralFields from '@/modules/maintenance-plans/components/MaintenancePlanGeneralFields.vue'
import MaintenancePlanTaskSelectionField from '@/modules/maintenance-plans/components/MaintenancePlanTaskSelectionField.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

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
  isEditing.value
    ? t('maintenancePlans.form.editTitle')
    : t('maintenancePlans.form.createTitle'),
)
const submitLabel = computed(() =>
  isEditing.value
    ? t('maintenancePlans.actions.saveChanges')
    : t('maintenancePlans.actions.createPlan'),
)
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
    errors.code = [t('maintenancePlans.validation.codeRequired')]
  }

  if (form.name.trim() === '') {
    errors.name = [t('maintenancePlans.validation.nameRequired')]
  }

  if (form.task_ids.length === 0) {
    errors.task_ids = [t('maintenancePlans.validation.selectTask')]
  }

  if (!hasValidInterval(form.recommended_interval_days, 3650)) {
    errors.recommended_interval_days = [t('maintenancePlans.validation.daysRange')]
  }

  if (!hasValidInterval(form.recommended_interval_km, 1000000)) {
    errors.recommended_interval_km = [t('maintenancePlans.validation.kilometersRange')]
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = t('maintenancePlans.validation.reviewHighlighted')
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

const setField = (field, value) => {
  form[field] = value
}

const setTaskIds = (taskIds) => {
  form.task_ids = taskIds
}

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
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="pageTitle"
      :subtitle="t('maintenancePlans.form.subtitle')"
      :eyebrow="t('maintenancePlans.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('maintenancePlans.actions.back')"
          :aria-label="t('maintenancePlans.actions.back')"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        {{ t('maintenancePlans.form.forbidden') }}
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('maintenancePlans.actions.retry')"
            :aria-label="t('maintenancePlans.actions.retry')"
            small
            @click="initializeForm"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('maintenancePlans.detail.loading') }}
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

        <MaintenancePlanGeneralFields
          :form="form"
          :field-error="fieldError"
          :input-class="inputClass"
          @update-field="setField"
        />

        <MaintenancePlanTaskSelectionField
          :task-ids="form.task_ids"
          :selected-items="selectedTaskItems"
          :error="fieldError('task_ids')"
          @update-task-ids="setTaskIds"
          @select="handleTaskSelection"
        />

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              :title="t('maintenancePlans.actions.cancel')"
              :aria-label="t('maintenancePlans.actions.cancel')"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? t('maintenancePlans.actions.saving') : submitLabel"
              :aria-label="saving ? t('maintenancePlans.actions.saving') : submitLabel"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiArrowLeft,
  mdiClose,
  mdiPlus,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canCreateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { ROLES } from '@/types/auth.js'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService.js'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'
import VehicleCombobox from '@/modules/vehicles/components/VehicleCombobox.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const form = reactive({
  vehicle_id: '',
  advisor_id: '',
})

const saving = ref(false)
const formError = ref('')
const validationErrors = ref({})

const isSystemAdmin = computed(() =>
  authStore.roles.some((role) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role)),
)
const canSubmit = computed(() => canCreateForAnyRole(authStore.roles, RESOURCES.ORDERS))
const backRoute = { name: 'orders' }

const initializeForm = () => {
  resetErrors()
  resetForm()
}

const submitForm = async () => {
  resetErrors()

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const savedOrder = await maintenanceOrdersApi.create(buildPayload())

    await router.push({
      name: 'orders-detail',
      params: { id: savedOrder.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  form.vehicle_id = ''
  form.advisor_id = ''
}

const resetErrors = () => {
  formError.value = ''
  validationErrors.value = {}
}

const validateForm = () => {
  const errors = {}

  if (!hasPositiveInteger(form.vehicle_id)) {
    errors.vehicle_id = [t('orders.validation.selectVehicle')]
  }

  if (isSystemAdmin.value && !hasPositiveInteger(form.advisor_id)) {
    errors.advisor_id = [t('orders.validation.selectAdvisor')]
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = t('orders.validation.reviewHighlighted')
    return false
  }

  return true
}

const buildPayload = () => {
  const payload = {
    vehicle_id: Number(form.vehicle_id),
  }

  if (isSystemAdmin.value) {
    payload.advisor_id = Number(form.advisor_id)
  }

  return payload
}

const hasPositiveInteger = (value) => {
  const number = Number(value)

  return Number.isInteger(number) && number > 0
}

const fieldError = (field) => validationErrors.value[field]?.[0] ?? ''

watch(
  () => route.fullPath,
  () => {
    if (canSubmit.value) {
      initializeForm()
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
      :title="t('orders.form.createTitle')"
      :subtitle="t('orders.form.subtitle')"
      :eyebrow="t('orders.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('orders.actions.back')"
          :aria-label="t('orders.actions.back')"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        {{ t('orders.form.forbidden') }}
      </NotificationBar>

      <CardBox
        v-if="canSubmit"
        is-form
        @submit.prevent="submitForm"
      >
        <NotificationBar v-if="formError" color="danger">
          {{ formError }}
        </NotificationBar>

        <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
          <FormField :label="t('orders.fields.vehicle')" label-for="vehicle_id" :error="fieldError('vehicle_id')">
            <VehicleCombobox
              v-model="form.vehicle_id"
              input-id="vehicle_id"
              name="vehicle_id"
              :placeholder="t('orders.filters.vehiclePlaceholder')"
            />
          </FormField>

          <FormField
            v-if="isSystemAdmin"
            :label="t('orders.fields.advisor')"
            label-for="advisor_id"
            :error="fieldError('advisor_id')"
          >
            <UserCombobox
              v-model="form.advisor_id"
              input-id="advisor_id"
              name="advisor_id"
              :placeholder="t('orders.filters.advisorPlaceholder')"
              :role="ROLES.ADVISOR"
            />
          </FormField>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              :title="t('orders.actions.cancel')"
              :aria-label="t('orders.actions.cancel')"
            />
            <BaseButton
              color="info"
              :icon="mdiPlus"
              :title="saving ? t('orders.actions.saving') : t('orders.actions.createOrder')"
              :aria-label="saving ? t('orders.actions.saving') : t('orders.actions.createOrder')"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>

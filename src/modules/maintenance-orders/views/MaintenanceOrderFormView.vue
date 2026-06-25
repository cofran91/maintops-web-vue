<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
    errors.vehicle_id = ['Select a vehicle.']
  }

  if (isSystemAdmin.value && !hasPositiveInteger(form.advisor_id)) {
    errors.advisor_id = ['Select an advisor.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Review the highlighted fields before saving.'
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
      title="Create order"
      subtitle="Capture vehicle and advisor context accepted by the public order endpoint."
      eyebrow="Orders"
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
        Your role cannot perform this order action.
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
          <FormField label="Vehicle" label-for="vehicle_id" :error="fieldError('vehicle_id')">
            <VehicleCombobox
              v-model="form.vehicle_id"
              input-id="vehicle_id"
              name="vehicle_id"
              placeholder="Search by plate, brand, or model"
            />
          </FormField>

          <FormField
            v-if="isSystemAdmin"
            label="Advisor"
            label-for="advisor_id"
            :error="fieldError('advisor_id')"
          >
            <UserCombobox
              v-model="form.advisor_id"
              input-id="advisor_id"
              name="advisor_id"
              placeholder="Search advisors"
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
              title="Cancel"
              aria-label="Cancel"
            />
            <BaseButton
              color="info"
              :icon="mdiPlus"
              :title="saving ? 'Saving...' : 'Create order'"
              :aria-label="saving ? 'Saving...' : 'Create order'"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>

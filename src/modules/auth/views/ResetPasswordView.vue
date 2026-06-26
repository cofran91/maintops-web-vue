<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mdiAsterisk, mdiArrowLeft, mdiEmailOutline, mdiLockReset } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import { resetPassword } from '@/modules/auth/services/authService.js'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  token: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const validationErrors = ref({})
const formError = ref('')
const successMessage = ref('')
const submitting = ref(false)

const hasRequiredLinkData = computed(() => Boolean(form.token && form.email))
const linkError = computed(() =>
  hasRequiredLinkData.value ? '' : 'The password reset link is incomplete. Request a new link.',
)

const fillFromQuery = () => {
  const token = route.query.token
  const email = route.query.email

  form.token = typeof token === 'string' ? token : ''
  form.email = typeof email === 'string' ? email : ''
}

const resetFeedback = () => {
  validationErrors.value = {}
  formError.value = ''
  successMessage.value = ''
}

const validateForm = () => {
  validationErrors.value = {}
  const errors = {}

  if (!form.token) {
    errors.token = ['The password reset link is incomplete. Request a new link.']
  }

  if (!form.email.trim()) {
    errors.email = ['Email is required.']
  }

  if (!form.password) {
    errors.password = ['Password is required.']
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = ['Password confirmation is required.']
  }

  if (form.password && form.password_confirmation && form.password !== form.password_confirmation) {
    errors.password_confirmation = ['Password confirmation does not match.']
  }

  validationErrors.value = errors

  return Object.keys(errors).length === 0
}

const submit = async () => {
  resetFeedback()

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    successMessage.value = await resetPassword({
      token: form.token,
      email: form.email.trim(),
      password: form.password,
      password_confirmation: form.password_confirmation,
    })

    form.password = ''
    form.password_confirmation = ''
    authStore.clearSession()
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    submitting.value = false
  }
}

const fieldError = (field) => validationErrors.value[field]?.[0] ?? ''

watch(
  () => route.query,
  () => {
    fillFromQuery()
    resetFeedback()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutGuest>
    <main class="grid min-h-screen place-items-center bg-gray-50 px-4 py-8 dark:bg-slate-800">
      <CardBox class="w-full max-w-md shadow-2xl" is-form @submit.prevent="submit">
        <div class="mb-6">
          <p class="text-sm font-semibold uppercase text-blue-600 dark:text-blue-300">
            MaintOps Console
          </p>
          <h1 class="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
            Set a new password
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
            Use the email link to choose a new password for your account.
          </p>
        </div>

        <div
          v-if="successMessage"
          class="mb-6 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm
            text-green-700 dark:border-green-800 dark:bg-green-500/10 dark:text-green-300"
          role="status"
        >
          {{ successMessage }}
        </div>

        <div
          v-if="formError || fieldError('token') || linkError"
          class="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700
            dark:border-red-800 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          {{ formError || fieldError('token') || linkError }}
        </div>

        <input v-model="form.token" type="hidden" name="token" />

        <FormField label="Email" label-for="email" :error="fieldError('email')">
          <FormControl
            id="email"
            v-model="form.email"
            :icon="mdiEmailOutline"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="user@example.com"
            required
          />
        </FormField>

        <FormField label="New password" label-for="password" :error="fieldError('password')">
          <FormControl
            id="password"
            v-model="form.password"
            :icon="mdiAsterisk"
            name="password"
            type="password"
            autocomplete="new-password"
            required
          />
        </FormField>

        <FormField
          label="Confirm password"
          label-for="password_confirmation"
          :error="fieldError('password_confirmation')"
        >
          <FormControl
            id="password_confirmation"
            v-model="form.password_confirmation"
            :icon="mdiAsterisk"
            name="password_confirmation"
            type="password"
            autocomplete="new-password"
            required
          />
        </FormField>

        <template #footer>
          <BaseButtons type="justify-between">
            <BaseButton
              :to="{ name: 'login' }"
              color="whiteDark"
              :icon="mdiArrowLeft"
              label="Back to sign in"
            />
            <BaseButton
              type="submit"
              color="info"
              :icon="mdiLockReset"
              :label="submitting ? 'Updating...' : 'Update password'"
              :disabled="submitting || !hasRequiredLinkData"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </main>
  </LayoutGuest>
</template>

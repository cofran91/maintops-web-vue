<script setup>
import { reactive, ref } from 'vue'
import { mdiArrowLeft, mdiEmailOutline, mdiSendOutline } from '@mdi/js'
import { normalizeApiError } from '@/api/errors.js'
import { requestPasswordReset } from '@/modules/auth/services/authService.js'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'

const form = reactive({
  email: '',
})

const validationErrors = ref({})
const formError = ref('')
const successMessage = ref('')
const submitting = ref(false)

const resetFeedback = () => {
  validationErrors.value = {}
  formError.value = ''
  successMessage.value = ''
}

const validateForm = () => {
  validationErrors.value = {}

  if (!form.email.trim()) {
    validationErrors.value = {
      email: ['Email is required.'],
    }
  }

  return Object.keys(validationErrors.value).length === 0
}

const submit = async () => {
  resetFeedback()

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    successMessage.value = await requestPasswordReset({
      email: form.email.trim(),
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    submitting.value = false
  }
}

const fieldError = (field) => validationErrors.value[field]?.[0] ?? ''
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
            Reset your password
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
            Enter your account email and MaintOps will send a reset link when the account is
            eligible.
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
          v-if="formError"
          class="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700
            dark:border-red-800 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          {{ formError }}
        </div>

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
              :icon="mdiSendOutline"
              :label="submitting ? 'Sending...' : 'Send link'"
              :disabled="submitting"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </main>
  </LayoutGuest>
</template>

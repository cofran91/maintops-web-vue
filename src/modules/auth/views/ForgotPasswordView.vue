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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
      email: [t('auth.errors.emailRequired')],
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
            {{ t('common.brand') }}
          </p>
          <h1 class="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
            {{ t('auth.forgotPassword.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-slate-300">
            {{ t('auth.forgotPassword.description') }}
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

        <FormField :label="t('auth.fields.email')" label-for="email" :error="fieldError('email')">
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
              :label="t('common.actions.backToSignIn')"
            />
            <BaseButton
              type="submit"
              color="info"
              :icon="mdiSendOutline"
              :label="submitting ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendLink')"
              :disabled="submitting"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </main>
  </LayoutGuest>
</template>

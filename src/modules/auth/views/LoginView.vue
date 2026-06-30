<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { mdiAsterisk, mdiEmailOutline } from '@mdi/js'
import { isApiError } from '@/api/errors.js'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import { useAuthStore } from '@/stores/auth.js'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = reactive({
  email: '',
  password: '',
})

const formError = ref('')

const redirectTo = computed(() => {
  const redirect = route.query.redirect

  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
})

const clearErrors = () => {
  fieldErrors.email = ''
  fieldErrors.password = ''
  formError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!form.email) {
    fieldErrors.email = t('auth.errors.emailRequired')
  }

  if (!form.password) {
    fieldErrors.password = t('auth.errors.passwordRequired')
  }

  return !fieldErrors.email && !fieldErrors.password
}

const getErrorMessage = (error) => {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return t('auth.errors.signInFailed')
}

const submit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await authStore.login(form.email.trim(), form.password)
    await router.replace(redirectTo.value)
  } catch (error) {
    formError.value = getErrorMessage(error)
  }
}
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
            {{ t('auth.login.title') }}
          </h1>
        </div>

        <div
          v-if="formError"
          class="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700
            dark:border-red-800 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          {{ formError }}
        </div>

        <FormField :label="t('auth.fields.email')" label-for="email" :error="fieldErrors.email">
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

        <FormField :label="t('auth.fields.password')" label-for="password" :error="fieldErrors.password">
          <FormControl
            id="password"
            v-model="form.password"
            :icon="mdiAsterisk"
            name="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </FormField>

        <div class="mb-6 text-right text-sm">
          <RouterLink
            :to="{ name: 'forgot-password' }"
            class="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300
              dark:hover:text-blue-200"
          >
            {{ t('auth.login.forgotPassword') }}
          </RouterLink>
        </div>

        <template #footer>
          <BaseButtons type="justify-end">
            <BaseButton
              type="submit"
              color="info"
              :label="authStore.loading ? t('auth.login.signingIn') : t('auth.login.signIn')"
              :disabled="authStore.loading"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </main>
  </LayoutGuest>
</template>

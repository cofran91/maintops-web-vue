<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAlertCircleOutline,
  mdiArrowLeft,
  mdiCheckCircleOutline,
  mdiEmailOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiLockOutline,
  mdiLockReset,
  mdiShieldCheckOutline,
} from '@mdi/js'
import AuthRecoveryLayout from '@/components/layout/AuthRecoveryLayout.vue'
import { normalizeApiError } from '@/api/errors'
import { resetPassword } from '@/modules/auth/services/authService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const form = reactive({ token: '', email: '', password: '', password_confirmation: '' })
const fieldErrors = reactive({ token: '', email: '', password: '', password_confirmation: '' })
const formError = ref('')
const successMessage = ref('')
const submitting = ref(false)
const showPassword = ref(false)
const showConfirmation = ref(false)

const hasLinkData = computed(() => Boolean(form.token && form.email))
const requirements = computed(() => [
  { label: t('auth.reset.minimumCharacters'), valid: form.password.length >= 8 },
  { label: t('auth.reset.passwordsMatch'), valid: Boolean(form.password) && form.password === form.password_confirmation },
])

const fillFromQuery = () => {
  const token = route.query.token
  const email = route.query.email
  form.token = typeof token === 'string' ? token : ''
  form.email = typeof email === 'string' ? email : ''
}

const clearFeedback = () => {
  Object.keys(fieldErrors).forEach((key) => { fieldErrors[key as keyof typeof fieldErrors] = '' })
  formError.value = ''
  successMessage.value = ''
}

const validate = () => {
  clearFeedback()
  if (!form.token) fieldErrors.token = t('auth.reset.invalidToken')
  if (!form.email.trim()) fieldErrors.email = t('auth.reset.requiredEmail')
  if (!form.password) fieldErrors.password = t('auth.reset.requiredPassword')
  else if (form.password.length < 8) fieldErrors.password = t('auth.reset.shortPassword')
  if (!form.password_confirmation) fieldErrors.password_confirmation = t('auth.reset.requiredConfirmation')
  else if (form.password !== form.password_confirmation) fieldErrors.password_confirmation = t('auth.reset.mismatch')
  return !Object.values(fieldErrors).some(Boolean)
}

const submit = async () => {
  if (!validate()) return
  submitting.value = true

  try {
    successMessage.value = await resetPassword({ token: form.token, email: form.email.trim(), password: form.password, password_confirmation: form.password_confirmation })
    form.password = ''
    form.password_confirmation = ''
    authStore.clearSession()
  } catch (error) {
    const apiError = normalizeApiError(error)
    formError.value = apiError.message
    const errors = apiError.errors || {}
    fieldErrors.token = errors.token?.[0] || fieldErrors.token
    fieldErrors.email = errors.email?.[0] || fieldErrors.email
    fieldErrors.password = errors.password?.[0] || fieldErrors.password
    fieldErrors.password_confirmation = errors.password_confirmation?.[0] || fieldErrors.password_confirmation
  } finally {
    submitting.value = false
  }
}

const backToLogin = () => void router.push({ name: 'login' })
watch(() => [route.query.token, route.query.email], () => { fillFromQuery(); clearFeedback() }, { immediate: true })
</script>

<template>
  <AuthRecoveryLayout>
    <div class="recovery-heading">
      <span class="recovery-heading__icon"><v-icon :icon="mdiLockReset" size="22" /></span>
      <span class="recovery-eyebrow">{{ t('auth.reset.eyebrow') }}</span>
      <h1>{{ t('auth.reset.title') }}</h1>
      <p>{{ t('auth.reset.description') }}</p>
    </div>

    <v-alert v-if="successMessage" class="recovery-alert recovery-alert--success" :icon="mdiCheckCircleOutline" :text="successMessage" type="success" variant="tonal" />
    <v-alert v-if="formError || fieldErrors.token" class="recovery-alert" :icon="mdiAlertCircleOutline" :text="formError || fieldErrors.token" type="error" variant="tonal" />
    <v-alert v-if="!hasLinkData && !successMessage" class="recovery-alert" :icon="mdiAlertCircleOutline" :text="t('auth.reset.incompleteLink')" type="warning" variant="tonal" />

    <v-form class="recovery-form" @submit.prevent="submit">
      <input v-model="form.token" name="token" type="hidden" />
      <div class="recovery-field-group"><label for="reset-email">{{ t('auth.reset.email') }}</label><v-text-field id="reset-email" v-model="form.email" autocomplete="email" :error-messages="fieldErrors.email" hide-details="auto" name="email" :placeholder="t('auth.reset.emailPlaceholder')" :prepend-inner-icon="mdiEmailOutline" type="email" /></div>
      <div class="recovery-field-group"><label for="new-password">{{ t('auth.reset.newPassword') }}</label><v-text-field id="new-password" v-model="form.password" autocomplete="new-password" :append-inner-icon="showPassword ? mdiEyeOffOutline : mdiEyeOutline" :error-messages="fieldErrors.password" hide-details="auto" name="password" :placeholder="t('auth.reset.newPasswordPlaceholder')" :prepend-inner-icon="mdiLockOutline" :type="showPassword ? 'text' : 'password'" @click:append-inner="showPassword = !showPassword" /></div>
      <div class="recovery-field-group"><label for="confirm-password">{{ t('auth.reset.confirmPassword') }}</label><v-text-field id="confirm-password" v-model="form.password_confirmation" autocomplete="new-password" :append-inner-icon="showConfirmation ? mdiEyeOffOutline : mdiEyeOutline" :error-messages="fieldErrors.password_confirmation" hide-details="auto" name="password_confirmation" :placeholder="t('auth.reset.confirmPasswordPlaceholder')" :prepend-inner-icon="mdiLockOutline" :type="showConfirmation ? 'text' : 'password'" @click:append-inner="showConfirmation = !showConfirmation" /></div>
      <div class="password-requirements"><span v-for="requirement in requirements" :key="requirement.label" :class="{ 'password-requirement--valid': requirement.valid }"><v-icon :icon="requirement.valid ? mdiCheckCircleOutline : mdiShieldCheckOutline" size="14" />{{ requirement.label }}</span></div>
      <v-btn block class="recovery-submit" color="primary" height="52" :disabled="!hasLinkData || Boolean(successMessage)" :loading="submitting" type="submit"><v-icon :icon="mdiLockReset" class="mr-2" size="18" />{{ t('auth.reset.update') }}</v-btn>
      <button class="recovery-back-button" type="button" @click="backToLogin"><v-icon :icon="mdiArrowLeft" size="16" />{{ t('common.backToLogin') }}</button>
    </v-form>
  </AuthRecoveryLayout>
</template>

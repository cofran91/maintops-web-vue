<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  mdiAlertCircleOutline,
  mdiArrowLeft,
  mdiEmailOutline,
  mdiSendOutline,
  mdiShieldCheckOutline,
} from '@mdi/js'
import AuthRecoveryLayout from '@/components/layout/AuthRecoveryLayout.vue'
import { normalizeApiError } from '@/api/errors'
import { requestPasswordReset } from '@/modules/auth/services/authService'

const router = useRouter()
const { t } = useI18n()
const form = reactive({ email: '' })
const fieldError = ref('')
const formError = ref('')
const successMessage = ref('')
const submitting = ref(false)

const clearFeedback = () => {
  fieldError.value = ''
  formError.value = ''
  successMessage.value = ''
}

const validate = () => {
  fieldError.value = ''
  if (!form.email.trim()) fieldError.value = t('auth.forgot.requiredEmail')
  return !fieldError.value
}

const submit = async () => {
  clearFeedback()
  if (!validate()) return

  submitting.value = true

  try {
    successMessage.value = await requestPasswordReset({ email: form.email.trim() })
  } catch (error) {
    const apiError = normalizeApiError(error)
    formError.value = apiError.message
    fieldError.value = apiError.errors?.email?.[0] || ''
  } finally {
    submitting.value = false
  }
}

const backToLogin = () => void router.push({ name: 'login' })
</script>

<template>
  <AuthRecoveryLayout>
    <div class="recovery-heading">
      <span class="recovery-heading__icon"><v-icon :icon="mdiShieldCheckOutline" size="22" /></span>
      <span class="recovery-eyebrow">{{ t('auth.forgot.eyebrow') }}</span>
      <h1>{{ t('auth.forgot.title') }}</h1>
      <p>{{ t('auth.forgot.description') }}</p>
    </div>

    <v-alert v-if="successMessage" class="recovery-alert recovery-alert--success" :icon="mdiShieldCheckOutline" :text="successMessage" type="success" variant="tonal" />
    <v-alert v-if="formError" class="recovery-alert" :icon="mdiAlertCircleOutline" :text="formError" type="error" variant="tonal" />

    <v-form class="recovery-form" @submit.prevent="submit">
      <div class="recovery-field-group"><label for="recovery-email">{{ t('auth.forgot.email') }}</label><v-text-field id="recovery-email" v-model="form.email" autocomplete="email" :error-messages="fieldError" hide-details="auto" name="email" :placeholder="t('auth.forgot.emailPlaceholder')" :prepend-inner-icon="mdiEmailOutline" type="email" /></div>
      <div class="recovery-security-note"><v-icon :icon="mdiShieldCheckOutline" color="success" size="18" /><span>{{ t('auth.forgot.securityNote') }}</span></div>
      <v-btn block class="recovery-submit" color="primary" height="52" :loading="submitting" type="submit"><v-icon :icon="mdiSendOutline" class="mr-2" size="18" />{{ t('auth.forgot.submit') }}</v-btn>
      <button class="recovery-back-button" type="button" @click="backToLogin"><v-icon :icon="mdiArrowLeft" size="16" />{{ t('common.backToLogin') }}</button>
    </v-form>
  </AuthRecoveryLayout>
</template>

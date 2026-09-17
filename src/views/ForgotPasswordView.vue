<script setup lang="ts">
import { reactive, ref } from 'vue'
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
  if (!form.email.trim()) fieldError.value = 'Ingresa el correo electrónico de tu cuenta.'
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
      <span class="recovery-eyebrow">Recuperación de acceso</span>
      <h1>¿Olvidaste tu contraseña?</h1>
      <p>Ingresa tu correo y te enviaremos las instrucciones para recuperar el acceso a MaintOps.</p>
    </div>

    <v-alert v-if="successMessage" class="recovery-alert recovery-alert--success" :icon="mdiShieldCheckOutline" :text="successMessage" type="success" variant="tonal" />
    <v-alert v-if="formError" class="recovery-alert" :icon="mdiAlertCircleOutline" :text="formError" type="error" variant="tonal" />

    <v-form class="recovery-form" @submit.prevent="submit">
      <div class="recovery-field-group"><label for="recovery-email">Correo electrónico</label><v-text-field id="recovery-email" v-model="form.email" autocomplete="email" :error-messages="fieldError" hide-details="auto" name="email" placeholder="nombre@empresa.com" :prepend-inner-icon="mdiEmailOutline" type="email" /></div>
      <div class="recovery-security-note"><v-icon :icon="mdiShieldCheckOutline" color="success" size="18" /><span>Por seguridad, nunca compartiremos si una cuenta existe o no.</span></div>
      <v-btn block class="recovery-submit" color="primary" height="52" :loading="submitting" type="submit"><v-icon :icon="mdiSendOutline" class="mr-2" size="18" />Enviar instrucciones</v-btn>
      <button class="recovery-back-button" type="button" @click="backToLogin"><v-icon :icon="mdiArrowLeft" size="16" />Volver a iniciar sesión</button>
    </v-form>
  </AuthRecoveryLayout>
</template>

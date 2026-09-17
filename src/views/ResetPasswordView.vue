<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
const form = reactive({ token: '', email: '', password: '', password_confirmation: '' })
const fieldErrors = reactive({ token: '', email: '', password: '', password_confirmation: '' })
const formError = ref('')
const successMessage = ref('')
const submitting = ref(false)
const showPassword = ref(false)
const showConfirmation = ref(false)

const hasLinkData = computed(() => Boolean(form.token && form.email))
const requirements = computed(() => [
  { label: 'Mínimo 8 caracteres', valid: form.password.length >= 8 },
  { label: 'Las contraseñas coinciden', valid: Boolean(form.password) && form.password === form.password_confirmation },
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
  if (!form.token) fieldErrors.token = 'El enlace de recuperación no contiene un token válido.'
  if (!form.email.trim()) fieldErrors.email = 'Ingresa el correo electrónico de tu cuenta.'
  if (!form.password) fieldErrors.password = 'Ingresa una nueva contraseña.'
  else if (form.password.length < 8) fieldErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (!form.password_confirmation) fieldErrors.password_confirmation = 'Confirma tu nueva contraseña.'
  else if (form.password !== form.password_confirmation) fieldErrors.password_confirmation = 'Las contraseñas no coinciden.'
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
      <span class="recovery-eyebrow">Nueva contraseña</span>
      <h1>Restablece tu acceso</h1>
      <p>Crea una nueva contraseña para volver a ingresar de forma segura a tu operación.</p>
    </div>

    <v-alert v-if="successMessage" class="recovery-alert recovery-alert--success" :icon="mdiCheckCircleOutline" :text="successMessage" type="success" variant="tonal" />
    <v-alert v-if="formError || fieldErrors.token" class="recovery-alert" :icon="mdiAlertCircleOutline" :text="formError || fieldErrors.token" type="error" variant="tonal" />
    <v-alert v-if="!hasLinkData && !successMessage" class="recovery-alert" :icon="mdiAlertCircleOutline" text="El enlace está incompleto. Solicita uno nuevo para continuar." type="warning" variant="tonal" />

    <v-form class="recovery-form" @submit.prevent="submit">
      <input v-model="form.token" name="token" type="hidden" />
      <div class="recovery-field-group"><label for="reset-email">Correo electrónico</label><v-text-field id="reset-email" v-model="form.email" autocomplete="email" :error-messages="fieldErrors.email" hide-details="auto" name="email" placeholder="nombre@empresa.com" :prepend-inner-icon="mdiEmailOutline" type="email" /></div>
      <div class="recovery-field-group"><label for="new-password">Nueva contraseña</label><v-text-field id="new-password" v-model="form.password" autocomplete="new-password" :append-inner-icon="showPassword ? mdiEyeOffOutline : mdiEyeOutline" :error-messages="fieldErrors.password" hide-details="auto" name="password" placeholder="Mínimo 8 caracteres" :prepend-inner-icon="mdiLockOutline" :type="showPassword ? 'text' : 'password'" @click:append-inner="showPassword = !showPassword" /></div>
      <div class="recovery-field-group"><label for="confirm-password">Confirmar contraseña</label><v-text-field id="confirm-password" v-model="form.password_confirmation" autocomplete="new-password" :append-inner-icon="showConfirmation ? mdiEyeOffOutline : mdiEyeOutline" :error-messages="fieldErrors.password_confirmation" hide-details="auto" name="password_confirmation" placeholder="Repite tu contraseña" :prepend-inner-icon="mdiLockOutline" :type="showConfirmation ? 'text' : 'password'" @click:append-inner="showConfirmation = !showConfirmation" /></div>
      <div class="password-requirements"><span v-for="requirement in requirements" :key="requirement.label" :class="{ 'password-requirement--valid': requirement.valid }"><v-icon :icon="requirement.valid ? mdiCheckCircleOutline : mdiShieldCheckOutline" size="14" />{{ requirement.label }}</span></div>
      <v-btn block class="recovery-submit" color="primary" height="52" :disabled="!hasLinkData || Boolean(successMessage)" :loading="submitting" type="submit"><v-icon :icon="mdiLockReset" class="mr-2" size="18" />Actualizar contraseña</v-btn>
      <button class="recovery-back-button" type="button" @click="backToLogin"><v-icon :icon="mdiArrowLeft" size="16" />Volver a iniciar sesión</button>
    </v-form>
  </AuthRecoveryLayout>
</template>

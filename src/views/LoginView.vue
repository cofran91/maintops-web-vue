<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAlertCircleOutline,
  mdiArrowRight,
  mdiCalendarCheckOutline,
  mdiCarWrench,
  mdiCheckCircle,
  mdiChevronRight,
  mdiEmailOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiLockOutline,
  mdiShieldCheckOutline,
  mdiWrenchCogOutline,
} from '@mdi/js'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPassword = ref(false)
const rememberSession = ref(true)
const fieldErrors = reactive({
  email: '',
  password: '',
})

const credentials = reactive({
  email: '',
  password: '',
})

const formError = computed(() => authStore.error?.message ?? '')
const redirectTo = computed(() => {
  const redirect = route.query.redirect

  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/dashboard'
})

const clearErrors = () => {
  fieldErrors.email = ''
  fieldErrors.password = ''
  authStore.clearError()
}

const validateForm = () => {
  clearErrors()

  if (!credentials.email.trim()) {
    fieldErrors.email = 'Ingresa tu correo electrónico.'
  }

  if (!credentials.password) {
    fieldErrors.password = 'Ingresa tu contraseña.'
  }

  return !fieldErrors.email && !fieldErrors.password
}

const enterDashboard = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await authStore.login({
      email: credentials.email.trim(),
      password: credentials.password,
      remember: rememberSession.value,
    })
    await router.push(redirectTo.value)
  } catch {
    const errors = authStore.error?.errors
    fieldErrors.email = errors?.email?.[0] ?? ''
    fieldErrors.password = errors?.password?.[0] ?? ''
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-panel">
      <div class="login-panel__inner">
        <header class="brand" aria-label="MaintOps">
          <span class="brand__mark">
            <v-icon :icon="mdiWrenchCogOutline" size="23" />
          </span>
          <span class="brand__name">Maint<span>Ops</span></span>
        </header>

        <div class="login-content">
          <div class="login-heading">
            <span class="eyebrow">Portal operativo</span>
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa para gestionar la operación de mantenimiento de tu flota.</p>
          </div>

          <v-alert
            v-if="formError"
            class="login-alert"
            density="comfortable"
            :text="formError"
            type="error"
            variant="tonal"
          />

          <v-form class="login-form" @submit.prevent="enterDashboard">
            <div class="field-group">
              <label for="email">Correo electrónico</label>
              <v-text-field
                id="email"
                v-model="credentials.email"
                :prepend-inner-icon="mdiEmailOutline"
                autocomplete="email"
                base-color="#c8d0de"
                :error-messages="fieldErrors.email"
                hide-details="auto"
                name="email"
                placeholder="nombre@empresa.com"
                type="email"
              />
            </div>

            <div class="field-group">
              <div class="field-label-row">
                <label for="password">Contraseña</label>
                <button class="text-action" type="button">¿Olvidaste tu contraseña?</button>
              </div>
              <v-text-field
                id="password"
                v-model="credentials.password"
                :append-inner-icon="showPassword ? mdiEyeOffOutline : mdiEyeOutline"
                :prepend-inner-icon="mdiLockOutline"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                base-color="#c8d0de"
                :error-messages="fieldErrors.password"
                hide-details="auto"
                name="password"
                placeholder="Ingresa tu contraseña"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <div class="form-options">
              <v-checkbox-btn
                v-model="rememberSession"
                color="primary"
                density="compact"
                label="Mantener mi sesión iniciada"
              />
            </div>

            <v-btn
              block
              class="login-button"
              color="primary"
              :disabled="authStore.loading"
              height="54"
              :loading="authStore.loading"
              size="large"
              type="submit"
            >
              Ingresar
              <v-icon :icon="mdiArrowRight" class="ml-2" size="20" />
            </v-btn>

            <div class="demo-note">
              <v-icon :icon="mdiShieldCheckOutline" color="success" size="18" />
              <span>Usa las credenciales de tu cuenta MaintOps.</span>
            </div>
          </v-form>
        </div>

        <footer class="login-footer">
          <span>© 2026 MaintOps</span>
          <span class="login-footer__dot" />
          <button type="button">Soporte</button>
          <button type="button">Privacidad</button>
        </footer>
      </div>
    </section>

    <section class="login-visual" aria-hidden="true">
      <div class="visual-grid" />
      <div class="visual-glow visual-glow--one" />
      <div class="visual-glow visual-glow--two" />

      <div class="visual-content">
        <div class="visual-copy">
          <span class="visual-kicker"><i /> Control operativo en tiempo real</span>
          <h2>Tu operación de mantenimiento, bajo control.</h2>
          <p>
            Centraliza órdenes, vehículos y equipos para tomar decisiones claras en el momento
            indicado.
          </p>
        </div>

        <div class="product-preview">
          <div class="preview-topbar">
            <div class="window-dots"><i /><i /><i /></div>
            <div class="preview-title">
              <v-icon :icon="mdiWrenchCogOutline" size="15" />
              <span>Centro de operaciones</span>
            </div>
            <span class="live-pill"><i /> En línea</span>
          </div>

          <div class="preview-body">
            <div class="preview-header">
              <div>
                <span>Resumen de hoy</span>
                <strong>Buen día, Juan</strong>
              </div>
              <div class="preview-avatar">JM</div>
            </div>

            <div class="mini-stats">
              <div class="mini-stat">
                <span class="mini-stat__icon mini-stat__icon--blue">
                  <v-icon :icon="mdiCarWrench" size="18" />
                </span>
                <div><small>Órdenes activas</small><strong>24</strong></div>
                <em>+12%</em>
              </div>
              <div class="mini-stat">
                <span class="mini-stat__icon mini-stat__icon--green">
                  <v-icon :icon="mdiCalendarCheckOutline" size="18" />
                </span>
                <div><small>Programadas</small><strong>18</strong></div>
                <em>Hoy</em>
              </div>
              <div class="mini-stat">
                <span class="mini-stat__icon mini-stat__icon--orange">
                  <v-icon :icon="mdiAlertCircleOutline" size="18" />
                </span>
                <div><small>Por revisar</small><strong>7</strong></div>
                <em>Acción</em>
              </div>
            </div>

            <div class="preview-columns">
              <div class="activity-card">
                <div class="preview-card-title">
                  <div><strong>Actividad reciente</strong><span>Últimas órdenes</span></div>
                  <v-icon :icon="mdiChevronRight" size="18" />
                </div>

                <div class="activity-row">
                  <span class="activity-icon activity-icon--blue">
                    <v-icon :icon="mdiCarWrench" size="17" />
                  </span>
                  <div><strong>OT-1048</strong><span>Toyota Hilux · KLM 482</span></div>
                  <small class="status status--progress">En proceso</small>
                </div>
                <div class="activity-row">
                  <span class="activity-icon activity-icon--green">
                    <v-icon :icon="mdiCheckCircle" size="17" />
                  </span>
                  <div><strong>OT-1047</strong><span>Renault Duster · JRP 910</span></div>
                  <small class="status status--done">Finalizada</small>
                </div>
                <div class="activity-row">
                  <span class="activity-icon activity-icon--orange">
                    <v-icon :icon="mdiCalendarCheckOutline" size="17" />
                  </span>
                  <div><strong>OT-1046</strong><span>Chevrolet NHR · UXT 235</span></div>
                  <small class="status status--scheduled">Programada</small>
                </div>
              </div>

              <div class="health-card">
                <div class="health-card__top">
                  <span>Disponibilidad</span>
                  <small>+3.2%</small>
                </div>
                <div class="health-score">
                  <strong>94<small>%</small></strong>
                  <span>Flota operativa</span>
                </div>
                <div class="health-ring"><i /></div>
              </div>
            </div>
          </div>
        </div>

        <div class="trust-row">
          <div><strong>99.9%</strong><span>Disponibilidad</span></div>
          <i />
          <div><strong>+32%</strong><span>Eficiencia operativa</span></div>
          <i />
          <div><strong>24/7</strong><span>Visibilidad</span></div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped src="@/styles/views/login.scss" lang="scss"></style>

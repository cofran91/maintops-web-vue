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

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: minmax(430px, 0.86fr) minmax(620px, 1.14fr);
  min-height: 100dvh;
  overflow: hidden;
  background: #ffffff;
}

.login-panel {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100dvh;
  background: #ffffff;
}

.login-panel__inner {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: min(100%, 620px);
  min-height: 100%;
  margin: 0 auto;
  padding: clamp(30px, 5vw, 58px) clamp(34px, 6vw, 80px) 30px;
}

.brand {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 11px;
}

.brand__mark {
  display: grid;
  width: 40px;
  height: 40px;
  color: #ffffff;
  background: linear-gradient(145deg, #426af0, #2349d4);
  border-radius: 12px;
  box-shadow: 0 9px 22px rgba(49, 88, 231, 0.24);
  place-items: center;
}

.brand__name {
  color: #17223c;
  font-size: 21px;
  font-weight: 780;
  letter-spacing: -0.7px;
}

.brand__name span {
  color: #3158e7;
}

.login-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 430px;
  padding: 42px 0 34px;
}

.login-heading {
  margin-bottom: 33px;
}

.eyebrow {
  display: block;
  margin-bottom: 13px;
  color: #3158e7;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 1.35px;
  text-transform: uppercase;
}

.login-heading h1 {
  margin: 0 0 12px;
  color: #15213b;
  font-size: clamp(32px, 3vw, 42px);
  font-weight: 760;
  letter-spacing: -1.5px;
  line-height: 1.1;
}

.login-heading p {
  max-width: 390px;
  margin: 0;
  color: #71809a;
  font-size: 15px;
  line-height: 1.65;
}

.login-alert {
  margin-bottom: 21px;
  border-radius: 12px;
  font-size: 12px;
}

.login-form {
  display: grid;
  gap: 21px;
}

.field-group {
  display: grid;
  gap: 9px;
}

.field-group label {
  color: #28354f;
  font-size: 13px;
  font-weight: 680;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.text-action {
  padding: 0;
  color: #3158e7;
  font-size: 12px;
  font-weight: 680;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.login-form :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 1px 1px rgba(19, 34, 65, 0.02);
}

.login-form :deep(.v-field--focused) {
  box-shadow: 0 0 0 4px rgba(49, 88, 231, 0.08);
}

.login-form :deep(.v-field__input) {
  min-height: 52px;
  font-size: 14px;
}

.login-form :deep(.v-icon) {
  opacity: 0.78;
}

.form-options {
  min-height: 28px;
  margin-top: -6px;
}

.form-options :deep(.v-label) {
  color: #53617b;
  font-size: 13px;
  opacity: 1;
}

.login-button {
  margin-top: 1px;
  font-size: 14px;
  font-weight: 720;
  box-shadow: 0 12px 26px rgba(49, 88, 231, 0.25) !important;
}

.demo-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #73809a;
  font-size: 11.5px;
}

.login-footer {
  display: flex;
  align-items: center;
  gap: 13px;
  color: #98a2b5;
  font-size: 11px;
}

.login-footer button {
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.login-footer__dot {
  width: 3px;
  height: 3px;
  background: #c6ccd6;
  border-radius: 50%;
}

.login-visual {
  position: relative;
  display: flex;
  min-height: 100dvh;
  overflow: hidden;
  color: #ffffff;
  background:
    radial-gradient(circle at 90% 2%, rgba(57, 113, 218, 0.38), transparent 36%),
    linear-gradient(145deg, #111d36 0%, #132745 48%, #15345a 100%);
}

.visual-grid {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.09) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent);
}

.visual-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.visual-glow--one {
  top: 12%;
  right: -12%;
  width: 460px;
  height: 460px;
  background: rgba(51, 103, 224, 0.15);
  border: 1px solid rgba(109, 150, 243, 0.16);
}

.visual-glow--two {
  bottom: -18%;
  left: 3%;
  width: 390px;
  height: 390px;
  background: rgba(16, 183, 163, 0.08);
  border: 1px solid rgba(49, 204, 186, 0.11);
}

.visual-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
  padding: 58px clamp(46px, 6vw, 92px) 36px;
}

.visual-copy {
  max-width: 620px;
  margin-bottom: 32px;
}

.visual-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #9ebaff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.25px;
  text-transform: uppercase;
}

.visual-kicker i,
.live-pill i {
  width: 7px;
  height: 7px;
  background: #37d2ac;
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(55, 210, 172, 0.12);
}

.visual-copy h2 {
  max-width: 620px;
  margin: 0 0 15px;
  font-size: clamp(35px, 4vw, 54px);
  font-weight: 740;
  letter-spacing: -2px;
  line-height: 1.05;
}

.visual-copy p {
  max-width: 560px;
  margin: 0;
  color: #aebbd0;
  font-size: 14px;
  line-height: 1.7;
}

.product-preview {
  position: relative;
  overflow: hidden;
  color: #21304d;
  background: rgba(250, 252, 255, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 18px;
  box-shadow: 0 28px 70px rgba(5, 13, 29, 0.32);
  transform: perspective(1100px) rotateX(1deg) rotateY(-1.5deg);
  transform-origin: center;
}

.preview-topbar {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 16px;
  color: #6f7d96;
  background: #ffffff;
  border-bottom: 1px solid #e9edf4;
}

.window-dots {
  display: flex;
  gap: 5px;
}

.window-dots i {
  width: 6px;
  height: 6px;
  background: #cdd4df;
  border-radius: 50%;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  font-size: 9px;
  font-weight: 700;
}

.live-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #159778;
  font-size: 8px;
  font-weight: 700;
}

.live-pill i {
  width: 5px;
  height: 5px;
  box-shadow: none;
}

.preview-body {
  padding: 19px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.preview-header > div:first-child {
  display: grid;
  gap: 2px;
}

.preview-header span {
  color: #8490a5;
  font-size: 8px;
}

.preview-header strong {
  color: #1b2945;
  font-size: 14px;
  letter-spacing: -0.3px;
}

.preview-avatar {
  display: grid;
  width: 28px;
  height: 28px;
  color: #ffffff;
  font-size: 8px;
  font-weight: 750;
  background: linear-gradient(145deg, #4c72eb, #2d53d8);
  border-radius: 9px;
  place-items: center;
}

.mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-bottom: 10px;
}

.mini-stat {
  display: grid;
  grid-template-columns: 27px 1fr auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 10px;
}

.mini-stat__icon,
.activity-icon {
  display: grid;
  width: 27px;
  height: 27px;
  border-radius: 8px;
  place-items: center;
}

.mini-stat__icon--blue,
.activity-icon--blue {
  color: #3158e7;
  background: #e9efff;
}

.mini-stat__icon--green,
.activity-icon--green {
  color: #149579;
  background: #e4f7f1;
}

.mini-stat__icon--orange,
.activity-icon--orange {
  color: #dd8629;
  background: #fff1df;
}

.mini-stat div {
  display: grid;
}

.mini-stat small {
  overflow: hidden;
  color: #8a95a8;
  font-size: 6.8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-stat strong {
  color: #20304c;
  font-size: 14px;
  line-height: 1.05;
}

.mini-stat em {
  align-self: end;
  color: #279479;
  font-size: 6.5px;
  font-style: normal;
  font-weight: 700;
}

.preview-columns {
  display: grid;
  grid-template-columns: 1.65fr 0.72fr;
  gap: 10px;
}

.activity-card,
.health-card {
  min-width: 0;
  padding: 13px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 11px;
}

.preview-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #7c899f;
}

.preview-card-title div {
  display: grid;
}

.preview-card-title strong {
  color: #263650;
  font-size: 9px;
}

.preview-card-title span {
  font-size: 6.5px;
}

.activity-row {
  display: grid;
  grid-template-columns: 25px 1fr auto;
  align-items: center;
  gap: 7px;
  padding: 7px 0;
  border-top: 1px solid #f0f2f6;
}

.activity-icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
}

.activity-row > div {
  display: grid;
  min-width: 0;
}

.activity-row strong {
  color: #283750;
  font-size: 7.5px;
}

.activity-row span {
  overflow: hidden;
  color: #909aab;
  font-size: 6.3px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  padding: 3px 5px;
  font-size: 5.8px;
  font-weight: 700;
  border-radius: 10px;
}

.status--progress {
  color: #345fd7;
  background: #ebf0ff;
}

.status--done {
  color: #168867;
  background: #e8f7f1;
}

.status--scheduled {
  color: #d57a24;
  background: #fff2e2;
}

.health-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  background: linear-gradient(155deg, #f5f8ff, #edf3ff);
}

.health-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #52627d;
  font-size: 7px;
  font-weight: 700;
}

.health-card__top small {
  color: #159978;
  font-size: 6px;
}

.health-score {
  position: relative;
  z-index: 1;
  display: grid;
  margin-top: 17px;
}

.health-score strong {
  color: #2348bf;
  font-size: 26px;
  letter-spacing: -1.5px;
}

.health-score strong small {
  font-size: 10px;
}

.health-score span {
  color: #8290a6;
  font-size: 6.5px;
}

.health-ring {
  position: absolute;
  right: -23px;
  bottom: -29px;
  width: 83px;
  height: 83px;
  border: 12px solid rgba(49, 88, 231, 0.09);
  border-top-color: rgba(49, 88, 231, 0.55);
  border-radius: 50%;
  transform: rotate(20deg);
}

.trust-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 3vw, 38px);
  padding-top: 28px;
}

.trust-row > div {
  display: grid;
  gap: 1px;
  text-align: center;
}

.trust-row strong {
  font-size: 13px;
}

.trust-row span {
  color: #8fa1bc;
  font-size: 8px;
}

.trust-row > i {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.13);
}

@media (max-width: 1100px) {
  .login-page {
    grid-template-columns: minmax(400px, 0.9fr) minmax(500px, 1.1fr);
  }

  .visual-content {
    padding-right: 38px;
    padding-left: 38px;
  }

  .visual-copy h2 {
    font-size: 38px;
  }
}

@media (max-width: 900px) {
  .login-page {
    display: block;
    background:
      radial-gradient(circle at 100% 0, rgba(49, 88, 231, 0.09), transparent 33%),
      #ffffff;
  }

  .login-panel__inner {
    max-width: 620px;
    padding-right: 42px;
    padding-left: 42px;
  }

  .login-visual {
    display: none;
  }
}

@media (max-width: 520px) {
  .login-panel__inner {
    padding: 24px 22px 22px;
  }

  .login-content {
    padding: 44px 0 30px;
  }

  .login-heading h1 {
    font-size: 32px;
  }

  .field-label-row {
    align-items: flex-start;
  }

  .login-footer {
    flex-wrap: wrap;
  }
}
</style>

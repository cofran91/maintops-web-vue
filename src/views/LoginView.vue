<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()
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
    fieldErrors.email = t('auth.forgot.requiredEmail')
  }

  if (!credentials.password) {
    fieldErrors.password = t('auth.login.passwordPlaceholder')
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
        <div class="login-header">
          <header class="brand" aria-label="MaintOps">
            <span class="brand__mark">
              <v-icon :icon="mdiWrenchCogOutline" size="23" />
            </span>
            <span class="brand__name">Maint<span>Ops</span></span>
          </header>
          <div class="guest-preferences">
            <LanguageSwitcher />
          </div>
        </div>

        <div class="login-content">
          <div class="login-heading">
            <span class="eyebrow">{{ t('auth.login.eyebrow') }}</span>
            <h1>{{ t('auth.login.welcome') }}</h1>
            <p>{{ t('auth.login.description') }}</p>
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
              <label for="email">{{ t('auth.login.email') }}</label>
              <v-text-field
                id="email"
                v-model="credentials.email"
                :prepend-inner-icon="mdiEmailOutline"
                autocomplete="email"
                base-color="#c8d0de"
                :error-messages="fieldErrors.email"
                hide-details="auto"
                name="email"
                :placeholder="t('auth.login.emailPlaceholder')"
                type="email"
              />
            </div>

            <div class="field-group">
              <div class="field-label-row">
                <label for="password">{{ t('auth.login.password') }}</label>
                <router-link class="text-action" :to="{ name: 'forgot-password' }">{{ t('auth.login.forgotPassword') }}</router-link>
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
                :placeholder="t('auth.login.passwordPlaceholder')"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <div class="form-options">
              <v-checkbox-btn
                v-model="rememberSession"
                color="primary"
                density="compact"
                :label="t('auth.login.remember')"
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
              {{ t('auth.login.submit') }}
              <v-icon :icon="mdiArrowRight" class="ml-2" size="20" />
            </v-btn>

            <div class="demo-note">
              <v-icon :icon="mdiShieldCheckOutline" color="success" size="18" />
              <span>{{ t('auth.login.credentialsNote') }}</span>
            </div>
          </v-form>
        </div>

        <footer class="login-footer">
          <span>© 2026 MaintOps</span>
          <span class="login-footer__dot" />
          <button type="button">{{ t('auth.login.support') }}</button>
          <button type="button">{{ t('auth.login.privacy') }}</button>
        </footer>
      </div>
    </section>

    <section class="login-visual" aria-hidden="true">
      <div class="visual-grid" />
      <div class="visual-glow visual-glow--one" />
      <div class="visual-glow visual-glow--two" />

      <div class="visual-content">
        <div class="visual-copy">
          <span class="visual-kicker"><i /> {{ t('auth.login.visualKicker') }}</span>
          <h2>{{ t('auth.login.visualTitle') }}</h2>
          <p>{{ t('auth.login.visualDescription') }}</p>
        </div>

        <div class="product-preview">
          <div class="preview-topbar">
            <div class="window-dots"><i /><i /><i /></div>
            <div class="preview-title">
              <v-icon :icon="mdiWrenchCogOutline" size="15" />
              <span>{{ t('auth.login.operationsCenter') }}</span>
            </div>
            <span class="live-pill"><i /> {{ t('auth.login.online') }}</span>
          </div>

          <div class="preview-body">
            <div class="preview-header">
              <div>
                <span>{{ t('auth.login.todaySummary') }}</span>
                <strong>Buen día, Juan</strong>
              </div>
              <div class="preview-avatar">JM</div>
            </div>

            <div class="mini-stats">
              <div class="mini-stat">
                <span class="mini-stat__icon mini-stat__icon--blue">
                  <v-icon :icon="mdiCarWrench" size="18" />
                </span>
                <div><small>{{ t('auth.login.activeOrders') }}</small><strong>24</strong></div>
                <em>+12%</em>
              </div>
              <div class="mini-stat">
                <span class="mini-stat__icon mini-stat__icon--green">
                  <v-icon :icon="mdiCalendarCheckOutline" size="18" />
                </span>
                <div><small>{{ t('auth.login.scheduled') }}</small><strong>18</strong></div>
                <em>{{ t('common.today') }}</em>
              </div>
              <div class="mini-stat">
                <span class="mini-stat__icon mini-stat__icon--orange">
                  <v-icon :icon="mdiAlertCircleOutline" size="18" />
                </span>
                <div><small>{{ t('auth.login.needsReview') }}</small><strong>7</strong></div>
                <em>{{ t('auth.login.action') }}</em>
              </div>
            </div>

            <div class="preview-columns">
              <div class="activity-card">
                <div class="preview-card-title">
                  <div><strong>{{ t('auth.login.recentActivity') }}</strong><span>{{ t('auth.login.latestOrders') }}</span></div>
                  <v-icon :icon="mdiChevronRight" size="18" />
                </div>

                <div class="activity-row">
                  <span class="activity-icon activity-icon--blue">
                    <v-icon :icon="mdiCarWrench" size="17" />
                  </span>
                  <div><strong>OT-1048</strong><span>Toyota Hilux · KLM 482</span></div>
                  <small class="status status--progress">{{ t('auth.login.inProgress') }}</small>
                </div>
                <div class="activity-row">
                  <span class="activity-icon activity-icon--green">
                    <v-icon :icon="mdiCheckCircle" size="17" />
                  </span>
                  <div><strong>OT-1047</strong><span>Renault Duster · JRP 910</span></div>
                  <small class="status status--done">{{ t('auth.login.completed') }}</small>
                </div>
                <div class="activity-row">
                  <span class="activity-icon activity-icon--orange">
                    <v-icon :icon="mdiCalendarCheckOutline" size="17" />
                  </span>
                  <div><strong>OT-1046</strong><span>Chevrolet NHR · UXT 235</span></div>
                  <small class="status status--scheduled">{{ t('dashboard.statuses.scheduled') }}</small>
                </div>
              </div>

              <div class="health-card">
                <div class="health-card__top">
                  <span>{{ t('auth.login.availability') }}</span>
                  <small>+3.2%</small>
                </div>
                <div class="health-score">
                  <strong>94<small>%</small></strong>
                  <span>{{ t('auth.login.fleetOperational') }}</span>
                </div>
                <div class="health-ring"><i /></div>
              </div>
            </div>
          </div>
        </div>

        <div class="trust-row">
          <div><strong>99.9%</strong><span>{{ t('auth.login.operationalAvailability') }}</span></div>
          <i />
          <div><strong>+32%</strong><span>{{ t('auth.login.efficiency') }}</span></div>
          <i />
          <div><strong>24/7</strong><span>{{ t('auth.login.visibility') }}</span></div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped src="@/styles/views/login.scss" lang="scss"></style>

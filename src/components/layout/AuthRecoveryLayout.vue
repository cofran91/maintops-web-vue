<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  mdiArrowRight,
  mdiCalendarCheckOutline,
  mdiCarMultiple,
  mdiCheckCircleOutline,
  mdiShieldCheckOutline,
  mdiWrenchCogOutline,
} from '@mdi/js'

const { t } = useI18n()
</script>

<template>
  <main class="auth-recovery-page">
    <section class="auth-recovery-panel">
      <div class="auth-recovery-panel__inner">
        <router-link :aria-label="t('auth.recovery.backAria')" class="recovery-brand" :to="{ name: 'login' }">
          <span class="recovery-brand__mark"><v-icon :icon="mdiWrenchCogOutline" size="22" /></span>
          <span>Maint<span>Ops</span></span>
        </router-link>

        <div class="auth-recovery-content"><slot /></div>

        <footer class="auth-recovery-footer"><span>© 2026 MaintOps</span><i /><span>{{ t('auth.recovery.footer') }}</span></footer>
      </div>
    </section>

    <section class="auth-recovery-visual" aria-hidden="true">
      <div class="recovery-visual-grid" />
      <div class="recovery-visual-glow recovery-visual-glow--one" />
      <div class="recovery-visual-glow recovery-visual-glow--two" />
      <div class="auth-recovery-visual__content">
        <span class="recovery-kicker"><i /> {{ t('auth.recovery.visualKicker') }}</span>
        <h2>{{ t('auth.recovery.visualTitle') }}</h2>
        <p>{{ t('auth.recovery.visualDescription') }}</p>

        <div class="recovery-steps">
          <div class="recovery-step"><span class="recovery-step__number">01</span><span><strong>{{ t('auth.recovery.stepOneTitle') }}</strong><small>{{ t('auth.recovery.stepOneDescription') }}</small></span><v-icon :icon="mdiShieldCheckOutline" size="19" /></div>
          <div class="recovery-step"><span class="recovery-step__number">02</span><span><strong>{{ t('auth.recovery.stepTwoTitle') }}</strong><small>{{ t('auth.recovery.stepTwoDescription') }}</small></span><v-icon :icon="mdiCheckCircleOutline" size="19" /></div>
          <div class="recovery-step"><span class="recovery-step__number">03</span><span><strong>{{ t('auth.recovery.stepThreeTitle') }}</strong><small>{{ t('auth.recovery.stepThreeDescription') }}</small></span><v-icon :icon="mdiArrowRight" size="19" /></div>
        </div>

        <div class="recovery-product-card"><div class="recovery-product-card__top"><span><v-icon :icon="mdiWrenchCogOutline" size="14" /> MaintOps</span><small><i /> {{ t('auth.recovery.activePlatform') }}</small></div><div class="recovery-product-card__body"><div><span>{{ t('auth.recovery.fleetSupervised') }}</span><strong>{{ t('auth.recovery.operationUnderControl') }}</strong></div><div class="recovery-product-card__icons"><span><v-icon :icon="mdiCarMultiple" size="16" /></span><span><v-icon :icon="mdiCalendarCheckOutline" size="16" /></span><span><v-icon :icon="mdiShieldCheckOutline" size="16" /></span></div></div></div>
      </div>
    </section>
  </main>
</template>

<style src="@/styles/views/auth-recovery.scss" lang="scss"></style>

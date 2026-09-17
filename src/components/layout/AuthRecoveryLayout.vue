<script setup lang="ts">
import {
  mdiArrowRight,
  mdiCalendarCheckOutline,
  mdiCarMultiple,
  mdiCheckCircleOutline,
  mdiShieldCheckOutline,
  mdiWrenchCogOutline,
} from '@mdi/js'
</script>

<template>
  <main class="auth-recovery-page">
    <section class="auth-recovery-panel">
      <div class="auth-recovery-panel__inner">
        <router-link aria-label="Volver al inicio de sesión" class="recovery-brand" :to="{ name: 'login' }">
          <span class="recovery-brand__mark"><v-icon :icon="mdiWrenchCogOutline" size="22" /></span>
          <span>Maint<span>Ops</span></span>
        </router-link>

        <div class="auth-recovery-content"><slot /></div>

        <footer class="auth-recovery-footer"><span>© 2026 MaintOps</span><i /><span>Centro de operaciones de mantenimiento</span></footer>
      </div>
    </section>

    <section class="auth-recovery-visual" aria-hidden="true">
      <div class="recovery-visual-grid" />
      <div class="recovery-visual-glow recovery-visual-glow--one" />
      <div class="recovery-visual-glow recovery-visual-glow--two" />
      <div class="auth-recovery-visual__content">
        <span class="recovery-kicker"><i /> Seguridad de acceso MaintOps</span>
        <h2>Tu operación también está protegida.</h2>
        <p>Recupera el acceso de forma segura y continúa coordinando cada servicio de tu flota.</p>

        <div class="recovery-steps">
          <div class="recovery-step"><span class="recovery-step__number">01</span><span><strong>Verifica tu identidad</strong><small>Usaremos tu correo registrado para iniciar el proceso.</small></span><v-icon :icon="mdiShieldCheckOutline" size="19" /></div>
          <div class="recovery-step"><span class="recovery-step__number">02</span><span><strong>Define una nueva clave</strong><small>Elige una contraseña segura para tu cuenta.</small></span><v-icon :icon="mdiCheckCircleOutline" size="19" /></div>
          <div class="recovery-step"><span class="recovery-step__number">03</span><span><strong>Vuelve a la operación</strong><small>Accede de nuevo al dashboard de MaintOps.</small></span><v-icon :icon="mdiArrowRight" size="19" /></div>
        </div>

        <div class="recovery-product-card"><div class="recovery-product-card__top"><span><v-icon :icon="mdiWrenchCogOutline" size="14" /> MaintOps</span><small><i /> Plataforma activa</small></div><div class="recovery-product-card__body"><div><span>Flota supervisada</span><strong>Operación bajo control</strong></div><div class="recovery-product-card__icons"><span><v-icon :icon="mdiCarMultiple" size="16" /></span><span><v-icon :icon="mdiCalendarCheckOutline" size="16" /></span><span><v-icon :icon="mdiShieldCheckOutline" size="16" /></span></div></div></div>
      </div>
    </section>
  </main>
</template>

<style src="@/styles/views/auth-recovery.scss" lang="scss"></style>

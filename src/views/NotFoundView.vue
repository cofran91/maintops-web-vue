<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { mdiHomeOutline, mdiMapMarkerQuestionOutline, mdiWrenchCogOutline } from '@mdi/js'

const { t } = useI18n()
</script>

<template>
  <main class="not-found-page">
    <div class="not-found-page__grid" />
    <section class="not-found-card">
      <header class="not-found-brand">
        <span><v-icon :icon="mdiWrenchCogOutline" size="22" /></span>
        Maint<strong>Ops</strong>
      </header>

      <div class="not-found-card__icon">
        <v-icon :icon="mdiMapMarkerQuestionOutline" size="38" />
      </div>
      <span class="not-found-card__code">404</span>
      <h1>{{ t('errorPage.title') }}</h1>
      <p>{{ t('errorPage.description') }}</p>

      <div class="not-found-card__actions">
        <v-btn color="primary" :prepend-icon="mdiHomeOutline" :to="{ name: 'dashboard' }">
          {{ t('common.actions.backToDashboard') }}
        </v-btn>
      </div>
    </section>
  </main>
</template>

<style scoped src="@/styles/views/not-found.scss" lang="scss"></style>

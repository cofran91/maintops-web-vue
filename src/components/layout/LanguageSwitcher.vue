<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiTranslate } from '@mdi/js'
import {
  LOCALE_LABEL_KEYS,
  SUPPORTED_LOCALES,
  setLocale,
  type SupportedLocale,
} from '@/i18n'

const { locale, t } = useI18n()

const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((code) => ({
    code,
    label: t(LOCALE_LABEL_KEYS[code]),
  })),
)

const selectLocale = (code: SupportedLocale) => {
  setLocale(code)
}
</script>

<template>
  <v-menu location="bottom end" offset="8">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        aria-label="Cambiar idioma"
        class="language-switcher"
        rounded="lg"
        size="small"
        variant="tonal"
      >
        <v-icon :icon="mdiTranslate" size="17" />
        <span>{{ locale.toUpperCase() }}</span>
      </v-btn>
    </template>

    <v-list class="language-menu" density="compact" min-width="164" rounded="lg">
      <v-list-subheader>{{ t('language.label') }}</v-list-subheader>
      <v-list-item
        v-for="option in localeOptions"
        :key="option.code"
        :active="locale === option.code"
        :title="option.label"
        @click="selectLocale(option.code)"
      >
        <template #prepend>
          <span class="language-menu__code">{{ option.code.toUpperCase() }}</span>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped src="@/styles/components/language-switcher.scss" lang="scss"></style>

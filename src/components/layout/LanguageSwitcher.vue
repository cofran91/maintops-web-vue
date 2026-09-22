<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiTranslate } from '@mdi/js'
import {
  LOCALE_LABEL_KEYS,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { locale, t } = useI18n()
const isSaving = ref(false)

const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((code) => ({
    code,
    label: t(LOCALE_LABEL_KEYS[code]),
  })),
)

const selectLocale = async (code: SupportedLocale) => {
  if (locale.value === code || isSaving.value) return

  isSaving.value = true
  try {
    await authStore.updateLanguage(code)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <v-menu location="bottom end" offset="8">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :aria-label="t('language.label')"
        class="language-switcher"
        :loading="isSaving"
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
        :disabled="isSaving"
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

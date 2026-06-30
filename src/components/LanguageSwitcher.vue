<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_LABEL_KEYS, SUPPORTED_LOCALES } from '@/i18n/index.js'
import { useAuthStore } from '@/stores/auth.js'

defineProps({
  compact: Boolean,
})

const authStore = useAuthStore()
const { locale, t } = useI18n()
const isSaving = ref(false)

const options = computed(() =>
  SUPPORTED_LOCALES.map((value) => ({
    value,
    label: t(LOCALE_LABEL_KEYS[value]),
  })),
)

const changeLanguage = async (nextLocale) => {
  if (nextLocale === locale.value || isSaving.value) {
    return
  }

  isSaving.value = true

  try {
    await authStore.updateLanguage(nextLocale)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div
    class="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300"
    role="group"
    :aria-label="t('language.label')"
    :title="isSaving ? t('language.saving') : t('language.label')"
  >
    <span class="hidden sm:inline">{{ t('language.label') }}</span>
    <div
      class="inline-flex overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-slate-700
        dark:bg-slate-900"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="h-9 min-w-10 px-2 text-xs font-semibold transition-colors disabled:cursor-wait
          disabled:opacity-60"
        :class="
          option.value === locale
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800'
        "
        :aria-pressed="option.value === locale"
        :aria-label="option.label"
        :disabled="isSaving"
        @click="changeLanguage(option.value)"
      >
        {{ option.value.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

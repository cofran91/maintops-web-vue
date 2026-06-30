import { createI18n } from 'vue-i18n'
import { messages } from '@/i18n/messages.js'

export const DEFAULT_LOCALE = 'en'
export const LOCALE_STORAGE_KEY = 'maintops.locale'
export const SUPPORTED_LOCALES = Object.freeze(['en', 'es'])
export const LOCALE_LABEL_KEYS = Object.freeze({
  en: 'language.english',
  es: 'language.spanish',
})

const isBrowser = () => typeof window !== 'undefined'

export const normalizeLocale = (locale) => {
  if (typeof locale !== 'string') {
    return null
  }

  const normalized = locale.trim().toLowerCase().replace('_', '-')

  if (SUPPORTED_LOCALES.includes(normalized)) {
    return normalized
  }

  const [language] = normalized.split('-')

  return SUPPORTED_LOCALES.includes(language) ? language : null
}

const browserLocale = () => {
  if (!isBrowser()) {
    return null
  }

  return normalizeLocale(window.navigator.language)
}

export const storedLocale = () => {
  if (!isBrowser()) {
    return null
  }

  return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
}

export const resolveLocale = (...candidates) =>
  candidates.map(normalizeLocale).find((locale) => locale !== null) ??
  storedLocale() ??
  browserLocale() ??
  DEFAULT_LOCALE

export const i18n = createI18n({
  fallbackLocale: DEFAULT_LOCALE,
  legacy: false,
  locale: resolveLocale(),
  messages,
})

export const currentLocale = () => i18n.global.locale.value

export const setLocale = (locale) => {
  const normalized = resolveLocale(locale)

  i18n.global.locale.value = normalized

  if (isBrowser()) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
    document.documentElement.lang = normalized
  }

  return normalized
}

export const hasTranslation = (key) => i18n.global.te(key)

export const t = (key, params = undefined) => i18n.global.t(key, params)

export const translateIfExists = (key, fallback, params = undefined) =>
  hasTranslation(key) ? t(key, params) : fallback

setLocale(currentLocale())

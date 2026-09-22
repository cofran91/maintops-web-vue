import { createI18n } from 'vue-i18n'
import { messages, type SupportedLocale } from '@/i18n/messages'

export type { SupportedLocale }

export const DEFAULT_LOCALE: SupportedLocale = 'es'
export const LOCALE_STORAGE_KEY = 'maintops.locale'
export const SUPPORTED_LOCALES = ['es', 'en'] as const
export const LOCALE_LABEL_KEYS: Record<SupportedLocale, string> = {
  es: 'language.spanish',
  en: 'language.english',
}

const isBrowser = () => typeof window !== 'undefined'

export const normalizeLocale = (locale: unknown): SupportedLocale | null => {
  if (typeof locale !== 'string') {
    return null
  }

  const normalized = locale.trim().toLowerCase().replace('_', '-')

  if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
    return normalized as SupportedLocale
  }

  const [language] = normalized.split('-')

  return SUPPORTED_LOCALES.includes(language as SupportedLocale)
    ? (language as SupportedLocale)
    : null
}

const browserLocale = () => isBrowser() ? normalizeLocale(window.navigator.language) : null

export const storedLocale = () => {
  if (!isBrowser()) {
    return null
  }

  return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
}

export const resolveLocale = (...candidates: unknown[]): SupportedLocale =>
  candidates.map(normalizeLocale).find((locale): locale is SupportedLocale => locale !== null) ??
  storedLocale() ??
  browserLocale() ??
  DEFAULT_LOCALE

export const i18n = createI18n({
  fallbackLocale: DEFAULT_LOCALE,
  legacy: false,
  locale: resolveLocale(),
  messages,
})

export const currentLocale = () => i18n.global.locale.value as SupportedLocale

export const hasTranslation = (key: string) => i18n.global.te(key)

export const t = (key: string, params?: Record<string, unknown>) =>
  params ? i18n.global.t(key, params) : i18n.global.t(key)

export const setLocale = (locale: unknown): SupportedLocale => {
  const normalized = resolveLocale(locale)
  i18n.global.locale.value = normalized

  if (isBrowser()) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
    document.documentElement.lang = normalized
  }

  return normalized
}

setLocale(currentLocale())

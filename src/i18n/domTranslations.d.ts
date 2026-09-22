import type { SupportedLocale } from '@/i18n/messages'

export const translateDocument: () => void
export const startDomTranslations: () => void
export const translateKnownPhrase: (value: string, locale?: SupportedLocale) => string
export const knownTranslationPattern: RegExp

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const THEME_STORAGE_KEY = 'darkMode'

const browserPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const initialized = ref(false)

  const applyDocumentTheme = () => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('maintops-dark', isDark.value)
    document.documentElement.classList.toggle('dark', isDark.value)
    document.body?.classList.toggle('dark-scrollbars', isDark.value)
    document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
  }

  const setDark = (value: boolean, persist = true) => {
    isDark.value = value
    applyDocumentTheme()

    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, value ? '1' : '0')
    }
  }

  const initialize = () => {
    if (initialized.value) return
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem(THEME_STORAGE_KEY)
      : null

    setDark(stored === '1' || stored === 'dark' || (stored === null && browserPrefersDark()), false)
    initialized.value = true
  }

  const toggle = () => setDark(!isDark.value)

  return { initialized, isDark, initialize, setDark, toggle }
})

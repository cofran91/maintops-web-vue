import { defineStore } from 'pinia'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_TYPE_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  clearStoredAuth,
  onApiUnauthorized,
  setStoredToken,
} from '@/api/http.js'
import { normalizeApiError } from '@/api/errors.js'
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  updateLanguage as updateLanguageRequest,
} from '@/modules/auth/services/authService.js'
import { hasInteractiveRole, normalizeRole } from '@/types/auth.js'
import { useMainStore } from '@/stores/main.js'
import { normalizeLocale, setLocale, t } from '@/i18n/index.js'

const DEFAULT_TOKEN_TYPE = 'Bearer'

let unsubscribeUnauthorized = null

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

const normalizeUser = (user) => {
  const roles = Array.isArray(user?.roles)
    ? user.roles.map(normalizeRole).filter((role) => role !== null)
    : []
  const preferredLocale = normalizeLocale(user?.preferred_locale)

  return {
    ...user,
    ...(preferredLocale === null ? {} : { preferred_locale: preferredLocale }),
    roles,
  }
}

const canUseAuthenticatedUser = (user) => hasInteractiveRole(user?.roles ?? [])

const parseStoredUser = (storedUser) => {
  if (!storedUser) {
    return null
  }

  try {
    return normalizeUser(JSON.parse(storedUser))
  } catch {
    return null
  }
}

const persistUser = (user) => {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

const syncMainUser = (user) => {
  if (!user) {
    return
  }

  useMainStore().setUser({
    name: user.name,
    email: user.email,
  })
}

const syncLocaleFromUser = (user) => {
  const locale = normalizeLocale(user?.preferred_locale)

  if (locale !== null) {
    setLocale(locale)
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    tokenType: null,
    user: null,
    initialized: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    role: (state) => state.user?.roles?.[0] ?? null,
    roles: (state) => state.user?.roles ?? [],
  },

  actions: {
    initializeSession() {
      if (!this.initialized) {
        this.hydrateSession()
      }

      if (!unsubscribeUnauthorized) {
        unsubscribeUnauthorized = onApiUnauthorized(() => {
          this.clearSession()
        })
      }
    },

    hydrateSession() {
      const storage = getStorage()

      if (!storage) {
        this.initialized = true
        return
      }

      const token = storage.getItem(AUTH_TOKEN_STORAGE_KEY)
      const tokenType = storage.getItem(AUTH_TOKEN_TYPE_STORAGE_KEY) || DEFAULT_TOKEN_TYPE
      const user = parseStoredUser(storage.getItem(AUTH_USER_STORAGE_KEY))

      if (!token) {
        this.clearSession()
        return
      }

      if (user && !canUseAuthenticatedUser(user)) {
        this.clearSession()
        return
      }

      this.token = token
      this.tokenType = tokenType
      this.user = user
      this.initialized = true
      this.error = null

      syncLocaleFromUser(user)
      syncMainUser(user)
    },

    persistSession(token, tokenType, user) {
      setStoredToken(token, tokenType)
      persistUser(user)
    },

    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const data = await loginRequest({ email, password })
        const user = normalizeUser(data.user)

        if (!data.token || !canUseAuthenticatedUser(user)) {
          throw new Error(t('auth.errors.nonInteractiveRole'))
        }

        const tokenType = data.token_type || DEFAULT_TOKEN_TYPE

        this.token = data.token
        this.tokenType = tokenType
        this.user = user
        this.initialized = true

        this.persistSession(data.token, tokenType, user)
        syncLocaleFromUser(user)
        syncMainUser(user)

        return user
      } catch (error) {
        const apiError = normalizeApiError(error)

        this.error = apiError
        throw apiError
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      if (!this.token) {
        return null
      }

      this.loading = true
      this.error = null

      try {
        const user = normalizeUser(await fetchCurrentUser())

        if (!canUseAuthenticatedUser(user)) {
          this.clearSession()
          throw new Error(t('auth.errors.nonInteractiveRole'))
        }

        this.user = user
        this.persistSession(this.token, this.tokenType || DEFAULT_TOKEN_TYPE, user)
        syncLocaleFromUser(user)
        syncMainUser(user)

        return user
      } catch (error) {
        const apiError = normalizeApiError(error)

        this.error = apiError
        throw apiError
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const shouldNotifyApi = Boolean(this.token)

      this.loading = true
      this.error = null

      try {
        if (shouldNotifyApi) {
          await logoutRequest()
        }
      } catch (error) {
        this.error = normalizeApiError(error)
      } finally {
        this.clearSession()
        this.loading = false
      }
    },

    async updateLanguage(locale) {
      const normalizedLocale = setLocale(locale)

      if (!this.isAuthenticated) {
        return normalizedLocale
      }

      try {
        const data = await updateLanguageRequest(normalizedLocale)
        const persistedLocale = normalizeLocale(data.locale) ?? normalizedLocale
        const user = normalizeUser({
          ...this.user,
          preferred_locale: persistedLocale,
        })

        this.user = user
        persistUser(user)
        setLocale(persistedLocale)

        return persistedLocale
      } catch (error) {
        const apiError = normalizeApiError(error)

        this.error = apiError
        throw apiError
      }
    },

    clearSession() {
      this.token = null
      this.tokenType = null
      this.user = null
      this.initialized = true

      clearStoredAuth()
    },
  },
})

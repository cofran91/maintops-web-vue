import { defineStore } from 'pinia'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_TYPE_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  clearStoredAuth,
  getStoredToken,
  getStoredTokenType,
  onApiUnauthorized,
  setStoredToken,
} from '@/api/http'
import { normalizeApiError, type ApiError } from '@/api/errors'
import { canAccessRoute, canUseResource, type PermissionAction } from '@/auth/permissions'
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  updateLanguage as updateLanguageRequest,
} from '@/modules/auth/services/authService'
import { normalizeLocale, setLocale, t, type SupportedLocale } from '@/i18n'
import type { AuthUser, LoginCredentials } from '@/types/auth'

interface AuthState {
  token: string | null
  tokenType: string
  user: AuthUser | null
  initialized: boolean
  loading: boolean
  error: ApiError | null
}

let removeUnauthorizedListener: (() => void) | null = null

const getStorage = () => (typeof window !== 'undefined' ? window.localStorage : null)
const getSessionStorage = () => (typeof window !== 'undefined' ? window.sessionStorage : null)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeUser = (value: unknown): AuthUser | null => {
  if (!isRecord(value)) {
    return null
  }

  return {
    ...value,
    ...(Array.isArray(value.roles)
      ? { roles: value.roles.filter((role): role is string => typeof role === 'string') }
      : {}),
  }
}

const readStoredUser = (): AuthUser | null => {
  const value =
    getStorage()?.getItem(AUTH_USER_STORAGE_KEY) ??
    getSessionStorage()?.getItem(AUTH_USER_STORAGE_KEY)

  if (!value) {
    return null
  }

  try {
    return normalizeUser(JSON.parse(value))
  } catch {
    return null
  }
}

const persistUser = (user: AuthUser, remember = true) => {
  const storage = remember ? getStorage() : getSessionStorage()
  storage?.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

const syncLocaleFromUser = (user: AuthUser | null) => {
  const locale = normalizeLocale(user?.preferred_locale)
  if (locale) setLocale(locale)
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    tokenType: 'Bearer',
    user: null,
    initialized: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    roles: (state) => state.user?.roles ?? [],
    canAccessRoute: (state) => (routeName: string) => canAccessRoute(routeName, state.user?.roles),
    canUseResource: (state) => (resource: string, action: PermissionAction) =>
      canUseResource(resource, action, state.user?.roles),
  },

  actions: {
    async initializeSession() {
      if (this.initialized) {
        return this.isAuthenticated
      }

      this.token = getStoredToken()
      this.tokenType = getStoredTokenType()
      this.user = readStoredUser()
      syncLocaleFromUser(this.user)
      this.initialized = true

      if (!removeUnauthorizedListener) {
        removeUnauthorizedListener = onApiUnauthorized(() => this.clearSession())
      }

      if (this.token && !this.user) {
        try {
          await this.fetchMe()
        } catch {
          this.clearSession()
        }
      }

      return this.isAuthenticated
    },

    async login(credentials: LoginCredentials) {
      this.loading = true
      this.error = null

      try {
        const { remember = true, ...requestCredentials } = credentials
        const data = await loginRequest(requestCredentials)
        const user = normalizeUser(data.user)

        if (!data.token || !user) {
          throw new Error(t('auth.errors.signInFailed'))
        }

        this.token = data.token
        this.tokenType = data.token_type || 'Bearer'
        this.user = user
        syncLocaleFromUser(user)
        this.initialized = true

        setStoredToken(this.token, this.tokenType, remember)
        persistUser(user, remember)

        return user
      } catch (error) {
        this.error = normalizeApiError(error)
        throw this.error
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

        if (!user) {
          throw new Error(t('api.errors.missingData'))
        }

        this.user = user
        syncLocaleFromUser(user)
        persistUser(user)

        return user
      } catch (error) {
        this.error = normalizeApiError(error)
        throw this.error
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

    async updateLanguage(locale: SupportedLocale) {
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

        if (user) {
          this.user = user
          persistUser(user, window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) !== null)
        }

        setLocale(persistedLocale)
        return persistedLocale
      } catch (error) {
        this.error = normalizeApiError(error)
        throw this.error
      }
    },

    clearError() {
      this.error = null
    },

    clearSession() {
      this.token = null
      this.tokenType = 'Bearer'
      this.user = null
      this.initialized = true
      clearStoredAuth()
    },
  },
})

export { AUTH_TOKEN_STORAGE_KEY, AUTH_TOKEN_TYPE_STORAGE_KEY }

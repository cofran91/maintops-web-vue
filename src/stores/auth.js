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
} from '@/modules/auth/services/authService.js'
import { hasInteractiveRole, normalizeRole } from '@/types/auth.js'
import { useMainStore } from '@/stores/main.js'

const DEFAULT_TOKEN_TYPE = 'Bearer'
const NON_INTERACTIVE_ROLE_MESSAGE = 'This account cannot access the administrative console.'

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

  return {
    ...user,
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
          throw new Error(NON_INTERACTIVE_ROLE_MESSAGE)
        }

        const tokenType = data.token_type || DEFAULT_TOKEN_TYPE

        this.token = data.token
        this.tokenType = tokenType
        this.user = user
        this.initialized = true

        this.persistSession(data.token, tokenType, user)
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
          throw new Error(NON_INTERACTIVE_ROLE_MESSAGE)
        }

        this.user = user
        this.persistSession(this.token, this.tokenType || DEFAULT_TOKEN_TYPE, user)
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

    clearSession() {
      this.token = null
      this.tokenType = null
      this.user = null
      this.initialized = true

      clearStoredAuth()
    },
  },
})

export interface AuthUser {
  id?: number | string
  name?: string
  email?: string
  roles?: string[]
  preferred_locale?: string | null
  [key: string]: unknown
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  token_type?: string
  user: AuthUser
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

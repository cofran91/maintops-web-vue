export interface AuthUser {
  id?: number | string
  name?: string
  email?: string
  roles?: string[]
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

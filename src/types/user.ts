import type { MaintenanceOrderPagination } from '@/types/maintenanceOrder'

export type UserRole = 'system_admin' | 'advisor' | 'workshop_manager' | 'technician'

export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  role?: UserRole | string | null
  roles?: string[]
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface UserPage {
  items: User[]
  pagination: MaintenanceOrderPagination
}

export interface UserFilters {
  search: string
  role: string
  status: string
}

export interface UserPayload {
  name: string
  email: string
  phone: string | null
  role: string
  password?: string | null
  is_active: boolean
}

import type { MaintenanceOrderPagination } from '@/types/maintenanceOrder'

export type UserRole = 'system_admin' | 'advisor' | 'workshop_manager' | 'technician'

export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  document_number?: string | null
  address?: string | null
  workshop_id?: number | null
  workshop?: UserWorkshop | null
  role?: UserRole | string | null
  roles?: string[]
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface UserWorkshop {
  id: number
  name?: string | null
  code?: string | null
  city?: string | null
  is_active?: boolean
}

export interface UserPage {
  items: User[]
  pagination: MaintenanceOrderPagination
}

export interface UserFilters {
  search: string
  role: string
  status: string
  workshop_id: string
  without_workshop: boolean
}

export interface UserPayload {
  name: string
  email: string
  phone: string | null
  document_number: string | null
  address: string | null
  workshop_id: number | null
  role: string
  password?: string | null
  password_confirmation?: string | null
  is_active: boolean
}

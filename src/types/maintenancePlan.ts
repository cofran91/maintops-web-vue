import type { MaintenanceOrderPagination } from '@/types/maintenanceOrder'
import type { MaintenanceTask } from '@/types/maintenanceTask'

export type { MaintenanceTask } from '@/types/maintenanceTask'

export interface MaintenancePlanVehicleSystem {
  id: number
  code?: string | null
  name?: string | null
}

export interface MaintenancePlan {
  id: number
  code: string
  name: string
  description?: string | null
  recommended_interval_days?: number | null
  recommended_interval_km?: number | null
  task_ids?: number[]
  is_active: boolean
  tasks?: MaintenanceTask[]
  tasks_count?: number
  created_at?: string | null
  updated_at?: string | null
}

export interface MaintenancePlanPage {
  items: MaintenancePlan[]
  pagination: MaintenanceOrderPagination
}

export interface MaintenancePlanFilters {
  search: string
  code: string
  is_active: string
  name: string
  task_id: string
  recommended_interval_days_from: string
  recommended_interval_days_to: string
  recommended_interval_km_from: string
  recommended_interval_km_to: string
  created_from: string
  created_to: string
}

export interface MaintenancePlanPayload {
  code: string
  name: string
  description: string | null
  recommended_interval_days: number | null
  recommended_interval_km: number | null
  task_ids: number[]
  is_active: boolean
}

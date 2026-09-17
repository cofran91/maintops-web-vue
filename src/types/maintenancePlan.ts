import type { MaintenanceOrderPagination } from '@/types/maintenanceOrder'

export interface MaintenancePlanVehicleSystem {
  id: number
  code?: string | null
  name?: string | null
}

export interface MaintenanceTask {
  id: number
  code: string
  name: string
  description?: string | null
  vehicle_system_id?: number | null
  vehicle_system?: MaintenancePlanVehicleSystem | null
  estimated_duration_minutes?: number | null
  sequence?: number | null
  is_active?: boolean
}

export interface MaintenancePlan {
  id: number
  code: string
  name: string
  description?: string | null
  interval_km?: number | null
  interval_months?: number | null
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
  status: string
}

export interface MaintenanceTaskPayload {
  id?: number
  code: string
  name: string
  description: string | null
  vehicle_system_id: number | null
  estimated_duration_minutes: number | null
  sequence: number
}

export interface MaintenancePlanPayload {
  code: string
  name: string
  description: string | null
  interval_km: number | null
  interval_months: number | null
  is_active: boolean
  tasks: MaintenanceTaskPayload[]
}

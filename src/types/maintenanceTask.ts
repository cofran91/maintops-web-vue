export const MAINTENANCE_TASK_STATUSES = [
  'created',
  'scheduled',
  'started',
  'cancelled',
  'completed',
  'rejected',
] as const

export type MaintenanceTaskStatus = (typeof MAINTENANCE_TASK_STATUSES)[number]

export const MAINTENANCE_TASK_STATUS_LABELS: Record<MaintenanceTaskStatus, string> = {
  created: 'Creada',
  scheduled: 'Programada',
  started: 'Iniciada',
  cancelled: 'Cancelada',
  completed: 'Finalizada',
  rejected: 'Rechazada',
}

export interface MaintenanceTaskVehicle {
  id: number
  license_plate: string
  brand?: string | null
  model?: string | null
  year?: number | null
  color?: string | null
  odometer_km?: number | null
}

export interface MaintenanceTaskSystem {
  id: number
  code?: string | null
  name?: string | null
}

export interface MaintenanceTask {
  id: number
  vehicle_id?: number | null
  vehicle?: MaintenanceTaskVehicle | null
  vehicle_system_id: number
  vehicle_system?: MaintenanceTaskSystem | null
  name: string
  code: string
  description?: string | null
  estimated_duration_minutes: number
  status: MaintenanceTaskStatus | string
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface MaintenanceTaskPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface MaintenanceTaskPage {
  items: MaintenanceTask[]
  pagination: MaintenanceTaskPagination
}

export interface MaintenanceTaskFilters {
  search: string
  vehicle_system_id: string
  status: string
  is_active: string
}

export interface MaintenanceTaskPayload {
  vehicle_id: number | null
  vehicle_system_id: number
  name: string
  code: string
  description: string | null
  estimated_duration_minutes: number
  is_active: boolean
}

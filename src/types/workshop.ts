export interface WorkshopManager {
  id: number
  name?: string | null
  email?: string | null
}

export interface WorkshopVehicleSystem {
  id: number
  code?: string | null
  name?: string | null
}

export interface WorkshopTechnician {
  id: number
  name?: string | null
  email?: string | null
}

export interface WorkshopScheduleEntry {
  opens_at: string
  closes_at: string
}

export interface Workshop {
  id: number
  manager_user_id: number
  manager?: WorkshopManager | null
  name: string
  code: string
  address?: string | null
  city?: string | null
  phone?: string | null
  email?: string | null
  weekly_schedule?: Record<string, WorkshopScheduleEntry>
  vehicle_system_ids?: number[]
  vehicle_systems?: WorkshopVehicleSystem[]
  technician_user_ids?: number[]
  technicians?: WorkshopTechnician[]
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface WorkshopPage {
  items: Workshop[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export interface WorkshopFilters {
  search: string
  city: string
  status: string
}

export interface WorkshopPayload {
  manager_user_id: number
  name: string
  code: string
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  weekly_schedule: Record<string, WorkshopScheduleEntry>
  vehicle_system_ids: number[]
  technician_user_ids: number[]
  is_active: boolean
}

export interface VehicleOwner {
  id: number
  name?: string | null
  email?: string | null
  phone?: string | null
}

export interface Vehicle {
  id: number
  owner_id: number
  owner?: VehicleOwner | null
  license_plate: string
  brand?: string | null
  model?: string | null
  year?: number | null
  color?: string | null
  odometer_km: number
  created_at?: string | null
  updated_at?: string | null
}

export interface VehiclePagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface VehiclePage {
  items: Vehicle[]
  pagination: VehiclePagination
}

export interface VehicleFilters {
  search: string
  license_plate: string
  brand: string
  model: string
  year: string
  color: string
  owner_id: string
  created_from: string
  created_to: string
}

export interface VehiclePayload {
  owner_id: number
  license_plate: string
  brand: string | null
  model: string | null
  year: number | null
  color: string | null
  odometer_km: number
}

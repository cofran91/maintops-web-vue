export interface VehicleSystem {
  id: number
  code: string
  name: string
}

export interface VehicleSystemPage {
  items: VehicleSystem[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

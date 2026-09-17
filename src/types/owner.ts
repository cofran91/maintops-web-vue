export interface Owner {
  id: number
  name: string
  email: string
  is_active: boolean
  phone?: string | null
  document_number?: string | null
  address?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface OwnerPage {
  items: Owner[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export interface OwnerFilters {
  search: string
  status: string
}

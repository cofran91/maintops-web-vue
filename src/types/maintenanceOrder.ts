export const MAINTENANCE_ORDER_STATUSES = [
  'created',
  'pending_owner_approval',
  'approved',
  'partially_approved',
  'rejected',
  'scheduled',
  'in_progress',
  'completed',
  'delivered',
  'cancelled',
] as const

export type MaintenanceOrderStatus = (typeof MAINTENANCE_ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<MaintenanceOrderStatus, string> = {
  created: 'Creada',
  pending_owner_approval: 'Por aprobar',
  approved: 'Aprobada',
  partially_approved: 'Aprobada parcialmente',
  rejected: 'Rechazada',
  scheduled: 'Programada',
  in_progress: 'En proceso',
  completed: 'Finalizada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
}

export interface MaintenanceOrderPerson {
  id: number
  name?: string | null
  email?: string | null
}

export interface MaintenanceOrderVehicle {
  id: number
  license_plate?: string | null
  brand?: string | null
  model?: string | null
}

export interface MaintenanceOrderWorkshop {
  id: number
  name?: string | null
  code?: string | null
  city?: string | null
}

export interface MaintenanceOrderItem {
  id: number
  status?: string | null
}

export interface MaintenanceOrder {
  id: number
  vehicle_id: number
  vehicle?: MaintenanceOrderVehicle | null
  owner?: MaintenanceOrderPerson | null
  advisor?: MaintenanceOrderPerson | null
  workshop?: MaintenanceOrderWorkshop | null
  technician?: MaintenanceOrderPerson | null
  status: string
  scheduled_at?: string | null
  started_at?: string | null
  finished_at?: string | null
  delivered_at?: string | null
  cancelled_at?: string | null
  items?: MaintenanceOrderItem[]
  created_at?: string | null
  updated_at?: string | null
}

export interface MaintenanceOrderPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface MaintenanceOrderPage {
  items: MaintenanceOrder[]
  pagination: MaintenanceOrderPagination
}

export interface MaintenanceOrderFilters {
  search: string
  status: string
}

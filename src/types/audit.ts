import type { MaintenanceOrderPagination } from '@/types/maintenanceOrder'

export const AUDIT_EVENTS = ['created', 'updated', 'deleted', 'restored'] as const
export type AuditEvent = (typeof AUDIT_EVENTS)[number] | string

export interface AuditActor {
  type: string | null
  id: number | null
  resource?: Record<string, unknown> | null
}

export interface AuditedResource {
  type: string
  id: number
  resource?: Record<string, unknown> | null
}

export type AuditValues = Record<string, unknown> | unknown[] | null

export interface AuditLog {
  id: number
  event: AuditEvent
  actor: AuditActor
  auditable: AuditedResource
  old_values: AuditValues
  new_values: AuditValues
  url?: string | null
  user_agent?: string | null
  tags?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface AuditPage {
  items: AuditLog[]
  pagination: MaintenanceOrderPagination
}

export interface AuditFilters {
  search: string
  event: string
  user_id: string
  url: string
  tags: string
  created_from: string
  created_to: string
}

export type RealtimeConnectionStatus =
  | 'disabled'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

export interface RealtimeToken {
  audience: 'realtime'
  token: string
  token_type: string
  expires_in: number
  expires_at: string
}

export interface OperationalEvent {
  event_id: string
  event_type: string
  version: number
  occurred_at: string
  aggregate: {
    type: 'maintenance_order' | 'maintenance_order_item'
    id: string | number
  }
  actor?: { user_id?: number | null }
  targets?: {
    workshop_id?: number | null
    workshop_manager_id?: number | null
    technician_id?: number | null
    advisor_id?: number | null
  }
  data: Record<string, unknown>
}

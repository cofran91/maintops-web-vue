import type { AuditLog } from '@/types/audit'

const modelNames: Record<string, string> = {
  'App\\Models\\MaintenanceOrder': 'Orden de mantenimiento',
  'App\\Models\\MaintenanceOrderItem': 'Actividad de orden',
  'App\\Models\\MaintenancePlan': 'Plan de mantenimiento',
  'App\\Models\\MaintenanceTask': 'Tarea de mantenimiento',
  'App\\Models\\Owner': 'Propietario',
  'App\\Models\\User': 'Usuario',
  'App\\Models\\Vehicle': 'Vehículo',
  'App\\Models\\VehicleSystem': 'Sistema de vehículo',
  'App\\Models\\Workshop': 'Taller',
}

const fieldNames: Record<string, string> = {
  created_at: 'Creado',
  updated_at: 'Actualizado',
  deleted_at: 'Eliminado',
  is_active: 'Estado activo',
  license_plate: 'Placa',
  estimated_duration_minutes: 'Duración estimada',
  recommended_interval_days: 'Intervalo recomendado (días)',
  recommended_interval_kilometers: 'Intervalo recomendado (km)',
  maintenance_plan_id: 'Plan de mantenimiento',
  maintenance_task_id: 'Tarea de mantenimiento',
  technician_id: 'Técnico',
  workshop_id: 'Taller',
  vehicle_id: 'Vehículo',
  status: 'Estado',
  role: 'Rol',
  name: 'Nombre',
  email: 'Correo electrónico',
  code: 'Código',
  description: 'Descripción',
}

export const eventLabel = (event: string) => ({ created: 'Creado', updated: 'Actualizado', deleted: 'Eliminado', restored: 'Restaurado' }[event] || event)
export const eventColor = (event: string) => event === 'deleted' ? 'error' : ['created', 'restored'].includes(event) ? 'success' : event === 'updated' ? 'info' : 'secondary'
export const modelTypeLabel = (type?: string | null) => type ? modelNames[type] || type.split('\\').at(-1) || type : 'Sistema'
export const auditFieldLabel = (field: string) => fieldNames[field] || field.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
export const displayUrl = (url?: string | null) => {
  if (!url) return '—'
  try {
    const parsed = new URL(url)
    return parsed.pathname + parsed.search || url
  } catch {
    return url
  }
}

export const formatAuditValue = (value: unknown, field: string) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  if (field === 'status' || field === 'role') return String(value).replaceAll('_', ' ')
  return String(value)
}

export const actorLabel = (audit: AuditLog) => audit.actor?.resource
  ? extractName(audit.actor.resource)
  : audit.actor?.id ? 'Usuario #' + audit.actor.id : 'Sistema'

export const auditableLabel = (audit: AuditLog) => {
  const resource = audit.auditable?.resource
  return resource ? extractName(resource) : modelTypeLabel(audit.auditable?.type) + ' #' + (audit.auditable?.id ?? '—')
}

const extractName = (resource: Record<string, unknown>) =>
  String(resource.name || resource.email || resource.code || resource.license_plate || '#' + (resource.id ?? '—'))

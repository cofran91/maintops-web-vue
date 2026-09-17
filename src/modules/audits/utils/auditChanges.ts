import type { AuditLog } from '@/types/audit'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalized = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalized)
  if (isRecord(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalized(value[key])]))
  return value
}

export const extractResourceLabel = (resource?: Record<string, unknown> | null) => {
  if (!resource) return null
  const value = ['name', 'email', 'code', 'license_plate', 'title']
    .map((key) => resource[key])
    .find((item): item is string => typeof item === 'string' && item.trim() !== '')
  return value || (Number.isInteger(resource.id) ? '#' + resource.id : null)
}

export const buildAuditChangeRows = (audit: AuditLog) => {
  const oldValues = isRecord(audit.old_values) ? audit.old_values : {}
  const newValues = isRecord(audit.new_values) ? audit.new_values : {}
  const fields = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])]
  return fields
    .filter((field) => JSON.stringify(normalized(oldValues[field])) !== JSON.stringify(normalized(newValues[field])))
    .map((field) => ({ field, oldValue: oldValues[field], newValue: newValues[field] }))
}

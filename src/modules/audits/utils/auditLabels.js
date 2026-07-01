const eventLabels = Object.freeze({
  created: 'audits.events.created',
  updated: 'audits.events.updated',
  deleted: 'audits.events.deleted',
  restored: 'audits.events.restored',
})

const modelTypeLabels = Object.freeze({
  'App\\Models\\MaintenanceOrder': 'audits.modelTypes.order',
  'App\\Models\\MaintenanceOrderItem': 'audits.modelTypes.orderItem',
  'App\\Models\\MaintenancePlan': 'audits.modelTypes.maintenancePlan',
  'App\\Models\\MaintenanceTask': 'audits.modelTypes.maintenanceTask',
  'App\\Models\\Owner': 'audits.modelTypes.owner',
  'App\\Models\\User': 'audits.modelTypes.user',
  'App\\Models\\Vehicle': 'audits.modelTypes.vehicle',
  'App\\Models\\VehicleSystem': 'audits.modelTypes.vehicleSystem',
  'App\\Models\\Workshop': 'audits.modelTypes.workshop',
})

const fieldLabels = Object.freeze({
  address: 'audits.fields.address',
  advisor_id: 'audits.fields.advisor',
  brand: 'audits.fields.brand',
  cancelled_at: 'audits.fields.cancelled',
  city: 'audits.fields.city',
  closes_at: 'audits.fields.closes',
  code: 'audits.fields.code',
  color: 'audits.fields.color',
  created_at: 'audits.fields.created',
  deleted_at: 'audits.fields.deleted',
  description: 'audits.fields.description',
  document: 'audits.fields.document',
  email: 'audits.fields.email',
  estimated_duration_minutes: 'audits.fields.estimatedDuration',
  finished_at: 'audits.fields.finished',
  is_active: 'audits.fields.active',
  is_reusable: 'audits.fields.reusable',
  license_plate: 'audits.fields.licensePlate',
  manager_id: 'audits.fields.manager',
  maintenance_order_id: 'audits.fields.order',
  maintenance_plan_id: 'audits.fields.plan',
  maintenance_task_id: 'audits.fields.task',
  maintenance_task_ids: 'audits.fields.tasks',
  model: 'audits.fields.model',
  name: 'audits.fields.name',
  odometer: 'audits.fields.odometer',
  opens_at: 'audits.fields.opens',
  owner_id: 'audits.fields.owner',
  password: 'audits.fields.password',
  phone: 'audits.fields.phone',
  recommended_interval_days: 'audits.fields.recommendedDays',
  recommended_interval_kilometers: 'audits.fields.recommendedKilometers',
  role: 'audits.fields.role',
  scheduled_at: 'audits.fields.scheduled',
  started_at: 'audits.fields.started',
  status: 'audits.fields.status',
  technician_id: 'audits.fields.technician',
  technician_ids: 'audits.fields.technicians',
  updated_at: 'audits.fields.updated',
  user_id: 'audits.fields.user',
  vehicle_id: 'audits.fields.vehicle',
  vehicle_system_id: 'audits.fields.vehicleSystem',
  vehicle_system_ids: 'audits.fields.vehicleSystems',
  workshop_id: 'audits.fields.workshop',
})

const roleValueLabels = Object.freeze({
  admin: 'users.roles.admin',
  advisor: 'users.roles.advisor',
  super_admin: 'users.roles.super_admin',
  technician: 'users.roles.technician',
  workshop_manager: 'users.roles.workshop_manager',
})

const statusValueLabels = Object.freeze({
  active: 'users.status.active',
  approved: 'orders.status.approved',
  cancelled: 'orders.status.cancelled',
  completed: 'orders.status.completed',
  created: 'orders.status.created',
  delivered: 'orders.status.delivered',
  in_progress: 'orders.status.in_progress',
  inactive: 'users.status.inactive',
  partially_approved: 'orders.status.partially_approved',
  pending_owner_approval: 'orders.status.pending_owner_approval',
  rejected: 'orders.status.rejected',
  scheduled: 'orders.status.scheduled',
  started: 'maintenanceTasks.status.started',
})

export const eventLabel = (event, translate) => {
  if (eventLabels[event]) {
    return translate(eventLabels[event])
  }

  return String(event)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export const modelTypeLabel = (type, translate) => {
  if (!type) {
    return translate('audits.modelTypes.system')
  }

  return modelTypeLabels[type]
    ? translate(modelTypeLabels[type])
    : type.split('\\').at(-1) ?? type
}

export const auditFieldLabel = (field, translate) => {
  if (fieldLabels[field]) {
    return translate(fieldLabels[field])
  }

  return String(field)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export const eventColor = (event) => {
  if (String(event).includes('deleted')) {
    return 'danger'
  }

  if (String(event).includes('restored') || String(event).includes('created')) {
    return 'success'
  }

  return String(event).includes('updated') ? 'info' : 'neutral'
}

export const displayUrl = (url) => {
  if (!url) {
    return '-'
  }

  try {
    const parsedUrl = new URL(url)

    return `${parsedUrl.pathname}${parsedUrl.search}` || url
  } catch {
    return url
  }
}

export const auditBooleanLabel = (field, value, translate) => {
  if (field === 'is_active') {
    return translate(value ? 'users.status.active' : 'users.status.inactive')
  }

  if (field === 'is_reusable') {
    return translate(
      value
        ? 'maintenanceTasks.labels.reusable'
        : 'maintenanceTasks.labels.vehicleSpecific',
    )
  }

  return translate(value ? 'common.yes' : 'common.no')
}

export const translateAuditStringValue = (field, value, translate) => {
  if (field === 'role' && roleValueLabels[value]) {
    return translate(roleValueLabels[value])
  }

  if (field === 'event' && eventLabels[value]) {
    return translate(eventLabels[value])
  }

  if (field === 'status' && statusValueLabels[value]) {
    return translate(statusValueLabels[value])
  }

  return value
}

export const formatAuditValue = (value, field, translate) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'string') {
    return translateAuditStringValue(field, value, translate)
  }

  if (typeof value === 'boolean') {
    return auditBooleanLabel(field, value, translate)
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return JSON.stringify(value, null, 2)
}

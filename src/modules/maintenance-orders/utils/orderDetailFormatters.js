import {
  mdiCancel,
  mdiCheckCircleOutline,
  mdiClipboardCheckOutline,
  mdiClose,
  mdiPlayCircleOutline,
  mdiTruckDeliveryOutline,
} from '@mdi/js'

export const actionIcon = (status) => {
  const icons = {
    approved: mdiCheckCircleOutline,
    delivered: mdiTruckDeliveryOutline,
    in_progress: mdiPlayCircleOutline,
    completed: mdiClipboardCheckOutline,
    cancelled: mdiCancel,
  }

  return icons[status] ?? mdiClose
}

export const actionColor = (status) =>
  ['approved', 'delivered', 'in_progress', 'completed'].includes(status)
    ? 'success'
    : 'danger'

export const formatOrderDetailDate = (value, locale) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const durationLabel = (value, locale, t) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('orders.units.minutes', {
    value: new Intl.NumberFormat(locale).format(value),
  })
}

export const kilometersLabel = (value, locale, t) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return t('orders.units.kilometers', {
    value: new Intl.NumberFormat(locale).format(value),
  })
}

export const vehicleLabel = (vehicle) =>
  vehicle
    ? [vehicle.license_plate, vehicle.brand, vehicle.model].filter(Boolean).join(' ')
    : '-'

export const userLabel = (user) => user?.name ?? '-'

export const workshopLabel = (workshop, t) =>
  workshop
    ? [workshop.code, workshop.name].filter(Boolean).join(' - ')
    : t('orders.labels.unassigned')

export const taskLabel = (item, t) =>
  [item.maintenance_task?.code, item.maintenance_task?.name].filter(Boolean).join(' - ') ||
  t('orders.labels.taskNumber', { id: item.maintenance_task_id })

export const planLabel = (item) =>
  item.maintenance_plan
    ? [item.maintenance_plan.code, item.maintenance_plan.name].filter(Boolean).join(' - ')
    : '-'

export const systemLabel = (item) => item.maintenance_task?.vehicle_system?.name ?? '-'

export const itemCountLabel = (count, t) =>
  count === 1
    ? t('orders.labels.itemCountOne', { count })
    : t('orders.labels.itemCountMany', { count })

export const orderNumber = (order, t) =>
  t('orders.labels.orderNumber', {
    id: String(order.id).padStart(5, '0'),
  })

export const vehicleLabel = (order, t) =>
  [order.vehicle?.license_plate, order.vehicle?.brand, order.vehicle?.model]
    .filter(Boolean)
    .join(' ') || t('orders.labels.vehicleNumber', { id: order.vehicle_id })

export const userLabel = (user) => user?.name ?? '-'

export const workshopLabel = (workshop, t) =>
  workshop
    ? [workshop.code, workshop.name].filter(Boolean).join(' - ')
    : t('orders.labels.unassigned')

export const itemCountLabel = (items = [], t) =>
  items.length === 1
    ? t('orders.labels.itemCountOne', { count: items.length })
    : t('orders.labels.itemCountMany', { count: items.length })

export const formatOrderDate = (value, locale) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

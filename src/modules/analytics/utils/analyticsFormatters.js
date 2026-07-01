export const formatAnalyticsNumber = (value, locale, fractionDigits = 0) => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return '-'
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
  }).format(parsed)
}

export const formatAnalyticsMinutes = (value, locale, t) =>
  t('analytics.units.minutes', {
    value: formatAnalyticsNumber(value, locale),
  })

export const formatAnalyticsRatio = (value, locale) =>
  value === null || value === undefined ? '-' : formatAnalyticsNumber(value, locale, 3)

export const confidenceColor = (level) => {
  const colors = {
    high: 'success',
    medium: 'warning',
    low: 'danger',
  }

  return colors[level] ?? 'neutral'
}

export const severityColor = (severity) => {
  const colors = {
    high: 'danger',
    medium: 'warning',
    info: 'info',
  }

  return colors[severity] ?? 'neutral'
}

export const priorityColor = (priority) => {
  const colors = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }

  return colors[priority] ?? 'neutral'
}

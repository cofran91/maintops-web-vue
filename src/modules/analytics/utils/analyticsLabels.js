export const humanizeAnalyticsValue = (value) =>
  String(value ?? '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const normalizeAnalyticsCode = (code, prefix = '') => {
  const value = String(code ?? '')

  return prefix && value.startsWith(prefix) ? value.slice(prefix.length) : value
}

export const analyticsTranslationKey = (value) => String(value ?? '').replaceAll('-', '_')

export const scopeLabel = (scope, t) => {
  if (!scope) {
    return t('analytics.scope.unavailable')
  }

  const type = scope.scope ?? scope.type ?? 'global'

  return type === 'workshop' && scope.workshop_id
    ? t('analytics.scope.workshop', { id: scope.workshop_id })
    : t('analytics.scope.global')
}

export const dateRangeLabel = (period, t) => {
  if (!period) {
    return t('common.selectedPeriod')
  }

  return t('analytics.labels.dateRange', {
    end: period.end_date,
    start: period.start_date,
  })
}

export const horizonLabel = (horizon, t) => {
  if (!horizon) {
    return t('common.selectedHorizon')
  }

  return t('analytics.labels.dateRange', {
    end: horizon.end_date,
    start: horizon.start_date,
  })
}

export const translateAnalyticsCode = (namespace, code, t, te, params = {}) => {
  const key = `analytics.${namespace}.${code}`

  return code && te(key) ? t(key, params) : humanizeAnalyticsValue(code)
}

export const translateAnalyticsTitle = (namespace, code, t, te, prefix = '') => {
  const normalized = normalizeAnalyticsCode(code, prefix)
  const key = `analytics.${namespace}.${analyticsTranslationKey(normalized)}`

  return normalized && te(key) ? t(key) : humanizeAnalyticsValue(normalized)
}

export const confidenceLabel = (level, t, te) =>
  translateAnalyticsCode('confidence', level, t, te)

export const statusLabel = (value, t, te) => translateAnalyticsCode('status', value, t, te)

export const algorithmLabel = (algorithm, t, te) =>
  translateAnalyticsTitle('algorithms', algorithm, t, te)

export const alertTitle = (alert, t, te) =>
  translateAnalyticsTitle('alertTitles', alert.id, t, te, 'analytics_alert_')

export const recommendationTitle = (item, t, te) =>
  translateAnalyticsTitle(
    'recommendationTitles',
    item.id,
    t,
    te,
    'analytics_recommendation_',
  )

export const alertExplanation = (alert, t, te) =>
  translateAnalyticsCode('alerts', alert.explanation_code ?? alert.explanation, t, te, alert.facts)

export const recommendationText = (item, t, te) =>
  translateAnalyticsCode(
    'recommendations',
    item.suggested_review_code ?? item.suggested_review,
    t,
    te,
    item.facts,
  )

export const confidenceText = (forecast, t, te) => {
  const reasonCodes = forecast.confidence.reason_codes ?? forecast.confidence.reasons ?? []
  const translatedReasons = reasonCodes.map((reason) =>
    translateAnalyticsCode('confidenceReasons', reason, t, te, forecast),
  )

  return translatedReasons.join(' ') || t('analytics.confidence.limited')
}

const optionalUrl = (value) => {
  const normalized = String(value ?? '').trim().replace(/\/+$/, '')

  return normalized === '' ? null : normalized
}

export const integrations = Object.freeze({
  realtimeUrl: optionalUrl(import.meta.env.VITE_REALTIME_URL),
  analyticsBaseUrl: optionalUrl(import.meta.env.VITE_ANALYTICS_BASE_URL),
})

export const isRealtimeEnabled = integrations.realtimeUrl !== null
export const isAnalyticsEnabled = integrations.analyticsBaseUrl !== null

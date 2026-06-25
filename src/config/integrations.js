const optionalUrl = (value) => {
  const normalized = String(value ?? '').trim().replace(/\/+$/, '')

  return normalized === '' ? null : normalized
}

export const integrations = Object.freeze({
  realtimeUrl: optionalUrl(import.meta.env.VITE_REALTIME_URL),
})

export const isRealtimeEnabled = integrations.realtimeUrl !== null

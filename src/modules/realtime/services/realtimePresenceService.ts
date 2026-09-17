import { computed, readonly, ref } from 'vue'
import type { PresenceStatus, PresenceUpdate } from '@/types/realtime'

const PRESENCE_TTL_MS = 90_000
const CLEANUP_INTERVAL_MS = 30_000

interface PresenceRecord extends PresenceUpdate {
  expiresAt: number
}

const presenceByUserId = ref<Record<string, PresenceRecord>>({})
let cleanupTimer: ReturnType<typeof setInterval> | null = null

const stopCleanupTimer = () => {
  if (cleanupTimer !== null) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

const pruneExpiredPresence = () => {
  const now = Date.now()
  const activeEntries = Object.entries(presenceByUserId.value)
    .filter(([, presence]) => presence.expiresAt > now)

  presenceByUserId.value = Object.fromEntries(activeEntries)

  if (activeEntries.length === 0) stopCleanupTimer()
}

const ensureCleanupTimer = () => {
  if (cleanupTimer === null) cleanupTimer = setInterval(pruneExpiredPresence, CLEANUP_INTERVAL_MS)
}

export const recordPresenceUpdate = (update: PresenceUpdate) => {
  pruneExpiredPresence()

  if (update.status === 'offline') {
    const next = { ...presenceByUserId.value }
    delete next[update.user_id]
    presenceByUserId.value = next
    return
  }

  presenceByUserId.value = {
    ...presenceByUserId.value,
    [update.user_id]: { ...update, expiresAt: Date.now() + PRESENCE_TTL_MS },
  }
  ensureCleanupTimer()
}

export const isUserPresent = (userId?: string | number | null) => {
  if (userId === null || userId === undefined) return false
  const presence = presenceByUserId.value[String(userId)]
  return presence?.status === 'online' && presence.expiresAt > Date.now()
}

export const presenceForUser = (userId?: string | number | null) => {
  if (userId === null || userId === undefined) return null
  return presenceByUserId.value[String(userId)] ?? null
}

export const clearRealtimePresence = () => {
  presenceByUserId.value = {}
  stopCleanupTimer()
}

export const useRealtimePresence = () => ({
  presenceByUserId: readonly(computed(() => presenceByUserId.value)),
  onlineUserIds: readonly(computed(() => Object.keys(presenceByUserId.value))),
  isUserPresent,
  presenceForUser,
})

export const presenceStatusLabel = (status?: PresenceStatus | null) =>
  status === 'online' ? 'En línea' : 'Sin conexión'

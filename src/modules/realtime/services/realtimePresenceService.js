import { computed, readonly, ref } from 'vue'

const PRESENCE_TTL_MS = 90 * 1000
const CLEANUP_INTERVAL_MS = 30 * 1000

const presenceByUserId = ref({})
let cleanupTimer = null

export const recordPresenceUpdate = (update) => {
  pruneExpiredPresence()

  if (update.status === 'offline') {
    const remainingPresence = { ...presenceByUserId.value }

    delete remainingPresence[update.user_id]

    presenceByUserId.value = remainingPresence
    stopCleanupTimerIfIdle()
    return
  }

  presenceByUserId.value = {
    ...presenceByUserId.value,
    [update.user_id]: {
      ...update,
      expiresAt: Date.now() + PRESENCE_TTL_MS,
    },
  }
  ensureCleanupTimer()
}

export const isUserPresent = (userId) => {
  if (userId === null || userId === undefined) {
    return false
  }

  const presence = presenceByUserId.value[String(userId)]

  return presence?.status === 'online' && presence.expiresAt > Date.now()
}

export const clearRealtimePresence = () => {
  presenceByUserId.value = {}
  stopCleanupTimer()
}

export const useRealtimePresence = () => ({
  presenceByUserId: readonly(computed(() => presenceByUserId.value)),
  onlineUserIds: readonly(computed(() => Object.keys(presenceByUserId.value))),
  isUserPresent,
})

const pruneExpiredPresence = () => {
  const now = Date.now()

  presenceByUserId.value = Object.fromEntries(
    Object.entries(presenceByUserId.value)
      .filter(([, presence]) => presence.expiresAt > now),
  )
  stopCleanupTimerIfIdle()
}

const ensureCleanupTimer = () => {
  if (cleanupTimer !== null) {
    return
  }

  cleanupTimer = setInterval(pruneExpiredPresence, CLEANUP_INTERVAL_MS)
}

const stopCleanupTimerIfIdle = () => {
  if (Object.keys(presenceByUserId.value).length > 0) {
    return
  }

  stopCleanupTimer()
}

const stopCleanupTimer = () => {
  if (cleanupTimer === null) {
    return
  }

  clearInterval(cleanupTimer)
  cleanupTimer = null
}

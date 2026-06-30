import { reactive, readonly } from 'vue'
import { io } from 'socket.io-client'
import { integrations } from '@/config/integrations.js'
import { normalizeApiError } from '@/api/errors.js'
import {
  recordOperationalActivity,
} from '@/modules/realtime/services/liveActivityService.js'
import {
  parseOperationalEvent,
  publishOperationalEvent,
} from '@/modules/realtime/services/operationalEventsService.js'
import { recordPresenceUpdate } from '@/modules/realtime/services/realtimePresenceService.js'
import realtimeTokenApi from '@/modules/realtime/services/realtimeTokenService.js'
import { t } from '@/i18n/index.js'

const MINIMUM_RENEWAL_LEAD_MS = 5 * 1000
const MAXIMUM_RENEWAL_LEAD_MS = 30 * 1000
const RETRY_BASE_DELAY_MS = 2 * 1000
const RETRY_MAX_DELAY_MS = 30 * 1000
const PRESENCE_HEARTBEAT_MS = 30 * 1000

const state = reactive({
  status: integrations.realtimeUrl === null ? 'disabled' : 'disconnected',
  errorMessage: null,
})

const parsePresenceUpdate = (payload) => {
  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  const updatePayload =
    payload.event_type === 'presence.updated' &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : payload
  const userId = updatePayload.user_id
  const workshopId = updatePayload.workshop_id
  const status =
    updatePayload.status ??
    (typeof updatePayload.online === 'boolean'
      ? (updatePayload.online ? 'online' : 'offline')
      : null)

  if (
    (typeof userId !== 'string' && typeof userId !== 'number') ||
    (workshopId !== undefined &&
      typeof workshopId !== 'string' &&
      typeof workshopId !== 'number') ||
    (status !== 'online' && status !== 'offline')
  ) {
    return null
  }

  return {
    user_id: String(userId),
    ...(workshopId === undefined ? {} : { workshop_id: String(workshopId) }),
    status,
  }
}

const errorMessage = (error) => {
  const apiError = normalizeApiError(error)

  return apiError.message || t('realtime.errors.connectionFailed')
}

class RealtimeClient {
  socket = null
  renewalTimer = null
  heartbeatTimer = null
  active = false
  sessionId = 0
  consecutiveFailures = 0

  start() {
    if (integrations.realtimeUrl === null) {
      state.status = 'disabled'
      return
    }

    if (this.active) {
      return
    }

    this.active = true
    this.sessionId += 1
    this.consecutiveFailures = 0
    state.status = 'connecting'
    state.errorMessage = null

    void this.refreshToken(this.sessionId)
  }

  stop() {
    this.active = false
    this.sessionId += 1
    this.consecutiveFailures = 0
    this.clearRenewalTimer()
    this.clearHeartbeatTimer()
    this.disposeSocket()
    state.status = integrations.realtimeUrl === null ? 'disabled' : 'disconnected'
    state.errorMessage = null
  }

  async refreshToken(sessionId) {
    if (!this.isCurrentSession(sessionId)) {
      return
    }

    state.status = 'connecting'

    try {
      const realtimeToken = await realtimeTokenApi.issue()

      if (!this.isCurrentSession(sessionId)) {
        return
      }

      this.consecutiveFailures = 0
      this.connectWithToken(realtimeToken)
      this.scheduleRenewal(realtimeToken, sessionId)
    } catch (error) {
      if (!this.isCurrentSession(sessionId)) {
        return
      }

      this.handleFailure(error, sessionId)
    }
  }

  connectWithToken(realtimeToken) {
    const socket = this.getOrCreateSocket()

    socket.auth = { token: realtimeToken.token }

    if (socket.connected) {
      socket.disconnect()
    }

    socket.connect()
  }

  getOrCreateSocket() {
    if (this.socket !== null) {
      return this.socket
    }

    const realtimeUrl = integrations.realtimeUrl

    if (realtimeUrl === null) {
      throw new Error(t('realtime.errors.notConfigured'))
    }

    const socket = io(realtimeUrl, {
      autoConnect: false,
      reconnection: false,
    })

    socket.on('connect', () => {
      if (!this.isCurrentSocket(socket)) {
        return
      }

      this.consecutiveFailures = 0
      state.status = 'connected'
      state.errorMessage = null
      this.startHeartbeat(socket)
    })

    socket.on('connect_error', (error) => {
      if (!this.isCurrentSocket(socket)) {
        return
      }

      this.clearHeartbeatTimer()
      this.handleFailure(error, this.sessionId)
    })

    socket.on('disconnect', (reason) => {
      if (!this.isCurrentSocket(socket) || !this.active) {
        return
      }

      this.clearHeartbeatTimer()

      if (reason === 'io client disconnect') {
        return
      }

      this.handleFailure(new Error(t('realtime.errors.disconnected', { reason })), this.sessionId)
    })

    socket.on('presence.updated', (payload) => {
      if (!this.isCurrentSocket(socket)) {
        return
      }

      const update = parsePresenceUpdate(payload)

      if (update !== null) {
        recordPresenceUpdate(update)
      }
    })

    socket.onAny((eventName, payload) => {
      if (!this.isCurrentSocket(socket)) {
        return
      }

      const event = parseOperationalEvent(eventName, payload)

      if (event !== null && publishOperationalEvent(event)) {
        recordOperationalActivity(event)
      }
    })

    this.socket = socket

    return socket
  }

  scheduleRenewal(realtimeToken, sessionId) {
    const expiresAt = Date.parse(realtimeToken.expires_at)
    const remaining = Number.isFinite(expiresAt)
      ? expiresAt - Date.now()
      : Number(realtimeToken.expires_in ?? 0) * 1000

    if (remaining <= 0) {
      this.handleFailure(new Error(t('realtime.errors.tokenInvalidExpiration')), sessionId)
      return
    }

    const renewalLead = Math.min(
      MAXIMUM_RENEWAL_LEAD_MS,
      Math.max(MINIMUM_RENEWAL_LEAD_MS, Math.floor(remaining / 4)),
    )
    const delay = Math.max(0, remaining - renewalLead)

    this.scheduleRenewalTimer(delay, () => {
      void this.refreshToken(sessionId)
    })
  }

  handleFailure(error, sessionId) {
    if (!this.isCurrentSession(sessionId)) {
      return
    }

    this.consecutiveFailures += 1
    state.status = 'error'
    state.errorMessage = errorMessage(error)

    const delay = Math.min(
      RETRY_MAX_DELAY_MS,
      RETRY_BASE_DELAY_MS * (2 ** (this.consecutiveFailures - 1)),
    )

    this.scheduleRenewalTimer(delay, () => {
      void this.refreshToken(sessionId)
    })
  }

  startHeartbeat(socket) {
    this.clearHeartbeatTimer()
    socket.emit('presence.heartbeat')

    this.heartbeatTimer = setInterval(() => {
      if (this.isCurrentSocket(socket) && socket.connected) {
        socket.emit('presence.heartbeat')
      }
    }, PRESENCE_HEARTBEAT_MS)
  }

  scheduleRenewalTimer(delay, callback) {
    this.clearRenewalTimer()
    this.renewalTimer = setTimeout(callback, delay)
  }

  clearRenewalTimer() {
    if (this.renewalTimer === null) {
      return
    }

    clearTimeout(this.renewalTimer)
    this.renewalTimer = null
  }

  clearHeartbeatTimer() {
    if (this.heartbeatTimer === null) {
      return
    }

    clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  disposeSocket() {
    if (this.socket === null) {
      return
    }

    this.socket.removeAllListeners()
    this.socket.disconnect()
    this.socket = null
  }

  isCurrentSession(sessionId) {
    return this.active && this.sessionId === sessionId
  }

  isCurrentSocket(socket) {
    return this.active && this.socket === socket
  }
}

const realtimeClient = new RealtimeClient()

export const startRealtime = () => {
  realtimeClient.start()
}

export const stopRealtime = () => {
  realtimeClient.stop()
}

export const useRealtimeConnection = () => readonly(state)

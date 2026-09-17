import { reactive, readonly } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { normalizeApiError } from '@/api/errors'
import { integrations } from '@/config/integrations'
import realtimeTokenApi from '@/modules/realtime/services/realtimeTokenService'
import {
  parseOperationalEvent,
  publishOperationalEvent,
} from '@/modules/realtime/services/operationalEventsService'
import type { RealtimeConnectionStatus, RealtimeToken } from '@/types/realtime'

const RETRY_DELAY_MS = 5000
const MINIMUM_RENEWAL_LEAD_MS = 5000
const MAXIMUM_RENEWAL_LEAD_MS = 30000

const state = reactive<{
  status: RealtimeConnectionStatus
  errorMessage: string | null
}>({
  status: integrations.realtimeUrl === null ? 'disabled' : 'disconnected',
  errorMessage: null,
})

class RealtimeClient {
  private socket: Socket | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private renewalTimer: ReturnType<typeof setTimeout> | null = null
  private active = false
  private sessionId = 0

  start() {
    if (!integrations.realtimeUrl) {
      state.status = 'disabled'
      return
    }

    if (this.active) {
      return
    }

    this.active = true
    this.sessionId += 1
    state.status = 'connecting'
    state.errorMessage = null
    void this.connect(this.sessionId)
  }

  stop() {
    this.active = false
    this.sessionId += 1
    this.clearTimer('retryTimer')
    this.clearTimer('renewalTimer')
    this.socket?.removeAllListeners()
    this.socket?.disconnect()
    this.socket = null
    state.status = integrations.realtimeUrl === null ? 'disabled' : 'disconnected'
    state.errorMessage = null
  }

  private async connect(sessionId: number) {
    try {
      const token = await realtimeTokenApi.issue()

      if (!this.isCurrentSession(sessionId)) {
        return
      }

      this.connectSocket(token, sessionId)
      this.scheduleRenewal(token, sessionId)
    } catch (error) {
      this.handleFailure(error, sessionId)
    }
  }

  private connectSocket(token: RealtimeToken, sessionId: number) {
    const socket = this.getSocket()
    socket.auth = { token: token.token }

    if (socket.connected) {
      socket.disconnect()
    }

    state.status = 'connecting'
    socket.connect()

    if (!this.isCurrentSession(sessionId)) {
      socket.disconnect()
    }
  }

  private getSocket() {
    if (this.socket) {
      return this.socket
    }

    if (!integrations.realtimeUrl) {
      throw new Error('Realtime is not configured.')
    }

    const socket = io(integrations.realtimeUrl, {
      autoConnect: false,
      reconnection: false,
    })

    socket.on('connect', () => {
      if (this.socket === socket && this.active) {
        state.status = 'connected'
        state.errorMessage = null
      }
    })

    socket.on('connect_error', (error) => {
      if (this.socket === socket && this.active) {
        this.handleFailure(error, this.sessionId)
      }
    })

    socket.on('disconnect', (reason) => {
      if (this.socket === socket && this.active && reason !== 'io client disconnect') {
        this.handleFailure(new Error(`Realtime disconnected: ${reason}`), this.sessionId)
      }
    })

    socket.onAny((eventName, payload) => {
      if (this.socket !== socket || !this.active) {
        return
      }

      const event = parseOperationalEvent(eventName, payload)

      if (event) {
        publishOperationalEvent(event)
      }
    })

    this.socket = socket

    return socket
  }

  private handleFailure(error: unknown, sessionId: number) {
    if (!this.isCurrentSession(sessionId)) {
      return
    }

    state.status = 'error'
    state.errorMessage = normalizeApiError(error).message
    this.clearTimer('retryTimer')
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      state.status = 'connecting'
      void this.connect(sessionId)
    }, RETRY_DELAY_MS)
  }

  private scheduleRenewal(token: RealtimeToken, sessionId: number) {
    const expiresAt = Date.parse(token.expires_at)
    const remaining = Number.isFinite(expiresAt)
      ? expiresAt - Date.now()
      : Number(token.expires_in ?? 0) * 1000

    if (remaining <= 0) {
      this.handleFailure(new Error('Realtime token has expired.'), sessionId)
      return
    }

    const renewalLead = Math.min(
      MAXIMUM_RENEWAL_LEAD_MS,
      Math.max(MINIMUM_RENEWAL_LEAD_MS, Math.floor(remaining / 4)),
    )

    this.clearTimer('renewalTimer')
    this.renewalTimer = setTimeout(() => {
      this.renewalTimer = null
      void this.connect(sessionId)
    }, Math.max(0, remaining - renewalLead))
  }

  private clearTimer(timerName: 'retryTimer' | 'renewalTimer') {
    const timer = this[timerName]

    if (timer !== null) {
      clearTimeout(timer)
      this[timerName] = null
    }
  }

  private isCurrentSession(sessionId: number) {
    return this.active && this.sessionId === sessionId
  }
}

const realtimeClient = new RealtimeClient()

export const startRealtime = () => realtimeClient.start()
export const stopRealtime = () => realtimeClient.stop()
export const useRealtimeConnection = () => readonly(state)

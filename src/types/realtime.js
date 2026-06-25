/**
 * @typedef {'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error'} RealtimeConnectionStatus
 */

/**
 * @typedef {Object} RealtimeToken
 * @property {'realtime'} audience
 * @property {string} token
 * @property {string} token_type
 * @property {number} expires_in
 * @property {string} expires_at
 */

/**
 * @typedef {Object} RealtimePresenceUpdate
 * @property {string} user_id
 * @property {string} [workshop_id]
 * @property {'online' | 'offline'} status
 */

export const REALTIME_CONNECTION_STATUSES = Object.freeze({
  DISABLED: 'disabled',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
})

export const AUDIT_EVENTS = Object.freeze([
  'created',
  'updated',
  'deleted',
  'restored',
])

/**
 * @typedef {'created' | 'updated' | 'deleted' | 'restored' | string} AuditEvent
 */

/**
 * @typedef {Object} AuditActor
 * @property {string | null} type
 * @property {number | null} id
 * @property {unknown} [resource]
 */

/**
 * @typedef {Object} AuditResource
 * @property {string} type
 * @property {number} id
 * @property {unknown} [resource]
 */

/**
 * @typedef {Record<string, unknown> | unknown[] | null} AuditValues
 */

/**
 * @typedef {Object} AuditLog
 * @property {number} id
 * @property {AuditEvent} event
 * @property {AuditActor} actor
 * @property {AuditResource} auditable
 * @property {AuditValues} old_values
 * @property {AuditValues} new_values
 * @property {string | null} url
 * @property {string | null} ip_address
 * @property {string | null} user_agent
 * @property {string | null} tags
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

export const EMPTY_AUDIT_LOG = Object.freeze({
  id: null,
  event: '',
  actor: {
    type: null,
    id: null,
    resource: null,
  },
  auditable: {
    type: '',
    id: null,
    resource: null,
  },
  old_values: null,
  new_values: null,
  url: null,
  ip_address: null,
  user_agent: null,
  tags: null,
  created_at: null,
  updated_at: null,
})

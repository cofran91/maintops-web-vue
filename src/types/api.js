/**
 * @typedef {string | number} EntityId
 */

/**
 * @typedef {string | number | boolean | null | undefined} QueryFilterValue
 */

/**
 * @typedef {QueryFilterValue | QueryFilterValue[]} QueryFilter
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {*} [data]
 * @property {Record<string, *>} [meta]
 * @property {Record<string, string[]>} [errors]
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} current_page
 * @property {number} last_page
 * @property {number} per_page
 * @property {number} total
 * @property {number | null} from
 * @property {number | null} to
 */

/**
 * @typedef {Object} PaginatedData
 * @property {Array<*>} items
 * @property {PaginationMeta} pagination
 */

/**
 * @typedef {Object} IndexQueryParams
 * @property {string} [search]
 * @property {Record<string, QueryFilter>} [filters]
 * @property {number} [page]
 * @property {number} [per_page]
 */

export const DEFAULT_PAGINATION_META = Object.freeze({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
})

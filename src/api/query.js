import { DEFAULT_PAGINATION_META } from '@/types/api.js'

const normalizeQueryValue = (value) => {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return value.map(normalizeQueryValue)
  }

  return value
}

export const buildIndexParams = (params = {}) => {
  const { filters, page, per_page, search } = params
  const queryParams = {}

  if (search !== undefined && search !== '') {
    queryParams.search = search
  }

  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams[key] = normalizeQueryValue(value)
    }
  })

  if (page !== undefined) {
    queryParams.page = page
  }

  if (per_page !== undefined) {
    queryParams.per_page = per_page
  }

  return queryParams
}

export const normalizePaginationMeta = (pagination = {}) => ({
  ...DEFAULT_PAGINATION_META,
  ...pagination,
})

export const normalizePaginatedData = (payload = {}) => ({
  items: Array.isArray(payload.items) ? payload.items : [],
  pagination: normalizePaginationMeta(payload.pagination),
})

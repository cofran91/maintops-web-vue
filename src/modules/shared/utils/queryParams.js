import { DEFAULT_PAGINATION_META } from '@/types/api.js'

export const getStringQuery = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return typeof value === 'string' ? value : ''
}

export const getBooleanQuery = (value) => {
  const stringValue = getStringQuery(value)

  return stringValue === 'true' || stringValue === '1'
}

export const getNumberQuery = (value, fallback) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : fallback
}

export const getPositiveNumberQuery = (value) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : null
}

export const buildListQuery = (
  nextFilters,
  page,
  perPage,
  defaultPerPage = DEFAULT_PAGINATION_META.per_page,
) => {
  const query = {}

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        query[key] = 'true'
      }

      return
    }

    if (value !== '') {
      query[key] = String(value)
    }
  })

  if (page > 1) {
    query.page = String(page)
  }

  if (perPage !== defaultPerPage) {
    query.per_page = String(perPage)
  }

  return query
}

export const syncQueryFilters = (filters, query, emptyFilters) => {
  Object.entries(emptyFilters).forEach(([key, emptyValue]) => {
    filters[key] =
      typeof emptyValue === 'boolean'
        ? getBooleanQuery(query[key])
        : getStringQuery(query[key])
  })
}

import type { LocationQuery, LocationQueryRaw } from 'vue-router'

type FilterValue = string | number | boolean | null | undefined

export const getStringQuery = (value: unknown) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return typeof value === 'string' ? value : ''
}

export const getBooleanQuery = (value: unknown) => {
  const stringValue = getStringQuery(value)

  return stringValue === 'true' || stringValue === '1'
}

export const getNumberQuery = (value: unknown, fallback: number) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : fallback
}

export const getPositiveNumberQuery = (value: unknown) => {
  const number = Number(getStringQuery(value))

  return Number.isInteger(number) && number > 0 ? number : null
}

export const buildListQuery = (
  nextFilters: object,
  page: number,
  perPage: number,
  defaultPerPage = 15,
): LocationQueryRaw => {
  const query: LocationQueryRaw = {}

  Object.entries(nextFilters).forEach(([key, value]) => {
    const filterValue = value as FilterValue

    if (typeof filterValue === 'boolean') {
      if (filterValue) {
        query[key] = 'true'
      }

      return
    }

    if (filterValue !== '' && filterValue !== null && filterValue !== undefined) {
      query[key] = String(filterValue)
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

export const syncQueryFilters = (
  filters: object,
  query: LocationQuery,
  emptyFilters: object,
) => {
  Object.entries(emptyFilters).forEach(([key, emptyValue]) => {
    const filterRecord = filters as Record<string, FilterValue>

    filterRecord[key] =
      typeof emptyValue === 'boolean' ? getBooleanQuery(query[key]) : getStringQuery(query[key])
  })
}

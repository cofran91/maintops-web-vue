export const emptyFallback = (value, fallback = '-') =>
  value === null || value === undefined || value === '' ? fallback : value

export const formatDate = (
  value,
  locale,
  options = { dateStyle: 'medium' },
  fallback = '-',
) => {
  if (!value) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

export const formatNumber = (value, locale, fallback = '-') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return new Intl.NumberFormat(locale).format(value)
}

export const formatTranslatedUnit = (value, locale, translate, key, fallback = '-') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return translate(key, {
    value: formatNumber(value, locale, fallback),
  })
}

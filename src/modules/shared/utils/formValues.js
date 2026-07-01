export const nullableText = (value) => {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue === '' ? null : trimmedValue
}

export const nullableNumber = (value) => {
  if (value === '' || value === null || value === undefined || Number.isNaN(Number(value))) {
    return null
  }

  return Number(value)
}

export const nullableInteger = (value) => {
  const number = nullableNumber(value)

  return Number.isInteger(number) ? number : null
}

export const nullableId = (value) => {
  const number = nullableInteger(value)

  return number !== null && number > 0 ? number : null
}

export const hasPositiveInteger = (value) => {
  const number = Number(value)

  return Number.isInteger(number) && number > 0
}

export const firstFieldError = (errors, field) => {
  if (errors[field]?.[0]) {
    return errors[field][0]
  }

  const nestedField = `${field}.`
  const nestedError = Object.entries(errors).find(([key]) => key.startsWith(nestedField))?.[1]?.[0]

  return nestedError ?? ''
}

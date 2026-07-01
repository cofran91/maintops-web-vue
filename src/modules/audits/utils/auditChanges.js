export const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export const extractResourceLabel = (resource) => {
  if (!isRecord(resource)) {
    return null
  }

  const stringKeys = ['name', 'email', 'code', 'license_plate', 'title']
  const value = stringKeys.map((key) => resource[key]).find((item) => typeof item === 'string')

  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }

  return Number.isInteger(resource.id) ? `#${resource.id}` : null
}

const auditValuesToRecord = (values) => (isRecord(values) ? values : {})

const normalizeAuditValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeAuditValue)
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeAuditValue(value[key])]),
    )
  }

  return value
}

const auditValuesAreEqual = (first, second) =>
  JSON.stringify(normalizeAuditValue(first)) === JSON.stringify(normalizeAuditValue(second))

export const buildAuditChangeRows = (audit) => {
  const oldValues = auditValuesToRecord(audit.old_values)
  const newValues = auditValuesToRecord(audit.new_values)
  const fields = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])]

  return fields.reduce((changes, field) => {
    const oldValue = oldValues[field]
    const newValue = newValues[field]

    if (auditValuesAreEqual(oldValue, newValue)) {
      return changes
    }

    changes.push({
      field,
      oldValue,
      newValue,
    })

    return changes
  }, [])
}

export const changesLabel = (audit, translate) => {
  const changes = buildAuditChangeRows(audit).length

  if (changes === 0) {
    return '-'
  }

  return changes === 1
    ? translate('audits.labels.fieldCountOne', { count: changes })
    : translate('audits.labels.fieldCountMany', { count: changes })
}

export const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const fileNameFromContentDisposition = (header) => {
  const value = Array.isArray(header) ? header[0] : header

  if (typeof value !== 'string') {
    return null
  }

  const encodedMatch = value.match(/filename\*=UTF-8''([^;]+)/i)

  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1])
  }

  const plainMatch = value.match(/filename="?([^";]+)"?/i)

  return plainMatch?.[1] ?? null
}

const downloadBlob = (blob, fileName) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const downloadBlobResponse = (
  response,
  fallbackFileName,
  mimeType = XLSX_MIME_TYPE,
) => {
  if (typeof Blob === 'undefined') {
    return
  }

  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: mimeType })
  const fileName =
    fileNameFromContentDisposition(response.headers['content-disposition']) ?? fallbackFileName

  downloadBlob(blob, fileName)
}

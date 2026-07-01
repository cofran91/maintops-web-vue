import http, { unwrapApiData } from '@/api/http.js'
import { buildIndexParams, normalizePaginatedData } from '@/api/query.js'

const DEFAULT_METHODS = Object.freeze(['index', 'show', 'create', 'update', 'remove'])

const resolveMessage = (message) => (typeof message === 'function' ? message() : message)

const fallbackMessage = (messages, ...keys) => {
  const key = keys.find((currentKey) => messages[currentKey] !== undefined)

  return key ? resolveMessage(messages[key]) : undefined
}

const resourceUrl = (endpoint, id) => `${endpoint}/${id}`

export const createResourceService = ({
  endpoint,
  messages = {},
  methods = DEFAULT_METHODS,
  httpClient = http,
  indexParamsBuilder = buildIndexParams,
  indexNormalizer = normalizePaginatedData,
}) => {
  if (!endpoint) {
    throw new Error('A resource service endpoint is required.')
  }

  const enabledMethods = new Set(methods)
  const service = {}

  if (enabledMethods.has('index')) {
    service.index = async (params = {}) => {
      const response = await httpClient.get(endpoint, {
        params: indexParamsBuilder(params),
      })
      const data = unwrapApiData(response.data, fallbackMessage(messages, 'index', 'load'))

      return indexNormalizer(data)
    }
  }

  if (enabledMethods.has('show')) {
    service.show = async (id) => {
      const response = await httpClient.get(resourceUrl(endpoint, id))

      return unwrapApiData(response.data, fallbackMessage(messages, 'show'))
    }
  }

  if (enabledMethods.has('create')) {
    service.create = async (payload) => {
      const response = await httpClient.post(endpoint, payload)

      return unwrapApiData(response.data, fallbackMessage(messages, 'create'))
    }
  }

  if (enabledMethods.has('update')) {
    service.update = async (id, payload) => {
      const response = await httpClient.patch(resourceUrl(endpoint, id), payload)

      return unwrapApiData(response.data, fallbackMessage(messages, 'update'))
    }
  }

  if (enabledMethods.has('remove')) {
    service.remove = async (id) => {
      await httpClient.delete(resourceUrl(endpoint, id))
    }
  }

  return service
}

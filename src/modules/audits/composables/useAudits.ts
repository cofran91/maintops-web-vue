import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import { useFilterAutoApply } from '@/modules/shared/composables/useFilterAutoApply'
import auditsApi from '@/modules/audits/services/auditsService'
import type { AuditFilters, AuditLog, AuditPage } from '@/types/audit'

const DEFAULT_PER_PAGE = 15
const DEFAULT_PAGINATION: AuditPage['pagination'] = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null,
  to: null,
}

const isCanceled = (error: unknown) => {
  if (!error || typeof error !== 'object') return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || ['AbortError', 'CanceledError'].includes(requestError.name ?? '')
}

export const useAudits = () => {
  const audits = ref<AuditLog[]>([])
  const filters = reactive<AuditFilters>({
    search: '',
    event: '',
    user_id: '',
    url: '',
    tags: '',
    created_from: '',
    created_to: '',
  })
  const pagination = ref<AuditPage['pagination']>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchAudits = async (page = pagination.value.current_page) => {
    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const data = await auditsApi.index({ ...filters, page, per_page: perPage.value }, { signal: nextController.signal })
      audits.value = data.items
      pagination.value = data.pagination
      perPage.value = data.pagination.per_page
    } catch (error) {
      if (!isCanceled(error)) errorMessage.value = normalizeApiError(error).message
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const applyFilters = () => {
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchAudits(1)
  }

  useFilterAutoApply(filters, applyFilters, { immediateKeys: ['event', 'user_id', 'created_from', 'created_to'] })

  const clearFilters = () => {
    Object.assign(filters, {
      search: '',
      event: '',
      user_id: '',
      url: '',
      tags: '',
      created_from: '',
      created_to: '',
    })
    applyFilters()
  }

  const updatePage = (page: number) => void fetchAudits(page)
  const updatePerPage = (value: number) => {
    perPage.value = Number(value)
    void fetchAudits(1)
  }

  onMounted(() => void fetchAudits(1))
  onBeforeUnmount(() => controller?.abort())

  return { audits, filters, pagination, perPage, loading, errorMessage, fetchAudits, applyFilters, clearFilters, updatePage, updatePerPage }
}

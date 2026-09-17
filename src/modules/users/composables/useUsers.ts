import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import usersApi from '@/modules/users/services/usersService'
import type { User, UserFilters, UserPage } from '@/types/user'

const DEFAULT_PER_PAGE = 15

const DEFAULT_PAGINATION = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  from: null,
  to: null,
}

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const requestError = error as { code?: string; name?: string }

  return (
    requestError.code === 'ERR_CANCELED' ||
    requestError.name === 'AbortError' ||
    requestError.name === 'CanceledError'
  )
}

export const useUsers = () => {
  const users = ref<User[]>([])
  const filters = reactive<UserFilters>({
    search: '',
    role: '',
    status: '',
  })
  const pagination = ref<UserPage['pagination']>({ ...DEFAULT_PAGINATION })
  const perPage = ref(DEFAULT_PER_PAGE)
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchUsers = async (page = pagination.value.current_page) => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const data: UserPage = await usersApi.index({
        search: filters.search.trim(),
        role: filters.role,
        status: filters.status,
        page,
        per_page: perPage.value,
      }, { signal: nextController.signal })

      users.value = data.items
      pagination.value = data.pagination
      perPage.value = data.pagination.per_page
    } catch (error) {
      if (!isCanceledRequest(error)) {
        errorMessage.value = normalizeApiError(error).message
      }
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const applyFilters = () => {
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchUsers(1)
  }

  const clearFilters = () => {
    filters.search = ''
    filters.role = ''
    filters.status = ''
    applyFilters()
  }

  const updatePage = (page: number) => {
    void fetchUsers(page)
  }

  const updatePerPage = (value: number) => {
    perPage.value = Number(value)
    pagination.value = { ...pagination.value, current_page: 1 }
    void fetchUsers(1)
  }

  onMounted(() => {
    void fetchUsers(1)
  })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    users,
    filters,
    pagination,
    perPage,
    loading,
    errorMessage,
    fetchUsers,
    applyFilters,
    clearFilters,
    updatePage,
    updatePerPage,
  }
}

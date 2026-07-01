import { computed, onBeforeUnmount, ref } from 'vue'
import { normalizeApiError } from '@/api/errors.js'
import { ROLES } from '@/types/auth.js'
import usersApi from '@/modules/users/services/usersService.js'

const USER_PAGE_SIZE = 10

const mergeUsers = (users) => {
  const userMap = new Map()

  users.forEach((user) => {
    if (user?.id !== undefined && user?.id !== null) {
      userMap.set(Number(user.id), user)
    }
  })

  return Array.from(userMap.values())
}

export function useWorkshopTechnicians() {
  const technicianOptions = ref([])
  const selectedTechnicians = ref([])
  const technicianSearch = ref('')
  const technicianLoading = ref(false)
  const technicianError = ref('')
  const technicianPage = ref(1)
  const technicianLastPage = ref(1)
  const technicianSelectOpen = ref(false)

  let technicianSearchTimeout
  let technicianRequestId = 0

  const hasMoreTechnicians = computed(
    () => technicianPage.value < technicianLastPage.value,
  )

  const fetchTechnicians = async ({ reset = false } = {}) => {
    if (technicianLoading.value && !reset) {
      return
    }

    if (!reset && !hasMoreTechnicians.value) {
      return
    }

    const currentRequestId = ++technicianRequestId
    const nextPage = reset ? 1 : technicianPage.value + 1

    technicianLoading.value = true
    technicianError.value = ''

    try {
      const data = await usersApi.index({
        search: technicianSearch.value || undefined,
        filters: {
          role: ROLES.TECHNICIAN,
          is_active: true,
          without_workshop: true,
        },
        page: nextPage,
        per_page: USER_PAGE_SIZE,
      })

      if (currentRequestId !== technicianRequestId) {
        return
      }

      technicianOptions.value = reset
        ? mergeUsers([...selectedTechnicians.value, ...data.items])
        : mergeUsers([...technicianOptions.value, ...data.items])
      technicianPage.value = data.pagination.current_page
      technicianLastPage.value = data.pagination.last_page
    } catch (error) {
      if (currentRequestId === technicianRequestId) {
        technicianError.value = normalizeApiError(error).message
      }
    } finally {
      if (currentRequestId === technicianRequestId) {
        technicianLoading.value = false
      }
    }
  }

  const resetTechnicianState = () => {
    technicianOptions.value = []
    selectedTechnicians.value = []
    technicianSearch.value = ''
    technicianError.value = ''
    technicianPage.value = 1
    technicianLastPage.value = 1
    technicianSelectOpen.value = false
  }

  const setSelectedTechnicians = (technicians) => {
    selectedTechnicians.value = technicians ?? []
    technicianOptions.value = mergeUsers([
      ...selectedTechnicians.value,
      ...technicianOptions.value,
    ])
  }

  const handleTechnicianScroll = (event) => {
    const target = event.target
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24

    if (reachedBottom) {
      void fetchTechnicians({ reset: false })
    }
  }

  const toggleTechnicianOptions = () => {
    technicianSelectOpen.value = !technicianSelectOpen.value

    if (technicianSelectOpen.value && technicianOptions.value.length === 0) {
      void fetchTechnicians({ reset: true })
    }
  }

  const openTechnicianOptions = () => {
    technicianSelectOpen.value = true

    if (technicianOptions.value.length === 0) {
      void fetchTechnicians({ reset: true })
    }
  }

  const handleTechnicianSearchInput = () => {
    technicianSelectOpen.value = true

    if (technicianSearchTimeout) {
      window.clearTimeout(technicianSearchTimeout)
    }

    technicianSearchTimeout = window.setTimeout(() => {
      void fetchTechnicians({ reset: true })
    }, 300)
  }

  const isTechnicianSelected = (id) =>
    selectedTechnicians.value.some((technician) => technician.id === id)

  const selectTechnician = (technician) => {
    if (!isTechnicianSelected(technician.id)) {
      selectedTechnicians.value = mergeUsers([...selectedTechnicians.value, technician])
    }

    technicianSearch.value = ''
    technicianSelectOpen.value = false
  }

  const removeTechnician = (id) => {
    selectedTechnicians.value = selectedTechnicians.value.filter(
      (technician) => technician.id !== id,
    )
  }

  onBeforeUnmount(() => {
    if (technicianSearchTimeout) {
      window.clearTimeout(technicianSearchTimeout)
    }
  })

  return {
    fetchTechnicians,
    handleTechnicianScroll,
    handleTechnicianSearchInput,
    openTechnicianOptions,
    removeTechnician,
    resetTechnicianState,
    selectTechnician,
    selectedTechnicians,
    setSelectedTechnicians,
    technicianError,
    technicianLoading,
    technicianOptions,
    technicianSearch,
    technicianSelectOpen,
    toggleTechnicianOptions,
  }
}

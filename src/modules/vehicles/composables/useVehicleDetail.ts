import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
import type { Vehicle } from '@/types/vehicle'

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

export const useVehicleDetail = (vehicleId: Ref<string>) => {
  const vehicle = ref<Vehicle | null>(null)
  const loading = ref(false)
  const deleting = ref(false)
  const deleteDialogOpen = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const fetchVehicle = async () => {
    if (!vehicleId.value) {
      vehicle.value = null
      errorMessage.value = 'No se encontró el identificador del vehículo.'
      return
    }

    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''
    vehicle.value = null

    try {
      vehicle.value = await vehiclesApi.show(vehicleId.value, {
        signal: nextController.signal,
      })
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

  const deleteVehicle = async () => {
    if (!vehicle.value) {
      return false
    }

    deleting.value = true
    errorMessage.value = ''

    try {
      await vehiclesApi.remove(vehicle.value.id)
      deleteDialogOpen.value = false
      return true
    } catch (error) {
      errorMessage.value = normalizeApiError(error).message
      return false
    } finally {
      deleting.value = false
    }
  }

  watch(vehicleId, () => void fetchVehicle(), { immediate: true })

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    vehicle,
    loading,
    deleting,
    deleteDialogOpen,
    errorMessage,
    fetchVehicle,
    deleteVehicle,
  }
}

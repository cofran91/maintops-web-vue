import { computed, onMounted, ref } from 'vue'
import ownersApi from '@/modules/owners/services/ownersService'
import usersApi from '@/modules/users/services/usersService'
import vehiclesApi from '@/modules/vehicles/services/vehiclesService'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import type { Owner } from '@/types/owner'
import type { User } from '@/types/user'
import type { Vehicle } from '@/types/vehicle'
import type { VehicleSystem } from '@/types/vehicleSystem'
import type { Workshop } from '@/types/workshop'

export interface ModelFilterOption {
  title: string
  value: string
}

interface ModelFilterResources {
  owners?: boolean
  users?: boolean
  vehicles?: boolean
  vehicleSystems?: boolean
  workshops?: boolean
}

const option = (id: number, parts: Array<string | null | undefined>): ModelFilterOption => ({
  title: parts.filter(Boolean).join(' · '),
  value: String(id),
})

const sortOptions = (items: ModelFilterOption[]) =>
  items.sort((left, right) => left.title.localeCompare(right.title, 'es', { sensitivity: 'base' }))

const hasRole = (user: User, role: string) =>
  user.role === role || Boolean(user.roles?.includes(role))

export const useModelFilterOptions = (resources: ModelFilterResources) => {
  const loading = ref(false)
  const users = ref<User[]>([])
  const owners = ref<Owner[]>([])
  const vehicles = ref<Vehicle[]>([])
  const workshops = ref<Workshop[]>([])
  const vehicleSystems = ref<VehicleSystem[]>([])

  const userOption = (user: User) => option(user.id, [user.name, user.email])
  const userOptions = computed(() => sortOptions(users.value.map(userOption)))
  const advisorOptions = computed(() =>
    sortOptions(users.value.filter((user) => hasRole(user, 'advisor')).map(userOption)),
  )
  const managerOptions = computed(() =>
    sortOptions(users.value.filter((user) => hasRole(user, 'workshop_manager')).map(userOption)),
  )
  const technicianOptions = computed(() =>
    sortOptions(users.value.filter((user) => hasRole(user, 'technician')).map(userOption)),
  )
  const ownerOptions = computed(() =>
    sortOptions(owners.value.map((owner) =>
      option(owner.id, [owner.name, owner.document_number || owner.email]),
    )),
  )
  const vehicleOptions = computed(() =>
    sortOptions(vehicles.value.map((vehicle) =>
      option(vehicle.id, [
        vehicle.license_plate,
        [vehicle.brand, vehicle.model].filter(Boolean).join(' '),
      ]),
    )),
  )
  const workshopOptions = computed(() =>
    sortOptions(workshops.value.map((workshop) =>
      option(workshop.id, [workshop.code, workshop.name]),
    )),
  )
  const vehicleSystemOptions = computed(() =>
    sortOptions(vehicleSystems.value.map((system) =>
      option(system.id, [system.code, system.name]),
    )),
  )

  const fetchOptions = async () => {
    loading.value = true
    const requests: Promise<unknown>[] = []

    if (resources.users) {
      requests.push(usersApi.index({ page: 1, per_page: 100 }).then((page) => {
        users.value = page.items
      }))
    }
    if (resources.owners) {
      requests.push(ownersApi.index({ page: 1, per_page: 100 }).then((page) => {
        owners.value = page.items
      }))
    }
    if (resources.vehicles) {
      requests.push(vehiclesApi.index({ page: 1, per_page: 100 }).then((page) => {
        vehicles.value = page.items
      }))
    }
    if (resources.workshops) {
      requests.push(workshopsApi.index({ page: 1, per_page: 100 }).then((page) => {
        workshops.value = page.items
      }))
    }
    if (resources.vehicleSystems) {
      requests.push(vehicleSystemsApi.index().then((page) => {
        vehicleSystems.value = page.items
      }))
    }

    await Promise.allSettled(requests)
    loading.value = false
  }

  onMounted(() => void fetchOptions())

  return {
    advisorOptions,
    fetchOptions,
    loading,
    managerOptions,
    ownerOptions,
    technicianOptions,
    userOptions,
    vehicleOptions,
    vehicleSystemOptions,
    workshopOptions,
  }
}

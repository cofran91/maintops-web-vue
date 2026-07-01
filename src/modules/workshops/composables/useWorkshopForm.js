import { reactive, ref } from 'vue'
import {
  firstFieldError,
  hasPositiveInteger,
  nullableText,
} from '@/modules/shared/utils/formValues.js'
import {
  buildScheduleFromRows,
  createDefaultScheduleRows,
  fillScheduleRows,
  resetScheduleRows,
} from '@/modules/workshops/utils/workshopSchedule.js'

export function useWorkshopForm(t) {
  const form = reactive({
    manager_user_id: '',
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    vehicle_system_ids: [],
    is_active: true,
  })
  const scheduleRows = reactive(createDefaultScheduleRows())
  const formError = ref('')
  const validationErrors = ref({})

  const setField = (field, value) => {
    form[field] = value
  }

  const setVehicleSystem = (id, checked) => {
    const systemId = Number(id)

    form.vehicle_system_ids = checked
      ? Array.from(new Set([...form.vehicle_system_ids, systemId]))
      : form.vehicle_system_ids.filter((currentId) => Number(currentId) !== systemId)
  }

  const setScheduleField = (index, field, value) => {
    scheduleRows[index][field] = value
  }

  const fillForm = (workshop) => {
    form.manager_user_id = workshop.manager_user_id ? String(workshop.manager_user_id) : ''
    form.name = workshop.name ?? ''
    form.code = workshop.code ?? ''
    form.address = workshop.address ?? ''
    form.city = workshop.city ?? ''
    form.phone = workshop.phone ?? ''
    form.email = workshop.email ?? ''
    form.vehicle_system_ids =
      workshop.vehicle_system_ids ??
      workshop.vehicle_systems?.map((system) => system.id) ??
      []
    form.is_active = Boolean(workshop.is_active)
    fillScheduleRows(scheduleRows, workshop.weekly_schedule ?? {})
  }

  const resetForm = () => {
    form.manager_user_id = ''
    form.name = ''
    form.code = ''
    form.address = ''
    form.city = ''
    form.phone = ''
    form.email = ''
    form.vehicle_system_ids = []
    form.is_active = true
    resetScheduleRows(scheduleRows)
  }

  const resetErrors = () => {
    formError.value = ''
    validationErrors.value = {}
  }

  const validateForm = () => {
    const errors = {}

    if (!hasPositiveInteger(form.manager_user_id)) {
      errors.manager_user_id = [t('workshops.validation.selectManager')]
    }

    if (form.name.trim() === '') {
      errors.name = [t('workshops.validation.nameRequired')]
    }

    if (form.code.trim() === '') {
      errors.code = [t('workshops.validation.codeRequired')]
    }

    if (form.vehicle_system_ids.length === 0) {
      errors.vehicle_system_ids = [t('workshops.validation.selectVehicleSystem')]
    }

    let hasOpenDay = false

    scheduleRows.forEach((day) => {
      if (!day.enabled) {
        return
      }

      hasOpenDay = true

      if (!day.opens_at || !day.closes_at) {
        errors[`weekly_schedule.${day.key}`] = [t('workshops.validation.setOpeningClosing')]
        return
      }

      if (day.opens_at >= day.closes_at) {
        errors[`weekly_schedule.${day.key}.closes_at`] = [
          t('workshops.validation.closingAfterOpening'),
        ]
      }
    })

    if (!hasOpenDay) {
      errors.weekly_schedule = [t('workshops.validation.selectServiceDay')]
    }

    validationErrors.value = errors

    if (Object.keys(errors).length > 0) {
      formError.value = t('workshops.validation.reviewHighlighted')
      return false
    }

    return true
  }

  const buildPayload = (selectedTechnicians) => ({
    manager_user_id: Number(form.manager_user_id),
    name: form.name,
    code: form.code,
    address: nullableText(form.address),
    city: nullableText(form.city),
    phone: nullableText(form.phone),
    email: nullableText(form.email),
    weekly_schedule: buildScheduleFromRows(scheduleRows),
    vehicle_system_ids: form.vehicle_system_ids.map(Number),
    technician_user_ids: selectedTechnicians.map((technician) => technician.id),
    is_active: form.is_active,
  })

  const fieldError = (field) => firstFieldError(validationErrors.value, field)
  const scheduleError = (day) => fieldError(`weekly_schedule.${day}`)
  const dayLabel = (day) => t(`workshops.days.${day}`)

  return {
    buildPayload,
    dayLabel,
    fieldError,
    fillForm,
    form,
    formError,
    resetErrors,
    resetForm,
    scheduleError,
    scheduleRows,
    setField,
    setScheduleField,
    setVehicleSystem,
    validateForm,
    validationErrors,
  }
}

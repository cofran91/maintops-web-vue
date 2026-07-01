import { WORKSHOP_DAYS } from '@/types/workshop.js'

export const DEFAULT_OPEN_TIME = '08:00'
export const DEFAULT_CLOSE_TIME = '17:00'

export const createDefaultScheduleRows = () =>
  WORKSHOP_DAYS.map((day, index) => ({
    key: day,
    enabled: index < 5,
    opens_at: DEFAULT_OPEN_TIME,
    closes_at: DEFAULT_CLOSE_TIME,
  }))

export const buildScheduleFromRows = (scheduleRows) => {
  const schedule = {}

  scheduleRows.forEach((day) => {
    if (!day.enabled) {
      return
    }

    schedule[day.key] = {
      opens_at: day.opens_at,
      closes_at: day.closes_at,
    }
  })

  return schedule
}

export const fillScheduleRows = (scheduleRows, schedule) => {
  scheduleRows.forEach((day) => {
    const hours = schedule[day.key]

    day.enabled = hours !== undefined
    day.opens_at = hours?.opens_at ?? DEFAULT_OPEN_TIME
    day.closes_at = hours?.closes_at ?? DEFAULT_CLOSE_TIME
  })
}

export const resetScheduleRows = (scheduleRows) => {
  scheduleRows.forEach((day, index) => {
    day.enabled = index < 5
    day.opens_at = DEFAULT_OPEN_TIME
    day.closes_at = DEFAULT_CLOSE_TIME
  })
}

import { nextTick, onBeforeUnmount, watch, type WatchStopHandle } from 'vue'

type FilterState = Record<string, unknown>

interface FilterAutoApplyOptions {
  immediateKeys: readonly string[]
  delay?: number
}

export const useFilterAutoApply = (
  filters: FilterState,
  apply: () => void,
  options: FilterAutoApplyOptions,
) => {
  const immediateKeys = new Set(options.immediateKeys)
  const delay = options.delay ?? 1000
  let timer: ReturnType<typeof setTimeout> | null = null
  let suspended = false
  let previousSnapshot: FilterState = { ...filters }

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const suspend = (callback: () => void) => {
    clearTimer()
    suspended = true
    callback()
    void nextTick(() => {
      suspended = false
    })
  }

  const stop: WatchStopHandle = watch(
    filters,
    (next) => {
      if (suspended) {
        previousSnapshot = { ...next }
        return
      }

      const changedKeys = Object.keys(next).filter((key) => next[key] !== previousSnapshot[key])
      previousSnapshot = { ...next }
      if (changedKeys.length === 0) return

      clearTimer()

      if (changedKeys.some((key) => immediateKeys.has(key))) {
        apply()
        return
      }

      timer = setTimeout(() => {
        timer = null
        apply()
      }, delay)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    clearTimer()
    stop()
  })

  return { clearTimer, suspend }
}

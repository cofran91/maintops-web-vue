import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { i18n } from '@/i18n'

export const localizedRouteTitle = (route: RouteLocationNormalizedLoaded) => {
  const routeName = String(route.name ?? '')
  const key = routeName ? `routes.${routeName}.title` : ''

  if (key && i18n.global.te(key)) {
    return i18n.global.t(key)
  }

  return route.meta.title ?? i18n.global.t('routes.dashboard.title')
}

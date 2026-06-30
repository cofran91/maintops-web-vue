import { hasTranslation, t } from '@/i18n/index.js'

export const localizedRouteTitle = (route) => {
  const routeName = String(route.name ?? '')
  const key = routeName ? `routes.${routeName}.title` : null

  if (key && hasTranslation(key)) {
    return t(key)
  }

  return route.meta?.title ?? t('routes.dashboard.title')
}

export const localizedRouteSubtitle = (route) => {
  const routeName = String(route.name ?? '')
  const key = routeName ? `routes.${routeName}.subtitle` : null

  if (key && hasTranslation(key)) {
    return t(key)
  }

  return route.meta?.subtitle ?? ''
}

export const localizedRouteSection = (route) => {
  const section = String(route.meta?.section ?? 'MaintOps').toLowerCase()
  const key = `sections.${section}`

  return hasTranslation(key) ? t(key) : route.meta?.section ?? t('sections.maintops')
}

import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth.js'
import { i18n, t } from '@/i18n/index.js'
import { localizedRouteTitle } from '@/i18n/routeLabels.js'
import { startDomTranslations, translateDocument } from '@/i18n/domTranslations.js'

import './css/main.css'

// Init Pinia
const pinia = createPinia()

const app = createApp(App)

// Create Vue app
app.use(pinia)
app.use(i18n)

useAuthStore().initializeSession()

app.use(router).mount('#app')
startDomTranslations()

// Dark mode
// Uncomment, if you'd like to restore persisted darkMode setting, or use `prefers-color-scheme: dark`.
// import { useDarkModeStore } from '@/stores/darkMode'

// const darkModeStore = useDarkModeStore(pinia)
// darkModeStore.init()

// Default title tag
const updateDocumentTitle = (route) => {
  const title = localizedRouteTitle(route)
  const defaultDocumentTitle = t('common.brand')

  document.title = title ? `${title} - ${defaultDocumentTitle}` : defaultDocumentTitle
}

router.afterEach((to) => {
  updateDocumentTitle(to)
})

watch(
  () => i18n.global.locale.value,
  () => {
    updateDocumentTitle(router.currentRoute.value)
    translateDocument()
  },
)

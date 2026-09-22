import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { i18n } from './i18n'
import { localizedRouteTitle } from './i18n/routeLabels'
import { startDomTranslations, translateDocument } from './i18n/domTranslations.js'
import vuetify from './plugins/vuetify'
import router from './router'
import './styles/main.css'
import './styles/theme.scss'
import './styles/views/dashboard.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

const updateDocumentTitle = (route = router.currentRoute.value) => {
  document.title = `${localizedRouteTitle(route)} · MaintOps`
}

router.afterEach(updateDocumentTitle)

watch(
  () => i18n.global.locale.value,
  () => {
    updateDocumentTitle()
    translateDocument()
  },
)

app.mount('#app')
startDomTranslations()

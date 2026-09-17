import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { i18n } from './i18n'
import { localizedRouteTitle } from './i18n/routeLabels'
import vuetify from './plugins/vuetify'
import router from './router'
import './styles/main.css'
import './styles/views/dashboard.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

router.afterEach((route) => {
  document.title = `${localizedRouteTitle(route)} · MaintOps`
})

app.mount('#app')

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import 'vuetify/styles'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'maintopsLight',
    themes: {
      maintopsLight: {
        dark: false,
        colors: {
          background: '#f4f7fb',
          surface: '#ffffff',
          primary: '#3158e7',
          secondary: '#13a697',
          accent: '#f59d43',
          error: '#e15361',
          warning: '#f1a33b',
          info: '#3e8df7',
          success: '#24a77b',
          'on-background': '#15213b',
          'on-surface': '#17223c',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      elevation: 0,
      rounded: 'lg',
    },
    VCard: {
      elevation: 0,
      rounded: 'xl',
    },
    VTextField: {
      color: 'primary',
      density: 'comfortable',
      variant: 'outlined',
    },
  },
})

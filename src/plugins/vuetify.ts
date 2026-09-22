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
      maintopsDark: {
        dark: true,
        colors: {
          background: '#0f1728',
          surface: '#162137',
          primary: '#6f8cff',
          secondary: '#32c7b5',
          accent: '#ffb55f',
          error: '#ff7684',
          warning: '#ffc463',
          info: '#6eabff',
          success: '#48c99e',
          'on-background': '#e9eef8',
          'on-surface': '#edf2fa',
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

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

const allowedHosts = process.env.FRONTEND_ALLOWED_HOSTS
  ?.split(',')
  .map((host) => host.trim())
  .filter((host) => host.length > 0)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    vueDevTools(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

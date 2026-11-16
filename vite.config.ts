import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resumePdfPlugin } from './scripts/resumePdfPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  publicDir: 'src/assets/static',
  plugins: [vue(), vueDevTools(), !isSsrBuild && resumePdfPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/_variables.scss" as *;\n`,
      },
    },
  },
}))

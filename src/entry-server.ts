import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { currentLocale } from './state/locale'
import type { Locale } from './state/locale'

export async function render(locale: Locale) {
  currentLocale.value = locale
  return renderToString(createSSRApp(App))
}

import { computed, ref } from 'vue'
import siteData from '@/data/site.json'
import sectionsData from '@/data/sections.json'
import { getSeo, localeFromPath, localePath, serializeJsonLd, structuredData } from '@/data/seo'

export type Locale = 'en' | 'pt-BR'
export type LocaleInput = Locale | 'pt' | 'en'

const STORAGE_KEY = 'matbdev.locale'

export interface LocaleOption {
  code: Locale
  label: string
  shortLabel: string
  flag?: string
}

export const AVAILABLE_LOCALES: readonly LocaleOption[] = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'pt-BR', label: 'Português', shortLabel: 'PT' },
] as const

export const currentLocale = ref<Locale>('en')

export const isPt = computed(() => currentLocale.value === 'pt-BR')
export const isEn = computed(() => currentLocale.value === 'en')

export function normalizeLocale(input: string | null | undefined): Locale {
  if (!input) return 'en'
  const clean = input.toLowerCase().trim()
  if (clean === 'pt' || clean === 'pt-br' || clean.startsWith('pt')) {
    return 'pt-BR'
  }
  return 'en'
}

export function updateDocumentMeta(locale: Locale) {
  if (typeof document === 'undefined') return

  document.documentElement.lang = locale

  const seo = getSeo(locale)
  document.title = seo.title
  const values: [string, string][] = [
    ['meta[name="description"]', seo.description],
    ['meta[property="og:title"]', seo.title],
    ['meta[property="og:description"]', seo.description],
    ['meta[property="og:url"]', seo.url],
    ['meta[property="og:locale"]', seo.ogLocale],
    ['meta[property="og:locale:alternate"]', seo.alternateOgLocale],
    ['meta[property="og:image:alt"]', seo.imageAlt],
    ['meta[name="twitter:title"]', seo.title],
    ['meta[name="twitter:description"]', seo.description],
    ['meta[name="twitter:url"]', seo.url],
    ['meta[name="twitter:image:alt"]', seo.imageAlt],
  ]
  for (const [selector, value] of values) {
    document.querySelector(selector)?.setAttribute('content', value)
  }
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', seo.url)
  document
    .querySelector('link[type="text/markdown"]')
    ?.setAttribute('href', `${localePath(locale)}index.md`)
  const schema = document.querySelector('#portfolio-schema')
  if (schema) schema.textContent = serializeJsonLd(structuredData(locale))
}

export function setLocale(localeInput: LocaleInput) {
  const target = normalizeLocale(localeInput)
  currentLocale.value = target

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, target)
    } catch {
      // LocalStorage might be disabled in private mode
    }

    try {
      const url = new URL(window.location.href)
      url.pathname = localePath(target)
      url.searchParams.delete('lang')
      window.history.replaceState(null, '', url.toString())
    } catch {
      // Ignore URL replacement failures
    }
  }

  updateDocumentMeta(target)
}

export function toggleLocale() {
  setLocale(currentLocale.value === 'en' ? 'pt-BR' : 'en')
}

export function initLocale(): Locale {
  if (typeof window === 'undefined') return 'en'

  // 1. URL parameter (?lang=pt or ?lang=pt-BR or ?lang=en)
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('lang')
    if (fromUrl) {
      const resolved = normalizeLocale(fromUrl)
      currentLocale.value = resolved
      updateDocumentMeta(resolved)
      return resolved
    }
  } catch {
    // Ignore URL parse error
  }

  // Static language pages take precedence over persisted/browser preferences.
  const pathLocale = localeFromPath(window.location.pathname)
  if (pathLocale) {
    currentLocale.value = pathLocale
    updateDocumentMeta(pathLocale)
    return pathLocale
  }

  // 2. LocalStorage persistence
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const resolved = normalizeLocale(stored)
      currentLocale.value = resolved
      updateDocumentMeta(resolved)
      return resolved
    }
  } catch {
    // Ignore storage errors
  }

  // 3. Browser language
  try {
    const navLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage
    if (navLang && navLang.toLowerCase().startsWith('pt')) {
      currentLocale.value = 'pt-BR'
      updateDocumentMeta('pt-BR')
      return 'pt-BR'
    }
  } catch {
    // Ignore navigator errors
  }

  const defLocale = (siteData.defaultLocale as Locale) || 'en'
  currentLocale.value = defLocale
  updateDocumentMeta(defLocale)
  return defLocale
}

/**
 * Universal localized string/object selector.
 */
export function t<T>(localizedObj: { en?: T; 'pt-BR'?: T; pt?: T } | undefined, fallback?: T): T {
  if (!localizedObj) return fallback as T
  const loc = currentLocale.value
  if (loc === 'pt-BR' && ('pt-BR' in localizedObj || 'pt' in localizedObj)) {
    return (localizedObj['pt-BR'] ?? localizedObj['pt'] ?? fallback) as T
  }
  return (localizedObj.en ?? localizedObj['pt-BR'] ?? fallback) as T
}

/**
 * Navigation links according to current locale.
 */
export const localizedNavigation = computed(() => {
  const content = sectionsData.navigation.content
  const nav = currentLocale.value === 'pt-BR' ? content['pt-BR'] : content.en

  return [
    { label: nav.skills, href: '#skills' },
    { label: nav.projects, href: '#projects' },
    { label: nav.experience, href: '#experience' },
    { label: nav.education, href: '#education' },
    { label: nav.resumes, href: '#resume' },
    { label: nav.contact, href: '#contact', highlighted: true },
  ]
})

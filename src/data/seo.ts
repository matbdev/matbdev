import site from './site.json' with { type: 'json' }
import profileData from './profile.json' with { type: 'json' }
import projectsData from './projects.json' with { type: 'json' }
import skillsData from './skills.json' with { type: 'json' }

export type SeoLocale = 'en' | 'pt-BR'
export const SITE_URL = site.url
export const LOCALES: readonly SeoLocale[] = ['en', 'pt-BR']

export function localePath(locale: SeoLocale) {
  return locale === 'en' ? '/en/' : '/pt-BR/'
}

export function localeFromPath(path: string): SeoLocale | undefined {
  if (/^\/pt-BR\/?$/i.test(path)) return 'pt-BR'
  if (/^\/en\/?$/i.test(path)) return 'en'
}

export function getSeo(locale: SeoLocale) {
  return {
    ...site.seo.content[locale],
    url: `${SITE_URL}${localePath(locale)}`,
    image: `${SITE_URL}${site.seo.image}`,
    ogLocale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
    alternateOgLocale: locale === 'pt-BR' ? 'en_US' : 'pt_BR',
  }
}

export function structuredData(locale: SeoLocale) {
  const profile = profileData.profile
  const seo = getSeo(locale)
  const personId = `${SITE_URL}/#person`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        alternateName: profile.handle,
        url: `${SITE_URL}/`,
        description: profile.content[locale].introduction,
        jobTitle: profile.role,
        email: `mailto:${profile.email}`,
        sameAs: profile.socials.map((social) => social.href),
        knowsLanguage: profile.languages.map((language) => language.code),
        knowsAbout: skillsData.skills.items
          .filter((skill) => !('enabled' in skill) || skill.enabled !== false)
          .map((skill) => skill.name),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: profile.name,
        inLanguage: [...LOCALES],
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${seo.url}#webpage`,
        url: seo.url,
        name: seo.title,
        description: seo.description,
        inLanguage: locale,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': personId },
      },
      {
        '@type': 'ItemList',
        '@id': `${seo.url}#projects`,
        itemListElement: projectsData.projects
          .filter((project) => project.highlight)
          .sort((a, b) => a.order - b.order)
          .map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'CreativeWork',
              '@id': `${SITE_URL}/#project-${project.id}`,
              name: project.content[locale].title,
              description: project.content[locale].description,
              url: project.links.repository,
              author: { '@id': personId },
              keywords: project.technologies,
            },
          })),
      },
    ],
  }
}

// Prevent content from terminating a JSON-LD script element.
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  getSeo,
  LOCALES,
  localePath,
  serializeJsonLd,
  SITE_URL,
  structuredData,
} from '../src/data/seo.ts'
import type { SeoLocale } from '../src/data/seo.ts'
import portfolio from '../src/data/portfolio.json' with { type: 'json' }

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const template = await readFile(resolve(dist, 'index.html'), 'utf8')
const { render } = (await import(
  pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href
)) as {
  render: (locale: SeoLocale) => Promise<string>
}
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]!,
  )

function head(locale: SeoLocale) {
  const seo = getSeo(locale)
  const meta = (name: string, value: string, property = false) =>
    `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(value)}" />`
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('description', seo.description),
    meta('robots', 'index, follow, max-image-preview:large'),
    `<link rel="canonical" href="${seo.url}" />`,
    ...LOCALES.map(
      (language) =>
        `<link rel="alternate" hreflang="${language}" href="${getSeo(language).url}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`,
    `<link rel="alternate" type="text/markdown" href="${localePath(locale)}index.md" />`,
    '<link rel="describedby" type="text/plain" href="/llms.txt" />',
    meta('og:site_name', portfolio.profile.name, true),
    meta('og:type', 'profile', true),
    ...Object.entries({
      url: seo.url,
      title: seo.title,
      description: seo.description,
      image: seo.image,
      locale: seo.ogLocale,
    }).map(([key, value]) => meta(`og:${key}`, value, true)),
    meta('og:locale:alternate', seo.alternateOgLocale, true),
    meta('og:image:alt', seo.imageAlt, true),
    meta('og:image:width', '1200', true),
    meta('og:image:height', '630', true),
    meta('twitter:card', 'summary_large_image'),
    ...Object.entries({
      url: seo.url,
      title: seo.title,
      description: seo.description,
      image: seo.image,
      'image:alt': seo.imageAlt,
    }).map(([key, value]) => meta(`twitter:${key}`, value)),
    `<script id="portfolio-schema" type="application/ld+json">${serializeJsonLd(structuredData(locale))}</script>`,
  ].join('\n')
}

function markdown(locale: SeoLocale) {
  const pt = locale === 'pt-BR'
  const p = portfolio.profile
  const content = p.content[locale]
  const lines = [
    `# ${p.name}`,
    '',
    `> ${content.introduction}`,
    '',
    getSeo(locale).url,
    '',
    content.location,
    '',
    ...content.biography.flatMap((paragraph) => [paragraph, '']),
    `## ${pt ? 'Experiência' : 'Experience'}`,
    '',
  ]
  for (const role of portfolio.experience) {
    const text = role.content[locale]
    lines.push(`### ${text.title} — ${role.company}`, '', text.period, '', text.summary, '')
    if ('details' in text)
      lines.push(...text.details.flatMap((detail) => [`- ${detail.title}: ${detail.text}`, '']))
  }
  lines.push(`## ${pt ? 'Projetos' : 'Projects'}`, '')
  for (const project of portfolio.projects) {
    const text = project.content[locale]
    lines.push(
      `### ${text.title}`,
      '',
      text.description,
      '',
      text.problem,
      '',
      text.contribution,
      '',
      project.technologies.join(', '),
      '',
      `[${pt ? 'Repositório' : 'Repository'}](${project.links.repository})`,
      '',
    )
  }
  lines.push(`## ${pt ? 'Educação' : 'Education'}`, '')
  for (const education of portfolio.education) {
    const text = education.content[locale]
    lines.push(
      `### ${text.degree} — ${education.institution}`,
      '',
      text.period,
      '',
      text.description,
      '',
    )
  }
  lines.push(`## ${pt ? 'Certificações e cursos' : 'Certifications and coursework'}`, '')
  for (const certificate of portfolio.certifications) {
    lines.push(`- [${certificate.name}](${certificate.credentialUrl}) — ${certificate.issuer}`)
  }
  for (const course of portfolio.courses) {
    const text = course.content[locale]
    lines.push(`- ${text.name} — ${text.provider}`)
  }
  lines.push('', `## ${pt ? 'Currículos' : 'Résumés'}`, '')
  for (const resume of portfolio.resumes.filter((item) => item.locale === locale)) {
    lines.push(`- [${resume.content[locale].title} (PDF)](${SITE_URL}${resume.src})`)
  }
  lines.push('')
  lines.push(
    `## ${pt ? 'Contato e perfis' : 'Contact and profiles'}`,
    '',
    `- Email: ${p.email}`,
    ...p.socials.map((social) => `- [${social.name}](${social.href})`),
    '',
  )
  return lines.join('\n')
}

for (const locale of LOCALES) {
  const directory = resolve(dist, localePath(locale).slice(1))
  await mkdir(directory, { recursive: true })
  const html = template
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace(/<!--seo-head-->[\s\S]*?<!--\/seo-head-->/, head(locale))
    .replace('<div id="app"></div>', `<div id="app">${await render(locale)}</div>`)
  await writeFile(resolve(directory, 'index.html'), html)
  await writeFile(resolve(directory, 'index.md'), markdown(locale))
  if (locale === 'en') {
    await writeFile(resolve(dist, 'index.html'), html)
    await writeFile(resolve(dist, 'index.md'), markdown(locale))
  }
}
await writeFile(
  resolve(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
)
await writeFile(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${LOCALES.map((locale) => `  <url><loc>${getSeo(locale).url}</loc></url>`).join('\n')}\n</urlset>\n`,
)
await writeFile(
  resolve(dist, 'llms.txt'),
  `# ${portfolio.profile.name}\n\n> ${portfolio.profile.content.en.introduction}\n\n## Portfolio\n\n- [English](${getSeo('en').url}): Projects, experience, education and contact.\n- [Português](${getSeo('pt-BR').url}): Projetos, experiência, formação e contato.\n\n## Text versions\n\n- [English portfolio](${SITE_URL}/en/index.md): Full text from the same portfolio metadata.\n- [Portfólio em português](${SITE_URL}/pt-BR/index.md): Texto completo gerado dos mesmos metadados.\n`,
)
console.log('Prerendered EN/PT-BR HTML, JSON-LD, Markdown, robots.txt, sitemap.xml and llms.txt.')

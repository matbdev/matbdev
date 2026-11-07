import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type portfolio from '../src/data/portfolio.json'

export type ProfileReadmeData = typeof portfolio
export type ProfileReadmeLocale = 'en' | 'pt-BR'

const readmeFiles: Record<ProfileReadmeLocale, string> = {
  en: 'README-en.md',
  'pt-BR': 'README.md',
}

function inline(text: string) {
  return text
    .replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char]!)
    .replace(/[\\`*_[\]]/g, '\\$&')
}

function link(text: string, url: string) {
  return `[${inline(text)}](${url.replace(/\(/g, '%28').replace(/\)/g, '%29')})`
}

export function renderProfileReadme(data: ProfileReadmeData, locale: ProfileReadmeLocale): string {
  const profile = data.profile
  const content = profile.content[locale]
  const copy = content.readme
  const otherLocale = locale === 'en' ? 'pt-BR' : 'en'
  const portfolioUrl = `${data.url}/${locale}/`
  const lines = [
    '<!-- Generated from metadata/*.yml by npm run build:data. Do not edit manually. -->',
    '',
    link(copy.languageLink, readmeFiles[otherLocale]),
    '',
    `# ${inline(profile.name)}`,
    '',
    inline(content.introduction),
    '',
    `${inline(content.location)} · ${inline(content.currentRole)}`,
    '',
    `**${link(copy.portfolioLink, portfolioUrl)}**`,
    '',
    `## ${inline(copy.experienceHeading)}`,
    '',
  ]

  for (const role of [...data.experience].sort((a, b) => a.order - b.order)) {
    const text = role.content[locale]
    lines.push(
      `### ${inline(text.title)} — ${inline(role.company)}`,
      '',
      inline(text.period),
      '',
      inline(text.summary),
      '',
    )
    if ('details' in text && text.details) {
      lines.push(
        ...text.details.map((detail) => `- **${inline(detail.title)}:** ${inline(detail.text)}`),
        '',
      )
    } else if ('description' in text) {
      lines.push(inline(text.description), '')
    }
  }

  lines.push(`## ${inline(copy.projectsHeading)}`, '')
  for (const project of [...data.projects]
    .filter((item) => item.highlight)
    .sort((a, b) => a.order - b.order)) {
    const text = project.content[locale]
    lines.push(
      `### ${link(text.title, project.links.repository)}`,
      '',
      inline(text.badge),
      '',
      inline(text.description),
      '',
      inline(text.contribution),
      '',
      project.technologies.map(inline).join(' · '),
      '',
    )
  }

  lines.push(`## ${inline(copy.toolsHeading)}`, '', inline(content.skillsNote), '')
  for (const context of data.skills.contexts) {
    const tools = data.skills.items.filter(
      (tool) => tool.context === context.id && (!('enabled' in tool) || tool.enabled !== false),
    )
    if (tools.length)
      lines.push(
        `- **${inline(context.content[locale].label)}:** ${tools.map((tool) => inline(tool.name)).join(' · ')}`,
      )
  }
  lines.push('', `## ${inline(copy.educationHeading)}`, '')
  for (const education of data.education) {
    const text = education.content[locale]
    lines.push(
      `**${inline(text.degree)} — ${inline(education.institution)}**`,
      '',
      inline(text.period),
      '',
    )
  }
  lines.push(`## ${inline(copy.credentialsHeading)}`, '')
  for (const certificate of data.certifications) {
    lines.push(
      `- ${link(certificate.name, certificate.credentialUrl)} — ${inline(certificate.issuer)}`,
    )
  }
  lines.push(
    '',
    `## ${inline(copy.aboutHeading)}`,
    '',
    inline(content.biography.at(-1) ?? ''),
    '',
    `## ${inline(copy.contactHeading)}`,
    '',
    [
      link(profile.email, `mailto:${profile.email}`),
      ...profile.socials.map((social) => link(social.name, social.href)),
    ].join(' · '),
    '',
    '---',
    '',
    link(copy.repositoryLink, 'PORTFOLIO-README.md'),
    '',
  )
  return lines.join('\n')
}

export async function generateProfileReadmes(root: string): Promise<void> {
  // Read after YAML conversion so this invocation always uses the current source data.
  const data = JSON.parse(
    await readFile(resolve(root, 'src/data/portfolio.json'), 'utf8'),
  ) as ProfileReadmeData
  for (const locale of ['pt-BR', 'en'] as const) {
    await writeFile(resolve(root, readmeFiles[locale]), renderProfileReadme(data, locale))
  }
}

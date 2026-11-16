import { formatResumeSkillGroup, resolveResumeUI } from './buildResumeDocument.ts'
import type { ResumeDocument, ResumeUI } from './resumeTypes.ts'

export function resumeToMarkdown(doc: ResumeDocument, customUi?: ResumeUI): string {
  const ui = customUi ?? resolveResumeUI(doc.locale)
  const lines: string[] = []

  // Header
  lines.push(`# ${doc.header.name.toUpperCase()}`)
  lines.push(`**${doc.header.tagline}**`)
  lines.push(
    `${doc.header.location} | ${doc.header.englishLevel} | [${doc.header.email}](mailto:${doc.header.email})`,
  )

  const linksStr = doc.header.links.map((link) => `[${link.label}](${link.href})`).join(' | ')
  if (linksStr) {
    lines.push(linksStr)
  }
  lines.push('')

  // Summary
  if (doc.summary) {
    lines.push(`## ${ui.summaryHeading.toUpperCase()}`)
    lines.push(doc.summary)
    lines.push('')
  }

  // Experience
  if (doc.experience.length > 0) {
    lines.push(`## ${ui.experienceHeading.toUpperCase()}`)
    for (const exp of doc.experience) {
      lines.push(`### ${exp.role} — ${exp.company} | ${exp.period}`)
      if (exp.summary) {
        lines.push(`_${exp.summary}_`)
      }
      for (const h of exp.highlights) {
        if (h.label) {
          lines.push(`- **${h.label}:** ${h.text}`)
        } else {
          lines.push(`- ${h.text}`)
        }
      }
      lines.push('')
    }
  }

  // Projects
  if (doc.projects.length > 0) {
    lines.push(`## ${ui.projectsHeading.toUpperCase()}`)
    for (const proj of doc.projects) {
      const repo = proj.repositoryUrl ? ` ([${ui.repositoryLabel}](${proj.repositoryUrl}))` : ''
      const badge = proj.badge ? ` _(${proj.badge})_` : ''
      lines.push(`### ${proj.name}${badge}${repo}`)
      lines.push(proj.description)
      for (const highlight of proj.highlights ?? []) {
        lines.push(
          highlight.label ? `- **${highlight.label}:** ${highlight.text}` : `- ${highlight.text}`,
        )
      }
      if (proj.technologies.length) {
        lines.push(`**${ui.technologiesLabel}:** ${proj.technologies.join(', ')}`)
      }
      lines.push('')
    }
  }

  // Skills
  if (doc.skills.length > 0) {
    lines.push(`## ${ui.skillsHeading.toUpperCase()}`)
    for (const group of doc.skills) {
      lines.push(`- **${group.group}:** ${formatResumeSkillGroup(group)}`)
    }
    lines.push('')
  }

  // Education
  if (doc.education.length > 0) {
    lines.push(`## ${ui.educationHeading.toUpperCase()}`)
    for (const edu of doc.education) {
      lines.push(`- **${edu.degree}** — ${edu.institution} | ${edu.period}`)
      if (edu.description) {
        lines.push(`  ${edu.description}`)
      }
    }
    lines.push('')
  }

  // Certifications & Courses
  if (doc.certifications.length > 0 || doc.courses.length > 0) {
    lines.push(`## ${ui.certificationsHeading.toUpperCase()}`)
    for (const cert of doc.certifications) {
      const verify = cert.verifyUrl ? ` ([${ui.verified}](${cert.verifyUrl}))` : ''
      const topic = cert.topic ? ` (${cert.topic})` : ''
      lines.push(`- **${cert.issuer}** — ${cert.name}${topic}${verify}`)
    }
    for (const course of doc.courses) {
      lines.push(`- **${course.name}** — ${course.provider}`)
    }
    lines.push('')
  }

  if (doc.awards.length) {
    lines.push(`## ${ui.awardsHeading.toUpperCase()}`)
    for (const award of doc.awards) {
      lines.push(award.label ? `- **${award.label}:** ${award.text}` : `- ${award.text}`)
    }
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

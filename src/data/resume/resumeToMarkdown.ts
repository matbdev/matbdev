import type { ResumeDocument, ResumeUI } from './resumeTypes.ts'

const DEFAULT_UI: Record<'en' | 'pt-BR', ResumeUI> = {
  en: {
    discipline: 'Focus area',
    data: 'Data engineering',
    dataSubtitle: 'Pipelines, Databricks & applied AI',
    software: 'Software engineering',
    softwareSubtitle: 'Backend systems, APIs & architecture',
    language: 'Document language',
    previewAction: 'View full résumé',
    downloadAction: 'Download résumé (PDF)',
    copyAction: 'Copy as Markdown',
    copiedSuccess: 'Résumé copied in Markdown!',
    closeModal: 'Close preview',
    summaryHeading: 'Professional Profile',
    experienceHeading: 'Professional Experience',
    projectsHeading: 'Featured Projects',
    skillsHeading: 'Technical Skills',
    educationHeading: 'Academic Background',
    certificationsHeading: 'Certifications & Training',
    present: 'Present',
    expected: 'Expected',
    verified: 'Verify Credential',
    englishLevel: 'English B2',
  },
  'pt-BR': {
    discipline: 'Área de foco',
    data: 'Engenharia de dados',
    dataSubtitle: 'Pipelines, Databricks e IA aplicada',
    software: 'Engenharia de software',
    softwareSubtitle: 'Sistemas backend, APIs e arquitetura',
    language: 'Idioma do documento',
    previewAction: 'Visualizar currículo',
    downloadAction: 'Baixar currículo (PDF)',
    copyAction: 'Copiar em Markdown',
    copiedSuccess: 'Currículo copiado em Markdown!',
    closeModal: 'Fechar visualização',
    summaryHeading: 'Perfil Profissional',
    experienceHeading: 'Experiência Profissional',
    projectsHeading: 'Projetos em Destaque',
    skillsHeading: 'Competências Técnicas',
    educationHeading: 'Formação Acadêmica',
    certificationsHeading: 'Certificações e Treinamentos',
    present: 'Atual',
    expected: 'Previsão',
    verified: 'Verificar Credencial',
    englishLevel: 'Inglês B2',
  },
}

export function resumeToMarkdown(doc: ResumeDocument, customUi?: ResumeUI): string {
  const ui = customUi ?? DEFAULT_UI[doc.locale] ?? DEFAULT_UI.en
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
      const repo = proj.repositoryUrl ? ` ([Repository](${proj.repositoryUrl}))` : ''
      const badge = proj.badge ? ` _(${proj.badge})_` : ''
      lines.push(`### ${proj.name}${badge}${repo}`)
      lines.push(proj.description)
      lines.push(`**Technologies:** ${proj.technologies.join(', ')}`)
      lines.push('')
    }
  }

  // Skills
  if (doc.skills.length > 0) {
    lines.push(`## ${ui.skillsHeading.toUpperCase()}`)
    for (const group of doc.skills) {
      lines.push(`- **${group.group}:** ${group.items.join(', ')}`)
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

  return lines.join('\n').trim() + '\n'
}

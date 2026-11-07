import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ResumeDocument } from '../src/data/resume/resumeTypes.ts'
import { resumeToMarkdown } from '../src/data/resume/resumeToMarkdown.ts'

const sampleDocument: ResumeDocument = {
  discipline: 'data',
  locale: 'en',
  header: {
    name: 'Mateus Carniel Brambilla',
    tagline: 'Data Engineer | Databricks | Applied AI',
    location: 'Brazil · Remote',
    email: 'mateus@matbdev.com',
    englishLevel: 'English B2',
    links: [
      { label: 'LinkedIn', href: 'https://linkedin.com/in/mateus' },
      { label: 'GitHub', href: 'https://github.com/matbdev' },
    ],
  },
  summary:
    'Data Engineer with production experience in Databricks ecosystem, PySpark, SQL and Delta Lake.',
  experience: [
    {
      id: 'developer',
      role: 'Developer · Backend & Data Engineering',
      company: 'Tramontina Multi S.A.',
      period: 'Nov 2025 — Present',
      summary: 'Production batch pipelines and tooling.',
      highlights: [
        { label: 'Data pipelines', text: 'Built and maintained 20+ batch jobs.' },
        { label: 'Platform & AI', text: 'Reduced LLM cost by 75%.' },
      ],
    },
  ],
  projects: [
    {
      id: 'waterscript',
      name: 'WaterScript',
      badge: 'Challenge 2026',
      description: 'Multimodal geospatial data pipeline.',
      technologies: ['Python', 'Snowflake', 'STAC'],
      repositoryUrl: 'https://github.com/matbdev/waterscript',
    },
  ],
  skills: [
    {
      group: 'Data Engineering',
      items: ['Python', 'PySpark', 'SQL', 'Delta Lake'],
    },
  ],
  education: [
    {
      id: 'univates',
      degree: "Bachelor's in Software Engineering",
      institution: 'Univates',
      period: '2025 — 2028',
      description: 'Undergraduate degree focusing on software and data engineering.',
    },
  ],
  certifications: [
    {
      id: 'gcp-ace',
      name: 'Associate Cloud Engineer',
      issuer: 'Google Cloud',
      verifyUrl: 'https://credly.com/badge/example',
    },
  ],
  courses: [
    {
      id: 'ccna',
      name: 'CCNA 1 & 2',
      provider: 'Cisco Networking Academy',
    },
  ],
  staticPdfUrl: '/assets/resumes/cv_data_eng_mateus_en.pdf',
}

test('resumeToMarkdown generates structured markdown with headers and links', () => {
  const md = resumeToMarkdown(sampleDocument)

  // Header assertions
  assert.ok(md.includes('# MATEUS CARNIEL BRAMBILLA'))
  assert.ok(md.includes('**Data Engineer | Databricks | Applied AI**'))
  assert.ok(md.includes('[mateus@matbdev.com](mailto:mateus@matbdev.com)'))
  assert.ok(md.includes('[LinkedIn](https://linkedin.com/in/mateus)'))
  assert.ok(md.includes('[GitHub](https://github.com/matbdev)'))

  // Section headers
  assert.ok(md.includes('## PROFESSIONAL PROFILE'))
  assert.ok(md.includes('## PROFESSIONAL EXPERIENCE'))
  assert.ok(md.includes('## FEATURED PROJECTS'))
  assert.ok(md.includes('## TECHNICAL SKILLS'))
  assert.ok(md.includes('## ACADEMIC BACKGROUND'))
  assert.ok(md.includes('## CERTIFICATIONS & TRAINING'))

  // Experience formatting
  assert.ok(
    md.includes(
      '### Developer · Backend & Data Engineering — Tramontina Multi S.A. | Nov 2025 — Present',
    ),
  )
  assert.ok(md.includes('- **Data pipelines:** Built and maintained 20+ batch jobs.'))

  // Projects formatting
  assert.ok(
    md.includes(
      '### WaterScript _(Challenge 2026)_ ([Repository](https://github.com/matbdev/waterscript))',
    ),
  )
  assert.ok(md.includes('**Technologies:** Python, Snowflake, STAC'))

  // Skills formatting
  assert.ok(md.includes('- **Data Engineering:** Python, PySpark, SQL, Delta Lake'))

  // Education & Certifications formatting
  assert.ok(md.includes("Bachelor's in Software Engineering"))
  assert.ok(md.includes('[Verify Credential](https://credly.com/badge/example)'))
})

test('resumeToMarkdown supports Portuguese localized headings', () => {
  const ptDoc: ResumeDocument = {
    ...sampleDocument,
    locale: 'pt-BR',
    header: {
      ...sampleDocument.header,
      tagline: 'Engenheiro de Dados | Databricks | IA Aplicada',
      englishLevel: 'Inglês B2',
    },
  }

  const md = resumeToMarkdown(ptDoc)
  assert.ok(md.includes('## PERFIL PROFISSIONAL'))
  assert.ok(md.includes('## EXPERIÊNCIA PROFISSIONAL'))
  assert.ok(md.includes('## PROJETOS EM DESTAQUE'))
  assert.ok(md.includes('## COMPETÊNCIAS TÉCNICAS'))
  assert.ok(md.includes('## FORMAÇÃO ACADÊMICA'))
  assert.ok(md.includes('## CERTIFICAÇÕES E TREINAMENTOS'))
  assert.ok(md.includes('Inglês B2'))
})

test('resumeToMarkdown handles omitted optional sections without orphaned headers', () => {
  const minimalDoc: ResumeDocument = {
    ...sampleDocument,
    summary: '',
    experience: [],
    projects: [],
    skills: [],
    education: [],
    certifications: [],
    courses: [],
  }

  const md = resumeToMarkdown(minimalDoc)
  assert.ok(md.includes('# MATEUS CARNIEL BRAMBILLA'))
  assert.ok(!md.includes('## PROFESSIONAL PROFILE'))
  assert.ok(!md.includes('## PROFESSIONAL EXPERIENCE'))
  assert.ok(!md.includes('## FEATURED TECHNICAL PROJECTS'))
  assert.ok(!md.includes('## TECHNICAL SKILLS'))
  assert.ok(!md.includes('## ACADEMIC BACKGROUND'))
  assert.ok(!md.includes('## CERTIFICATIONS & TRAINING'))
})

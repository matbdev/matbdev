import type {
  ResumeCertificationItem,
  ResumeCourseItem,
  ResumeDiscipline,
  ResumeDocument,
  ResumeEducationItem,
  ResumeExperienceHighlight,
  ResumeExperienceItem,
  ResumeLocale,
  ResumeProjectItem,
  ResumeSkillGroup,
  ResumeUI,
} from './resumeTypes'

import profileData from '@/data/profile.json'
import experienceData from '@/data/experience.json'
import projectsData from '@/data/projects.json'
import educationData from '@/data/education.json'
import certificationsData from '@/data/certifications.json'
import coursesData from '@/data/courses.json'
import resumesData from '@/data/resumes.json'

interface RawProfile {
  name: string
  email: string
  socials: Array<{ name: string; href: string }>
  content: {
    en?: { location?: string }
    'pt-BR'?: { location?: string }
  }
}

interface RawExperienceDetail {
  id: string
  title: string
  text: string
}

interface RawExperience {
  id: string
  company: string
  startDate: string
  endDate: string | null
  current: boolean
  content: {
    en?: {
      title?: string
      period?: string
      summary?: string
      description?: string
      details?: RawExperienceDetail[]
    }
    'pt-BR'?: {
      title?: string
      period?: string
      summary?: string
      description?: string
      details?: RawExperienceDetail[]
    }
  }
}

interface RawProject {
  id: string
  categories: string[]
  technologies: string[]
  featured: boolean
  links?: { repository?: string; website?: string }
  content: {
    en?: {
      title?: string
      badge?: string
      description?: string
      contribution?: string
    }
    'pt-BR'?: {
      title?: string
      badge?: string
      description?: string
      contribution?: string
    }
  }
}

interface RawEducation {
  id: string
  institution: string
  content: {
    en?: { degree?: string; period?: string; description?: string }
    'pt-BR'?: { degree?: string; period?: string; description?: string }
  }
}

interface RawCertification {
  id: string
  name: string
  issuer: string
  credentialUrl: string
  content: {
    en?: { topic?: string }
    'pt-BR'?: { topic?: string }
  }
}

interface RawCourse {
  id: string
  type: string
  content: {
    en?: { name?: string; provider?: string }
    'pt-BR'?: { name?: string; provider?: string }
  }
}

interface RawResumeEntry {
  id: string
  discipline: ResumeDiscipline
  locale: ResumeLocale
  src: string
  content: {
    en?: { title?: string; tagline?: string; summary?: string }
    'pt-BR'?: { title?: string; tagline?: string; summary?: string }
  }
}

interface RawResumesModule {
  ui?: {
    content?: {
      en?: ResumeUI
      'pt-BR'?: ResumeUI
    }
  }
  resumes: RawResumeEntry[]
}

const rawProfile = (profileData as { profile: RawProfile }).profile
const rawExperience = (experienceData as { experience: RawExperience[] }).experience
const rawProjects = (projectsData as { projects: RawProject[] }).projects
const rawEducation = (educationData as { education: RawEducation[] }).education
const rawCertifications = (certificationsData as { certifications: RawCertification[] })
  .certifications
const rawCourses = (coursesData as { courses: RawCourse[] }).courses
const rawResumesModule = resumesData as unknown as RawResumesModule

export function resolveResumeUI(locale: ResumeLocale): ResumeUI {
  const content = rawResumesModule.ui?.content
  const resolved = locale === 'pt-BR' ? content?.['pt-BR'] : content?.en
  return (
    resolved ?? {
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
    }
  )
}

export function buildResumeDocument(
  discipline: ResumeDiscipline,
  locale: ResumeLocale,
): ResumeDocument {
  const ui = resolveResumeUI(locale)
  const isPt = locale === 'pt-BR'

  // 1. Resolve matching resume metadata entry
  const resumeEntry =
    rawResumesModule.resumes.find(
      (entry) => entry.discipline === discipline && entry.locale === locale,
    ) ?? rawResumesModule.resumes[0]

  const entryContent = isPt ? resumeEntry?.content?.['pt-BR'] : resumeEntry?.content?.en
  const profileLoc = isPt ? rawProfile.content?.['pt-BR'] : rawProfile.content?.en

  const tagline =
    entryContent?.tagline ??
    (discipline === 'data'
      ? isPt
        ? 'Engenheiro de Dados | Databricks | IA Aplicada'
        : 'Data Engineer | Databricks | Applied AI'
      : isPt
        ? 'Engenheiro de Software | Backend | Python & TypeScript'
        : 'Software Engineer | Backend | Python & TypeScript')

  const summary = entryContent?.summary ?? ''
  const staticPdfUrl = resumeEntry?.src ?? `/assets/resumes/cv_${discipline}_eng_mateus_en.pdf`

  // 2. Build Header
  const linkedin = rawProfile.socials.find((s) => s.name === 'LinkedIn')?.href ?? ''
  const github = rawProfile.socials.find((s) => s.name === 'GitHub')?.href ?? ''
  const credly = rawProfile.socials.find((s) => s.name === 'Credly')?.href ?? ''

  const header = {
    name: rawProfile.name,
    tagline,
    location: profileLoc?.location ?? (isPt ? 'Rio Grande do Sul, Brasil' : 'Brazil · Remote'),
    email: rawProfile.email,
    englishLevel: ui.englishLevel,
    links: [
      { label: 'LinkedIn', href: linkedin },
      { label: 'GitHub', href: github },
      { label: 'Credly', href: credly },
    ],
  }

  // 3. Build Professional Experience
  const experience: ResumeExperienceItem[] = rawExperience.map((exp) => {
    const loc = isPt ? exp.content['pt-BR'] : exp.content.en
    const details = loc?.details ?? []

    let highlights: ResumeExperienceHighlight[] = []

    if (exp.id === 'developer') {
      const detailOrder =
        discipline === 'data'
          ? ['data-pipelines', 'platform-ai', 'backend-iot']
          : ['backend-iot', 'platform-ai', 'data-pipelines']

      const mapped: ResumeExperienceHighlight[] = []
      for (const key of detailOrder) {
        const found = details.find((d) => d.id === key)
        if (found) {
          mapped.push({
            label: found.title,
            text: found.text,
          })
        }
      }
      highlights = mapped
    } else if (exp.id === 'trainee') {
      if (loc?.description) {
        highlights = [{ text: loc.description }]
      }
    }

    return {
      id: exp.id,
      role: loc?.title ?? exp.id,
      company: exp.company,
      period: loc?.period ?? '',
      summary: loc?.summary,
      highlights,
    }
  })

  // 4. Build Featured Projects
  const projectIds =
    discipline === 'data'
      ? ['waterscript', 'airmood', 'crongoal']
      : ['crongoal', 'techpro', 'waterscript']

  const projects: ResumeProjectItem[] = []
  for (const id of projectIds) {
    const proj = rawProjects.find((p) => p.id === id)
    if (proj) {
      const loc = isPt ? proj.content['pt-BR'] : proj.content.en
      projects.push({
        id: proj.id,
        name: loc?.title ?? proj.id,
        badge: loc?.badge,
        description: loc?.description ?? '',
        technologies: proj.technologies,
        repositoryUrl: proj.links?.repository,
      })
    }
  }

  // 5. Build Skills groups
  const skills: ResumeSkillGroup[] =
    discipline === 'data'
      ? [
          {
            group: isPt ? 'Engenharia de Dados' : 'Data Engineering',
            items: [
              'Python',
              'PySpark',
              'SQL',
              'Delta Lake',
              'Databricks (Lakeflow/DLT, Unity Catalog)',
              'Apache Airflow 3',
              'Medallion Architecture',
              'Dimensional Modeling',
            ],
          },
          {
            group: isPt ? 'IA Aplicada e Plataforma' : 'Applied AI & Platform',
            items: [
              'Databricks Genie',
              'Databricks SDK',
              'MLflow',
              'LangChain',
              'LLM APIs',
              'Databricks AI Gateway',
              'GitOps',
            ],
          },
          {
            group: isPt ? 'Backend e Bancos de Dados' : 'Backend & Databases',
            items: ['Flask', 'FastAPI', 'Pydantic', 'PostgreSQL', 'SQL Server', 'MongoDB'],
          },
          {
            group: isPt ? 'DevOps e Nuvem' : 'DevOps & Cloud',
            items: [
              'Databricks Asset Bundles',
              'Docker',
              'Linux',
              'Git/GitLab',
              'Google Cloud (ACE)',
            ],
          },
        ]
      : [
          {
            group: isPt ? 'Backend e Linguagens' : 'Backend & Languages',
            items: ['Python', 'TypeScript', 'Node.js', 'Flask', 'Express', 'Pydantic', 'Zod'],
          },
          {
            group: isPt ? 'Bancos de Dados e ORM' : 'Databases & ORM',
            items: ['PostgreSQL', 'Prisma', 'SQL Server', 'MongoDB', 'Delta Lake', 'SQL'],
          },
          {
            group: isPt ? 'Arquitetura e Segurança' : 'Architecture & Security',
            items: ['REST APIs', 'JWT / OAuth2', 'Microservices', 'Docker', 'Caddy'],
          },
          {
            group: isPt ? 'DevOps e Ferramentas' : 'DevOps & Tooling',
            items: ['Google Cloud (ACE)', 'Databricks SDK', 'Linux', 'Git/GitLab', 'CI/CD'],
          },
        ]

  // 6. Build Education
  const education: ResumeEducationItem[] = rawEducation.map((edu) => {
    const loc = isPt ? edu.content['pt-BR'] : edu.content.en
    return {
      id: edu.id,
      degree: loc?.degree ?? '',
      institution: edu.institution,
      period: loc?.period ?? '',
      description: loc?.description,
    }
  })

  // 7. Build Certifications
  const certifications: ResumeCertificationItem[] = rawCertifications.map((cert) => {
    const loc = isPt ? cert.content['pt-BR'] : cert.content.en
    return {
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      topic: loc?.topic,
      verifyUrl: cert.credentialUrl,
    }
  })

  // 8. Build Courses
  const courses: ResumeCourseItem[] = rawCourses.map((c) => {
    const loc = isPt ? c.content['pt-BR'] : c.content.en
    return {
      id: c.id,
      name: loc?.name ?? '',
      provider: loc?.provider ?? '',
    }
  })

  return {
    discipline,
    locale,
    header,
    summary,
    experience,
    projects,
    skills,
    education,
    certifications,
    courses,
    staticPdfUrl,
  }
}

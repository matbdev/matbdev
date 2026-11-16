import type {
  ResumeDiscipline,
  ResumeDocument,
  ResumeExperienceHighlight,
  ResumeLocale,
  ResumeProjectItem,
  ResumeSkillGroup,
  ResumeUI,
} from './resumeTypes.ts'
import profileData from '../profile.json' with { type: 'json' }
import experienceData from '../experience.json' with { type: 'json' }
import projectsData from '../projects.json' with { type: 'json' }
import educationData from '../education.json' with { type: 'json' }
import certificationsData from '../certifications.json' with { type: 'json' }
import coursesData from '../courses.json' with { type: 'json' }
import resumesData from '../resumes.json' with { type: 'json' }

type Localized<T> = Record<ResumeLocale, T>

interface ResumeVariant {
  experience: {
    id: string
    content: Localized<{ role?: string; highlights: ResumeExperienceHighlight[] }>
  }[]
  projects: {
    id: string
    content: Localized<Pick<ResumeProjectItem, 'name' | 'description' | 'highlights'>>
  }[]
  skills: Localized<ResumeSkillGroup[]>
}

const { profile } = profileData
const { settings, sharedSkills, awards, resumes, ui } = resumesData
const variants: Record<ResumeDiscipline, ResumeVariant> = resumesData.variants

export function resolveResumeUI(locale: ResumeLocale): ResumeUI {
  return ui.content[locale]
}

export function formatResumeSkillGroup(group: ResumeSkillGroup): string {
  return group.items.join(group.separator ?? ', ')
}

function requireRecord<T extends { id: string }>(items: T[], id: string, kind: string): T {
  const item = items.find((entry) => entry.id === id)
  if (!item) throw new Error(`Unknown résumé ${kind}: ${id}`)
  return item
}

export function buildResumeDocument(
  discipline: ResumeDiscipline,
  locale: ResumeLocale,
): ResumeDocument {
  const resume = resumes.find((entry) => entry.discipline === discipline && entry.locale === locale)
  if (!resume) throw new Error(`Missing résumé: ${discipline}/${locale}`)

  const variant = variants[discipline]
  const { tagline, summary } = resume.content[locale]

  return {
    discipline,
    locale,
    header: {
      name: profile.name,
      tagline,
      location: profile.content[locale].location,
      email: profile.email,
      englishLevel: resolveResumeUI(locale).englishLevel,
      links: settings.socials.map((name) => {
        const social = profile.socials.find((item) => item.name === name)
        if (!social) throw new Error(`Unknown résumé social profile: ${name}`)
        return { label: social.name, href: social.href }
      }),
    },
    summary,
    experience: variant.experience.map(({ id, content }) => {
      const source = requireRecord(experienceData.experience, id, 'experience')
      const { role, highlights } = content[locale]
      return {
        id,
        role: role ?? source.content[locale].title,
        company: source.company,
        period: source.content[locale].period,
        highlights,
      }
    }),
    projects: variant.projects.map(({ id, content }) => {
      const source = projectsData.projects.find((project) => project.id === id)
      return {
        id,
        ...content[locale],
        technologies: source?.technologies ?? [],
        repositoryUrl: source?.links.repository,
      }
    }),
    skills: [...variant.skills[locale], ...sharedSkills.map((group) => group[locale])],
    education: educationData.education.map((item) => ({
      id: item.id,
      institution: item.institution,
      degree: item.content[locale].degree,
      period: item.content[locale].period,
      description: item.content[locale].description,
    })),
    certifications: settings.certificationIds.map((id) => {
      const item = requireRecord(certificationsData.certifications, id, 'certification')
      return {
        id,
        name: item.name,
        issuer: item.issuer,
        verifyUrl: item.credentialUrl,
      }
    }),
    courses: settings.courseIds.map((id) => {
      const { content } = requireRecord(coursesData.courses, id, 'course')
      return { id, ...content[locale] }
    }),
    awards: awards[discipline][locale],
    pdfUrl: resume.src,
  }
}

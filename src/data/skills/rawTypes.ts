/**
 * Shapes of the generated JSON files (`metadata/*.yml → src/data/*.json`)
 * used by the Skills section. Only the fields we actually read are typed.
 */
import type { HighlightKind, SkillContextId, SkillsUiCopy } from './types'

export interface Localized<T> {
  en: T
  'pt-BR': T
}

// --- skills.yml --------------------------------------------------------------

export interface RawSkillCategory {
  id: string
  content: Localized<{ label: string }>
}

export interface RawSkillContext {
  id: SkillContextId
  icon: string
  content: Localized<{ label: string; description?: string }>
}

export interface RawHighlightRef {
  kind: HighlightKind
  id: string
  /** Only for `experience`: which `details[].id` to feature. */
  detailId?: string
}

export interface RawSkillSnippet {
  language: string
  file: string
  code: string
}

export interface RawSkillItem {
  id: string
  name: string
  context: SkillContextId
  category?: string
  categories?: string[]
  enabled?: boolean
  highlight?: RawHighlightRef
  highlights?: RawHighlightRef[]
  synapses?: string[]
  snippet?: RawSkillSnippet
  content: Localized<{ usage: string; name?: string }>
}

export interface RawSkillsModule {
  skills: {
    categories?: RawSkillCategory[]
    contexts: RawSkillContext[]
    items: RawSkillItem[]
    ui: { content: Localized<SkillsUiCopy> }
  }
}

// --- projects.yml ------------------------------------------------------------

export interface RawProjectContent {
  title: string
  subtitle: string
  context: string
  badge: string
  description: string
  problem: string
  contribution: string
  detailContext: string
  diagram: string[]
}

export interface RawProject {
  id: string
  technologies: string[]
  categories?: string[]
  organizationId?: string
  links: { repository?: string; website?: string }
  media:
    | { type: 'image'; src: string; width: number; height: number; alt: Localized<string> }
    | { type: 'concept'; variant: string; label: Localized<string> }
  content: Localized<RawProjectContent>
}

// --- experience.yml ----------------------------------------------------------

export interface RawExperienceDetail {
  id: string
  title: string
  text: string
}

export interface RawExperienceContent {
  title: string
  period: string
  summary: string
  description?: string
  details?: RawExperienceDetail[]
}

export interface RawExperience {
  id: string
  company: string
  technologies?: string[]
  content: Localized<RawExperienceContent>
}

// --- certifications.yml ------------------------------------------------------

export interface RawCertification {
  id: string
  name: string
  issuer: string
  image: string
  credentialUrl: string
  technologies?: string[]
  content: Localized<{ topic: string }>
}

// --- organizations.yml -------------------------------------------------------

export interface RawOrganization {
  id: string
  name: string
  links: { github?: string; portfolio?: string }
}

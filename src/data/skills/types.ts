/**
 * View models consumed by the Skills section components.
 *
 * Raw YAML shapes live in `rawTypes.ts`; everything here is already localized
 * and ready to render, so components never deal with locales or foreign keys.
 */

export type SkillContextId = 'professional' | 'projects' | 'learning'

export type HighlightKind = 'project' | 'experience' | 'certification'

export type HighlightLinkKind =
  'repository' | 'website' | 'organization' | 'credential' | 'linkedin'

export interface SkillCategory {
  id: string
  label: string
}

export interface SkillContext {
  id: SkillContextId
  icon: string
  label: string
  description?: string
}

export interface HighlightLink {
  kind: HighlightLinkKind
  label: string
  href: string
}

/** A titled paragraph shown inside the details dialog. */
export interface HighlightBlock {
  label: string
  text: string
}

export type HighlightMedia =
  | {
      type: 'image'
      src: string
      alt: string
      width?: number
      height?: number
      /** `cover` for screenshots, `contain` for badges/logos. */
      fit: 'cover' | 'contain'
    }
  | {
      /** Authored visual (no real screenshot available). */
      type: 'concept'
      label: string
      steps: string[]
      /** Step rendered as "current" (e.g. the featured detail of an experience). */
      activeStep?: string
    }

/** The work shown beside the carousel for the skill in focus. */
export interface SkillHighlight {
  /** Unique per rendered card: changes only when the highlighted work changes. */
  key: string
  kind: HighlightKind
  kindLabel: string
  title: string
  subtitle: string
  /** Short line under the title (e.g. event, company · period, issuer). */
  meta: string
  badge?: string
  summary: string
  media: HighlightMedia
  technologies: string[]
  blocks: HighlightBlock[]
  flow: string[]
  links: HighlightLink[]
}

export interface SkillSnippet {
  language: string
  file: string
  code: string
}

export interface Skill {
  id: string
  name: string
  usage: string
  context: SkillContext
  category: string
  categories: string[]
  highlight: SkillHighlight
  highlights: SkillHighlight[]
  synapses?: string[]
  snippet?: SkillSnippet
}

/** Interface copy for the section, read from `skills.yml → ui`. */
export interface SkillsUiCopy {
  eyebrow: string
  carouselLabel: string
  previousSkill: string
  nextSkill: string
  interactionHint: string
  categoriesLabel?: string
  contextsLabel: string
  usageLabel: string
  highlightLabel: string
  otherProjectsLabel?: string
  synapsesLabel?: string
  terminalLabel?: string
  emptyCategoryNotice?: string
  resetCategoryButton?: string
  openDetails: string
  closeDetails: string
  relatedSkills: string
  kinds: Record<HighlightKind, string>
  blocks: {
    problem: string
    contribution: string
    context: string
    summary: string
    moreFromRole: string
    topic: string
  }
  flowLabel: string
  links: Record<HighlightLinkKind, string>
}

export interface SkillsSectionCopy {
  title: string
  introduction: string
}

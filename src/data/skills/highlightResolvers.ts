/**
 * Turns a highlight reference from `skills.yml` into a ready-to-render
 * `SkillHighlight`, reading the referenced record from its own module.
 *
 *   project       → projects.yml (+ organizations.yml for team links)
 *   experience    → experience.yml (one `details[]` entry is featured)
 *   certification → certifications.yml
 *
 * Every resolver is a pure function of (reference, locale, ui copy).
 */
import certificationsData from '@/data/certifications.json'
import experienceData from '@/data/experience.json'
import organizationsData from '@/data/organizations.json'
import profileData from '@/data/profile.json'
import projectsData from '@/data/projects.json'
import { resolveImageAsset } from '@/data/imageAssets'
import type { Locale } from '@/state/locale'
import type {
  Localized,
  RawCertification,
  RawExperience,
  RawHighlightRef,
  RawOrganization,
  RawProject,
} from './rawTypes'
import type {
  HighlightBlock,
  HighlightLink,
  HighlightLinkKind,
  HighlightMedia,
  SkillHighlight,
  SkillsUiCopy,
} from './types'

export interface ResolveOptions {
  locale: Locale
  ui: SkillsUiCopy
}

// --- Indexed sources ---------------------------------------------------------

function indexById<T extends { id: string }>(records: T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]))
}

const projectsById = indexById(projectsData.projects as RawProject[])
const experienceById = indexById(experienceData.experience as RawExperience[])
const certificationsById = indexById(certificationsData.certifications as RawCertification[])
const organizationsById = indexById(organizationsData.organizations as RawOrganization[])

const linkedinHref = profileData.profile.socials.find((social) => social.icon === 'linkedin')?.href

// --- Small helpers -----------------------------------------------------------

export function pick<T>(localized: Localized<T>, locale: Locale): T {
  return localized[locale] ?? localized.en
}

/** Drops blocks without text so optional YAML fields never render empty headings. */
function withText(blocks: HighlightBlock[]): HighlightBlock[] {
  return blocks.filter((block) => block.text?.trim())
}

/** Builds labelled links, skipping the ones without a URL. */
function buildLinks(
  ui: SkillsUiCopy,
  entries: Array<[HighlightLinkKind, string | undefined]>,
): HighlightLink[] {
  return entries
    .filter((entry): entry is [HighlightLinkKind, string] => Boolean(entry[1]))
    .map(([kind, href]) => ({ kind, href, label: ui.links[kind] }))
}

// --- Resolvers ---------------------------------------------------------------

function resolveProject(ref: RawHighlightRef, { locale, ui }: ResolveOptions) {
  const project = projectsById.get(ref.id)
  if (!project) return undefined

  const copy = pick(project.content, locale)
  const organization = project.organizationId
    ? organizationsById.get(project.organizationId)
    : undefined

  const highlight: SkillHighlight = {
    key: `project:${project.id}`,
    kind: 'project',
    kindLabel: ui.kinds.project,
    title: copy.title,
    subtitle: copy.subtitle,
    meta: copy.context,
    badge: copy.badge,
    summary: copy.description,
    media: resolveProjectMedia(project, locale),
    technologies: project.technologies,
    blocks: withText([
      { label: ui.blocks.problem, text: copy.problem },
      { label: ui.blocks.contribution, text: copy.contribution },
      { label: ui.blocks.context, text: copy.detailContext },
    ]),
    flow: copy.diagram ?? [],
    links: buildLinks(ui, [
      ['repository', project.links.repository],
      ['website', project.links.website],
      ['organization', organization?.links.github],
    ]),
  }
  return highlight
}

function resolveProjectMedia(project: RawProject, locale: Locale): HighlightMedia {
  const copy = pick(project.content, locale)
  const media = project.media

  if (media.type === 'image') {
    const src = resolveImageAsset(media.src)
    if (src) {
      return {
        type: 'image',
        src,
        alt: pick(media.alt, locale),
        width: media.width,
        height: media.height,
        fit: 'cover',
      }
    }
  }

  // Concept media, or a screenshot that is not bundled: fall back to the authored flow.
  const label = media.type === 'concept' ? pick(media.label, locale) : copy.title
  return { type: 'concept', label, steps: copy.diagram ?? [] }
}

function resolveExperience(ref: RawHighlightRef, { locale, ui }: ResolveOptions) {
  const experience = experienceById.get(ref.id)
  if (!experience) return undefined

  const copy = pick(experience.content, locale)
  const details = copy.details ?? []
  const featured = details.find((detail) => detail.id === ref.detailId)
  const otherDetails = details.filter((detail) => detail !== featured)

  const highlight: SkillHighlight = {
    key: `experience:${experience.id}:${featured?.id ?? 'overview'}`,
    kind: 'experience',
    kindLabel: ui.kinds.experience,
    title: featured?.title ?? copy.title,
    subtitle: copy.title,
    meta: `${experience.company} · ${copy.period}`,
    summary: featured?.text ?? copy.description ?? copy.summary,
    media: {
      type: 'concept',
      label: experience.company,
      steps: details.map((detail) => detail.title),
      activeStep: featured?.title,
    },
    technologies: experience.technologies ?? [],
    blocks: withText([
      { label: ui.blocks.summary, text: copy.summary },
      ...otherDetails.map((detail) => ({
        label: `${ui.blocks.moreFromRole} · ${detail.title}`,
        text: detail.text,
      })),
    ]),
    flow: [],
    links: buildLinks(ui, [['linkedin', linkedinHref]]),
  }
  return highlight
}

function resolveCertification(ref: RawHighlightRef, { locale, ui }: ResolveOptions) {
  const certification = certificationsById.get(ref.id)
  if (!certification) return undefined

  const copy = pick(certification.content, locale)
  const badgeSrc = resolveImageAsset(certification.image)

  const highlight: SkillHighlight = {
    key: `certification:${certification.id}`,
    kind: 'certification',
    kindLabel: ui.kinds.certification,
    title: certification.name,
    subtitle: copy.topic,
    meta: certification.issuer,
    summary: '',
    media: badgeSrc
      ? { type: 'image', src: badgeSrc, alt: certification.name, fit: 'contain' }
      : { type: 'concept', label: certification.issuer, steps: [] },
    technologies: certification.technologies ?? [],
    blocks: withText([{ label: ui.blocks.topic, text: copy.topic }]),
    flow: [],
    links: buildLinks(ui, [['credential', certification.credentialUrl]]),
  }
  return highlight
}

const resolvers = {
  project: resolveProject,
  experience: resolveExperience,
  certification: resolveCertification,
} satisfies Record<SkillHighlight['kind'], unknown>

/** Resolves any highlight reference; returns `undefined` when the target id does not exist. */
export function resolveHighlight(
  ref: RawHighlightRef,
  options: ResolveOptions,
): SkillHighlight | undefined {
  return resolvers[ref.kind]?.(ref, options)
}

/** Identifies the highlighted record regardless of which detail is featured. */
export function highlightTargetKey(ref: RawHighlightRef): string {
  return `${ref.kind}:${ref.id}`
}

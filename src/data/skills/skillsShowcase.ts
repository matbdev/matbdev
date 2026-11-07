/**
 * Localized, reactive data for the Skills section.
 *
 * Reads `skills.yml` (+ `sections.yml` for the heading) and resolves every
 * skill's highlights. All exports are `computed`, so they update automatically
 * when `currentLocale` changes.
 */
import { computed } from 'vue'
import sectionsData from '@/data/sections.json'
import skillsData from '@/data/skills.json'
import { currentLocale } from '@/state/locale'
import { highlightTargetKey, pick, resolveHighlight } from './highlightResolvers'
import type { RawHighlightRef, RawSkillItem, RawSkillsModule } from './rawTypes'
import type { Skill, SkillCategory, SkillContext, SkillsSectionCopy, SkillsUiCopy } from './types'

const skillsModule = (skillsData as unknown as RawSkillsModule).skills

const enabledItems = skillsModule.items.filter((item) => item.enabled !== false)

export const skillsUi = computed<SkillsUiCopy>(() =>
  pick(skillsModule.ui.content, currentLocale.value),
)

export const skillsSectionCopy = computed<SkillsSectionCopy>(() =>
  pick(sectionsData.sections.skills.content, currentLocale.value),
)

export const skillCategories = computed<SkillCategory[]>(() => {
  const cats = skillsModule.categories ?? []
  return cats.map((cat) => ({
    id: cat.id,
    label: pick(cat.content, currentLocale.value).label,
  }))
})

export const skillContexts = computed<SkillContext[]>(() =>
  skillsModule.contexts.map((context) => ({
    id: context.id,
    icon: context.icon,
    ...pick(context.content, currentLocale.value),
  })),
)

export const skills = computed<Skill[]>(() => {
  const locale = currentLocale.value
  const ui = skillsUi.value
  const contextsById = new Map(skillContexts.value.map((context) => [context.id, context]))

  // Localized skill names grouped by the target record they highlight (e.g. `experience:developer`)
  const localizedNamesByTarget = new Map<string, string[]>()
  for (const item of enabledItems) {
    const copy = pick(item.content, locale)
    const localizedName = copy.name ?? item.name
    const refs: RawHighlightRef[] = item.highlights ?? (item.highlight ? [item.highlight] : [])
    for (const ref of refs) {
      const key = highlightTargetKey(ref)
      const group = localizedNamesByTarget.get(key)
      if (group) {
        if (!group.includes(localizedName)) group.push(localizedName)
      } else {
        localizedNamesByTarget.set(key, [localizedName])
      }
    }
  }

  return enabledItems.flatMap((item): Skill[] => {
    const context = contextsById.get(item.context)
    if (!context) {
      warnBrokenReference(item, `Context "${item.context}" not found`)
      return []
    }

    const rawRefs: RawHighlightRef[] = item.highlights ?? (item.highlight ? [item.highlight] : [])
    const resolvedHighlights = rawRefs.flatMap((ref) => {
      const resolved = resolveHighlight(ref, { locale, ui })
      if (!resolved) {
        warnBrokenReference(item, `Highlight "${ref.kind}:${ref.id}" could not be resolved`)
        return []
      }
      if (resolved.technologies.length === 0) {
        resolved.technologies = localizedNamesByTarget.get(highlightTargetKey(ref)) ?? []
      }
      return [resolved]
    })

    if (resolvedHighlights.length === 0) {
      return []
    }

    const copy = pick(item.content, locale)
    const categories = item.categories ?? (item.category ? [item.category] : ['all'])
    const category = item.category ?? categories[0] ?? 'all'

    return [
      {
        id: item.id,
        name: copy.name ?? item.name,
        usage: copy.usage,
        context,
        category,
        categories,
        highlight: resolvedHighlights[0]!,
        highlights: resolvedHighlights,
        synapses: item.synapses ?? [],
        snippet: item.snippet,
      },
    ]
  })
})

function warnBrokenReference(item: RawSkillItem, reason: string) {
  if (!import.meta.env.DEV) return
  console.warn(`[skills] "${item.id}" warning: ${reason} in metadata/skills.yml.`)
}

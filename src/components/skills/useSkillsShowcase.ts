import { computed, ref, watch, type Ref } from 'vue'
import type { Skill, SkillHighlight } from '@/data/skills/types'

/** Local state for one showcase; data and localization remain owned by the caller. */
export function useSkillsShowcase(skills: Readonly<Ref<readonly Skill[]>>) {
  const activeCategory = ref('all')
  const selectedIndex = ref(0)
  const isDialogOpen = ref(false)
  const selectedHighlightKey = ref<string | null>(null)

  const filteredSkills = computed(() => {
    const cat = activeCategory.value
    const list = skills.value
    if (cat === 'all') return list
    return list.filter(
      (s) =>
        s.categories.includes(cat) ||
        s.category === cat ||
        (cat === 'certifications' && s.highlights.some((h) => h.kind === 'certification')),
    )
  })

  const activeSkill = computed(() => {
    const list = filteredSkills.value
    if (list.length === 0) return undefined
    const safeIdx = Math.max(0, Math.min(list.length - 1, selectedIndex.value))
    return list[safeIdx]
  })

  const selectedHighlight = computed(() => {
    if (!selectedHighlightKey.value || !activeSkill.value) return null
    return (
      activeSkill.value.highlights.find((item) => item.key === selectedHighlightKey.value) ??
      activeSkill.value.highlight
    )
  })

  watch(activeSkill, (skill) => {
    if (!skill) handleCloseDetails()
  })

  // Reset index when category filter changes or skill list changes
  watch(filteredSkills, (list) => {
    if (selectedIndex.value >= list.length) {
      selectedIndex.value = 0
    }
  })

  function handleSelectCategory(catId: string) {
    activeCategory.value = catId
    selectedIndex.value = 0
  }

  function handleSelectSkill(index: number) {
    selectedIndex.value = index
  }

  function handleOpenDetails(highlight: SkillHighlight) {
    selectedHighlightKey.value = highlight.key
    isDialogOpen.value = true
  }

  function handleSelectHighlightInDialog(highlight: SkillHighlight) {
    selectedHighlightKey.value = highlight.key
  }

  function handleCloseDetails() {
    isDialogOpen.value = false
    selectedHighlightKey.value = null
  }

  return {
    activeCategory,
    selectedIndex,
    isDialogOpen,
    selectedHighlight,
    filteredSkills,
    activeSkill,
    handleSelectCategory,
    handleSelectSkill,
    handleOpenDetails,
    handleSelectHighlightInDialog,
    handleCloseDetails,
  }
}

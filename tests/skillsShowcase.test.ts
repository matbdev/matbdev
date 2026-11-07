import assert from 'node:assert/strict'
import { test } from 'node:test'
import { effectScope, nextTick, ref } from 'vue'
import type { Skill, SkillHighlight } from '../src/data/skills/types.ts'
import { useSkillsShowcase } from '../src/components/skills/useSkillsShowcase.ts'

const project: SkillHighlight = {
  key: 'project:example',
  kind: 'project',
  kindLabel: 'Project',
  title: 'Example',
  subtitle: '',
  meta: '',
  summary: '',
  media: { type: 'concept', label: 'Example', steps: [] },
  technologies: [],
  blocks: [],
  flow: [],
  links: [],
}

function skill(id: string, overrides: Partial<Skill> = {}): Skill {
  return {
    id,
    name: id,
    usage: '',
    context: { id: 'projects', icon: 'code', label: 'Projects' },
    category: 'web',
    categories: ['web'],
    highlight: project,
    highlights: [project],
    ...overrides,
  }
}

function setup(items: Skill[]) {
  const source = ref(items)
  const scope = effectScope()
  const state = scope.run(() => useSkillsShowcase(source))!
  return { source, scope, state }
}

test('filters by multiple categories, legacy category and certification evidence', () => {
  const certification = { ...project, key: 'certification:example', kind: 'certification' as const }
  const { scope, state } = setup([
    skill('python', { categories: ['data', 'system'], category: 'data' }),
    skill('legacy', { categories: [], category: 'system' }),
    skill('airflow', { highlights: [project, certification] }),
  ])
  try {
    state.handleSelectCategory('system')
    assert.deepEqual(
      state.filteredSkills.value.map((item) => item.id),
      ['python', 'legacy'],
    )
    state.handleSelectCategory('certifications')
    assert.deepEqual(
      state.filteredSkills.value.map((item) => item.id),
      ['airflow'],
    )
    state.handleSelectCategory('all')
    assert.equal(state.filteredSkills.value.length, 3)
  } finally {
    scope.stop()
  }
})

test('changing category selects its first skill and empty categories have no active skill', () => {
  const { scope, state } = setup([skill('vue'), skill('python', { categories: ['data'] })])
  try {
    state.handleSelectSkill(1)
    assert.equal(state.activeSkill.value?.id, 'python')
    state.handleSelectCategory('web')
    assert.equal(state.selectedIndex.value, 0)
    assert.equal(state.activeSkill.value?.id, 'vue')
    state.handleSelectCategory('missing')
    assert.equal(state.activeSkill.value, undefined)
    state.handleSelectCategory('all')
    assert.equal(state.activeSkill.value, state.filteredSkills.value[0])
  } finally {
    scope.stop()
  }
})

test('shrinking reactive data resets an out-of-range selection', async () => {
  const { source, scope, state } = setup([skill('vue'), skill('python')])
  try {
    state.handleSelectSkill(1)
    source.value = [skill('typescript')]
    await nextTick()
    assert.equal(state.selectedIndex.value, 0)
    assert.equal(state.activeSkill.value?.id, 'typescript')
    source.value = []
    await nextTick()
    assert.equal(state.activeSkill.value, undefined)
  } finally {
    scope.stop()
  }
})

test('opening and switching details retains the chosen highlight until close', () => {
  const second = { ...project, key: 'project:second', title: 'Second' }
  const { scope, state } = setup([skill('vue', { highlights: [project, second] })])
  try {
    state.handleOpenDetails(second)
    assert.equal(state.isDialogOpen.value, true)
    assert.equal(state.selectedHighlight.value?.key, 'project:second')
    state.handleSelectHighlightInDialog(project)
    assert.equal(state.selectedHighlight.value?.key, 'project:example')
    state.handleCloseDetails()
    assert.equal(state.isDialogOpen.value, false)
    assert.equal(state.selectedHighlight.value, null)
  } finally {
    scope.stop()
  }
})

test('an open highlight follows localized reactive data while retaining its key', async () => {
  const { source, scope, state } = setup([skill('vue')])
  try {
    state.handleOpenDetails(project)
    source.value = [
      skill('vue', {
        highlight: { ...project, title: 'Exemplo' },
        highlights: [{ ...project, title: 'Exemplo' }],
      }),
    ]
    await nextTick()
    assert.equal(state.isDialogOpen.value, true)
    assert.equal(state.selectedHighlight.value?.key, 'project:example')
    assert.equal(state.selectedHighlight.value?.title, 'Exemplo')
  } finally {
    scope.stop()
  }
})

test('removing all skills closes details and clears the selected highlight', async () => {
  const { source, scope, state } = setup([skill('vue')])
  try {
    state.handleOpenDetails(project)
    source.value = []
    await nextTick()
    assert.equal(state.isDialogOpen.value, false)
    assert.equal(state.selectedHighlight.value, null)
  } finally {
    scope.stop()
  }
})

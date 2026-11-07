import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import projectsData from '../src/data/projects.json' with { type: 'json' }
import sectionsData from '../src/data/sections.json' with { type: 'json' }

describe('Projects Data Module & Highlights', () => {
  it('has exactly 3 projects marked with highlight: true', () => {
    const highlighted = projectsData.projects.filter((p) => Boolean(p.highlight))
    assert.equal(
      highlighted.length,
      3,
      'Must have at most and exactly 3 featured highlight projects',
    )

    const ids = highlighted.map((p) => p.id)
    assert.ok(ids.includes('crongoal'))
    assert.ok(ids.includes('airmood'))
    assert.ok(ids.includes('waterscript'))
  })

  it('provides complete bilingual content and repository links for highlighted projects', () => {
    const highlighted = projectsData.projects.filter((p) => Boolean(p.highlight))

    for (const project of highlighted) {
      assert.ok(project.content.en.title, `Project ${project.id} missing en title`)
      assert.ok(project.content['pt-BR']?.title, `Project ${project.id} missing pt-BR title`)
      assert.ok(project.content.en.subtitle, `Project ${project.id} missing en subtitle`)
      assert.ok(project.content['pt-BR']?.subtitle, `Project ${project.id} missing pt-BR subtitle`)
      assert.ok(project.content.en.problem, `Project ${project.id} missing en problem`)
      assert.ok(project.content['pt-BR']?.problem, `Project ${project.id} missing pt-BR problem`)
      assert.ok(project.content.en.contribution, `Project ${project.id} missing en contribution`)
      assert.ok(
        project.content['pt-BR']?.contribution,
        `Project ${project.id} missing pt-BR contribution`,
      )

      assert.ok(project.links?.repository, `Project ${project.id} missing repository link`)
      assert.ok(
        project.links.repository.startsWith('https://github.com/'),
        `Project ${project.id} repository link must point to GitHub`,
      )
    }
  })

  it('includes valid viewAll and githubUrl in projects section copy', () => {
    const projectsSection = sectionsData.sections.projects.content
    assert.ok(projectsSection)
    assert.equal(projectsSection.en.githubUrl, 'https://github.com/matbdev')
    assert.equal(projectsSection['pt-BR']?.githubUrl, 'https://github.com/matbdev')
    assert.ok(projectsSection.en.viewAll)
    assert.ok(projectsSection['pt-BR']?.viewAll)
  })
})

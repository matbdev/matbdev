import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from 'yaml'
import { resumeToMarkdown } from '../src/data/resume/resumeToMarkdown.ts'
import { buildResumeDocument, resolveResumeUI } from '../src/data/resume/buildResumeDocument.ts'

test('all four résumé variants take their skills, projects and recognition from YAML', async () => {
  const yaml = parse(await readFile(new URL('../metadata/resumes.yml', import.meta.url), 'utf8'))
  for (const discipline of ['data', 'software'] as const) {
    for (const locale of ['en', 'pt-BR'] as const) {
      const document = buildResumeDocument(discipline, locale)
      const variant = yaml.variants[discipline]
      const source = yaml.resumes.find(
        (entry: { discipline: string; locale: string }) =>
          entry.discipline === discipline && entry.locale === locale,
      )
      assert.deepEqual(document.skills, [
        ...variant.skills[locale],
        ...yaml.sharedSkills.map((group: Record<string, unknown>) => group[locale]),
      ])
      assert.deepEqual(
        document.projects.map((project) => project.id),
        variant.projects.map((project: { id: string }) => project.id),
      )
      assert.deepEqual(document.awards, yaml.awards[discipline][locale])
      assert.equal(document.pdfUrl, source.src)
      assert.match(resumeToMarkdown(document, resolveResumeUI(locale)), /Global Nominee/u)
    }
  }
})

test('each configured download is generated as an A4 PDF', async () => {
  const { createResumePdfs } = await import('../scripts/resumePdf.ts')
  const yaml = parse(await readFile(new URL('../metadata/resumes.yml', import.meta.url), 'utf8'))
  const expected = yaml.resumes.map((entry: { src: string }) => entry.src)
  const pdfs = await createResumePdfs()
  assert.deepEqual([...pdfs.keys()], expected)
  for (const pdf of pdfs.values()) {
    const bytes = pdf.toString('latin1')
    assert.match(bytes, /^%PDF-/u)
    assert.match(bytes, /\/StructTreeRoot/u)
    assert.match(bytes, /\/MediaBox \[0 0 595.28 841.89\]/u)
    assert.match(bytes, /\/BaseFont \/\w+\+Arimo/u)
  }
})

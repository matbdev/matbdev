import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import data from '../src/data/portfolio.json' with { type: 'json' }
import { generateProfileReadmes, renderProfileReadme } from '../scripts/profileReadme.ts'

test('profile READMEs use localized facts, credentials and portfolio links', () => {
  for (const locale of ['en', 'pt-BR'] as const) {
    const output = renderProfileReadme(data, locale)
    const text = data.profile.content[locale]
    assert.ok(output.includes(text.introduction))
    assert.ok(output.includes(`https://matbdev.com/${locale}/`))
    assert.ok(output.includes(data.profile.email))
    assert.ok(output.includes(data.education[0]!.content[locale].period))
    for (const certificate of data.certifications) {
      assert.ok(output.includes(certificate.credentialUrl))
    }
    assert.ok(output.includes('PORTFOLIO-README.md'))
    assert.ok(!output.includes('mateuscarnielbrambilla@gmail.com'))
    assert.ok(!output.includes('Cisco Certified Network Associate'))
  }
})

test('profile mascot animates only when motion is allowed and has a localized static fallback', async () => {
  for (const locale of ['en', 'pt-BR'] as const) {
    const output = renderProfileReadme(data, locale)
    assert.ok(output.includes('media="(prefers-reduced-motion: no-preference)"'))
    assert.ok(output.includes(`srcset="${data.profile.readmeMascot.animatedSrc}"`))
    assert.ok(output.includes(`src="${data.profile.readmeMascot.staticSrc}"`))
    assert.ok(output.includes(`alt="${data.profile.content[locale].readme.mascotAlt}"`))
    assert.ok(output.indexOf('<picture>') < output.indexOf('# ' + data.profile.name))
  }
  for (const path of [data.profile.readmeMascot.animatedSrc, data.profile.readmeMascot.staticSrc]) {
    assert.ok((await readFile(new URL(`../${path}`, import.meta.url))).byteLength > 0)
  }
})

test('selection follows metadata flags and preserves source order', () => {
  const fixture = structuredClone(data)
  const snapshot = JSON.stringify(fixture)
  const project = fixture.projects.find((item) => item.highlight)!
  project.highlight = false
  const tool = fixture.skills.items[0]!
  tool.name = 'HiddenTool'
  Object.assign(tool, { enabled: false })
  const output = renderProfileReadme(fixture, 'en')
  assert.ok(!output.includes(`### [${project.content.en.title}]`))
  assert.ok(!output.includes('HiddenTool'))
  assert.notEqual(JSON.stringify(fixture), snapshot)
  const beforeRender = JSON.stringify(fixture)
  renderProfileReadme(fixture, 'pt-BR')
  assert.equal(JSON.stringify(fixture), beforeRender)
})

test('Markdown escapes metadata instead of introducing markup', () => {
  const fixture = structuredClone(data)
  fixture.profile.name = '<script>name</script> [extra]'
  const output = renderProfileReadme(fixture, 'en')
  assert.ok(output.includes('&lt;script&gt;name&lt;/script&gt; \\[extra\\]'))
  assert.ok(!output.includes('<script>'))
})

test('generation reads fresh data on every invocation and writes both languages', async () => {
  const root = await mkdtemp(join(tmpdir(), 'profile-readme-'))
  try {
    await mkdir(join(root, 'src/data'), { recursive: true })
    const fixture = structuredClone(data)
    const source = join(root, 'src/data/portfolio.json')
    await writeFile(source, JSON.stringify(fixture))
    await generateProfileReadmes(root)
    for (const [file, locale] of [
      ['README.md', 'pt-BR'],
      ['README-en.md', 'en'],
    ] as const) {
      assert.equal(await readFile(join(root, file), 'utf8'), renderProfileReadme(fixture, locale))
    }
    fixture.profile.email = 'updated@example.com'
    await writeFile(source, JSON.stringify(fixture))
    await generateProfileReadmes(root)
    for (const file of ['README.md', 'README-en.md']) {
      const output = await readFile(join(root, file), 'utf8')
      assert.ok(output.includes('updated@example.com'))
      assert.ok(!output.includes(data.profile.email))
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('checked-in profile READMEs stay in sync with the generated data', async () => {
  for (const [file, locale] of [
    ['README.md', 'pt-BR'],
    ['README-en.md', 'en'],
  ] as const) {
    assert.equal(
      await readFile(new URL(`../${file}`, import.meta.url), 'utf8'),
      renderProfileReadme(data, locale),
    )
  }
})

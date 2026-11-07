import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getSeo,
  localeFromPath,
  localePath,
  serializeJsonLd,
  structuredData,
} from '../src/data/seo.ts'
import profileData from '../src/data/profile.json' with { type: 'json' }

test('localized URLs remain distinct and resolve with or without a trailing slash', () => {
  for (const locale of ['en', 'pt-BR'] as const) {
    assert.equal(localeFromPath(localePath(locale)), locale)
    assert.equal(localeFromPath(localePath(locale).slice(0, -1)), locale)
    assert.equal(getSeo(locale).url, `https://matbdev.com${localePath(locale)}`)
  }
  assert.equal(localeFromPath('/'), undefined)
  assert.equal(localeFromPath('/projects/'), undefined)
  assert.notEqual(getSeo('en').title, getSeo('pt-BR').title)
})

test('structured data identifies the author and existing projects without claiming completed degrees', () => {
  for (const locale of ['en', 'pt-BR'] as const) {
    const json = structuredData(locale)
    const person = json['@graph'].find((item) => item['@type'] === 'Person')
    assert.equal(person?.name, profileData.profile.name)
    assert.deepEqual(
      person?.sameAs,
      profileData.profile.socials.map((social) => social.href),
    )
    const page = json['@graph'].find((item) => item['@type'] === 'ProfilePage')
    assert.equal(page?.inLanguage, locale)
    assert.equal(page?.url, getSeo(locale).url)
    const serialized = serializeJsonLd(json)
    assert.ok(serialized.includes('CronGoal'))
    assert.ok(serialized.includes('AirMood'))
    assert.ok(serialized.includes('WaterScript'))
    assert.ok(!serialized.includes('alumniOf'))
  }
})

test('JSON-LD cannot break out of its script element', () => {
  const unsafe = { text: '</script><script>alert("test")</script>' }
  const serialized = serializeJsonLd(unsafe)
  assert.ok(!serialized.includes('<'))
  assert.deepEqual(JSON.parse(serialized), unsafe)
})

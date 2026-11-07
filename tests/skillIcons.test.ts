import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { resolveSkillIconKey } from '../src/components/skills/skillIconNames.ts'

test('resolves tool IDs and display names to the same artwork', () => {
  const names = [
    ['Python', 'python'],
    ['PySpark', 'pyspark'],
    ['Apache Spark', 'pyspark'],
    ['SQL', 'sql'],
    ['Databricks', 'databricks'],
    ['Delta Lake', 'delta-lake'],
    ['Unity Catalog', 'unity-catalog'],
    ['Flask', 'flask'],
    ['Docker', 'docker'],
    ['TypeScript', 'typescript'],
    ['Caddy', 'caddy'],
    ['Node.js', 'nodejs'],
    ['Express', 'express'],
    ['PostgreSQL', 'postgresql'],
    ['Prisma', 'prisma'],
    ['JWT/OAuth2', 'jwt-oauth2'],
    ['Snowflake', 'snowflake'],
    ['Apache Airflow', 'airflow'],
    ['Google Cloud', 'google-cloud'],
    ['GCP', 'google-cloud'],
    ['Geospatial modeling', 'geospatial'],
    ['Modelagem geoespacial', 'geospatial'],
    ['NASA Earthdata', 'geospatial'],
  ] as const

  for (const [name, expected] of names) {
    assert.equal(resolveSkillIconKey(name), expected, name)
    assert.equal(resolveSkillIconKey(expected), expected, expected)
  }
  assert.equal(resolveSkillIconKey('  NODE.JS  '), 'nodejs')
})

test('unknown tools use the generic fallback instead of a misleading brand', () => {
  for (const name of ['', 'Unknown SDK', 'Unity game engine', 'Pythonic UI', 'constructor']) {
    assert.equal(resolveSkillIconKey(name), undefined, name)
  }
})

test('every enabled carousel tool resolves to a local WebP asset', async () => {
  const data = JSON.parse(
    await readFile(new URL('../src/data/skills.json', import.meta.url), 'utf8'),
  )
  const items = data.skills.items as Array<{ id: string; enabled?: boolean }>
  for (const item of items.filter((entry) => entry.enabled !== false)) {
    const key = resolveSkillIconKey(item.id)
    assert.ok(key, `No artwork registered for ${item.id}`)
    const asset = await readFile(new URL(`../src/assets/tool-icons/${key}.webp`, import.meta.url))
    assert.equal(asset.toString('ascii', 0, 4), 'RIFF', item.id)
    assert.equal(asset.toString('ascii', 8, 12), 'WEBP', item.id)
  }
})
